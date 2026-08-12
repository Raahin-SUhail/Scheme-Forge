import re
from typing import Dict, Any, List
from database import db
from models import Scheme
from services.scheme_retrieval import retrieve_grounded_schemes, build_llm_grounded_context
from services.eligibility_engine import DeterministicEligibilityEngine
from services.ai_service import generate_ai_response, analyze_query_with_gemini, generate_chatgpt_response

# Conversation Context Tracker (In-memory session cache for follow-ups & profile accumulation)
ACTIVE_SESSION_CONTEXT = {}

def process_assistant_message(message: str, user_profile: Dict[str, Any] = None, session_id: str = "default") -> Dict[str, Any]:
    """
    Orchestrate citizen query with Gemini NLU semantic understanding, context memory, and grounded responses.
    """
    if not message or not isinstance(message, str) or not message.strip():
        return {
            "success": False,
            "error": "INVALID_INPUT",
            "message": "Please provide a valid query string."
        }

    clean_msg = message.strip()
    msg_lower = clean_msg.lower()
    
    # Session state initialization
    if session_id not in ACTIVE_SESSION_CONTEXT:
        ACTIVE_SESSION_CONTEXT[session_id] = {'profile': {}, 'last_scheme_code': None}

    session_state = ACTIVE_SESSION_CONTEXT[session_id]
    accumulated_profile = dict(session_state.get('profile', {}))
    if user_profile:
        accumulated_profile.update(user_profile)

    # 1. Semantic Natural Language Understanding (Gemini NLU with fallback)
    gemini_nlu = analyze_query_with_gemini(clean_msg, session_context=session_state)
    
    if gemini_nlu:
        intent = gemini_nlu.get('intent', 'SCHEME_DISCOVERY')
        gemini_prof = gemini_nlu.get('profile', {})
        if gemini_prof and isinstance(gemini_prof, dict):
            for k, v in gemini_prof.items():
                if v is not None and v != "":
                    accumulated_profile[k] = v
        search_keywords = gemini_nlu.get('search_keywords', []) or gemini_nlu.get('search_concepts', [])
        target_scheme_name = gemini_nlu.get('target_scheme_name')
        category_hint = gemini_nlu.get('category_hint') or _detect_category_hint(msg_lower, accumulated_profile)
    else:
        intent = _classify_intent(msg_lower)
        search_keywords = []
        target_scheme_name = None
        category_hint = _detect_category_hint(msg_lower, accumulated_profile)

    # Regex profile signal extraction (complements NLU for basic patterns)
    regex_profile = _extract_profile_signals(clean_msg, accumulated_profile)
    accumulated_profile.update(regex_profile)
    session_state['profile'] = accumulated_profile

    # Missing profile fields tracking
    missing_fields = []
    if intent == 'ELIGIBILITY_CHECK':
        if 'age' not in accumulated_profile: missing_fields.append('age')
        if 'annualIncome' not in accumulated_profile: missing_fields.append('annualIncome')
        if 'state' not in accumulated_profile: missing_fields.append('state')

    # 2. GENERAL_CHAT & GREETING Intent handling (ChatGPT mode - no database search)
    if intent in ['GENERAL_CHAT', 'GREETING']:
        chat_answer, chat_status = generate_chatgpt_response(clean_msg)
        return {
            "success": True,
            "intent": intent,
            "aiStatus": chat_status,
            "answer": chat_answer,
            "schemes": [],
            "sources": [],
            "eligibilityEvaluations": [],
            "extractedProfile": accumulated_profile,
            "needsMoreInformation": False,
            "missingFields": []
        }

    # 3. GENERAL_CAPABILITIES Intent handling
    if intent == 'GENERAL_CAPABILITIES':
        return {
            "success": True,
            "intent": "GENERAL_CAPABILITIES",
            "aiStatus": "DETERMINISTIC_CAPABILITIES",
            "answer": "I am SchemeForge AI. I help citizens discover Indian government schemes, understand eligibility, required documents, benefits, and application procedures. What category or scheme would you like to explore?",
            "schemes": [],
            "sources": [],
            "eligibilityEvaluations": [],
            "extractedProfile": accumulated_profile,
            "needsMoreInformation": False,
            "missingFields": []
        }

    # 4. Follow-up query resolution & search query construction
    last_scheme_code = session_state.get('last_scheme_code')
    search_query = clean_msg
    if target_scheme_name:
        search_query = target_scheme_name
    elif search_keywords and isinstance(search_keywords, list):
        search_query = " ".join(search_keywords)

    if intent in ['DOCUMENT_GUIDANCE', 'APPLICATION_GUIDANCE', 'ELIGIBILITY_CHECK'] and last_scheme_code:
        if not any(k in msg_lower for k in ['pm-kisan', 'nmmss', 'pmay', 'pmmvy', 'kmut', 'ladki', 'abhyudaya', 'sisfs', 'mudra', 'svanidhi']):
            search_query = f"{last_scheme_code} {clean_msg}"

    # 5. Retrieve Candidate Schemes (Database Grounded via Gemini Semantic Concepts)
    target_state = accumulated_profile.get('state')
    candidate_schemes = retrieve_grounded_schemes(
        query_text=search_query,
        state=target_state,
        category=category_hint,
        limit=5
    )

    # If specific semantic concept search yielded 0 results, retry with raw prompt or category hint
    if not candidate_schemes and clean_msg:
        candidate_schemes = retrieve_grounded_schemes(
            query_text=clean_msg,
            state=target_state,
            category=category_hint,
            limit=5
        )

    # Update active session context with top candidate scheme if found
    if candidate_schemes:
        session_state['last_scheme_code'] = candidate_schemes[0]['schemeCode']

    # 6. Handle Out of Scope Queries
    if not candidate_schemes and intent == 'UNKNOWN_OUT_OF_SCOPE':
        return {
            "success": True,
            "intent": "UNKNOWN_OUT_OF_SCOPE",
            "aiStatus": "ZERO_MATCH_NO_FABRICATION",
            "answer": "I'm sorry, I couldn't understand that query. You can ask me about government schemes for farmers, scholarships, housing, healthcare, women welfare, or specific programs like PM-KISAN.",
            "schemes": [],
            "sources": [],
            "eligibilityEvaluations": [],
            "extractedProfile": accumulated_profile,
            "needsMoreInformation": False,
            "missingFields": []
        }

    # 7. Deterministic Eligibility Handoff (AUTHORITATIVE ENGINE)
    eligibility_evaluations = []
    if (intent == 'ELIGIBILITY_CHECK' or _has_sufficient_profile(accumulated_profile)) and candidate_schemes:
        normalized_profile = DeterministicEligibilityEngine.normalize_profile(accumulated_profile)
        for s in candidate_schemes:
            scheme_obj = db.session.get(Scheme, s['id'])
            if scheme_obj:
                eval_res = DeterministicEligibilityEngine.evaluate_scheme(scheme_obj, normalized_profile)
                elig_info = eval_res.get('eligibility', {})
                eval_item = {
                    "schemeId": s['id'],
                    "schemeName": s['name'],
                    "status": elig_info.get('status', 'POTENTIALLY_ELIGIBLE'),
                    "overallStatus": elig_info.get('status', 'POTENTIALLY_ELIGIBLE'),
                    "matchScore": elig_info.get('matchScore', 0),
                    "passedRules": elig_info.get('passedRules', []),
                    "failedRules": elig_info.get('failedRules', []),
                    "unknownRules": elig_info.get('unknownRules', [])
                }
                eligibility_evaluations.append(eval_item)

    # 8. Build Grounded LLM Context
    grounded_context = build_llm_grounded_context(candidate_schemes)
    if eligibility_evaluations:
        eval_lines = ["\n=== AUTHORITATIVE DETERMINISTIC ELIGIBILITY RESULTS ==="]
        for ev in eligibility_evaluations:
            eval_lines.append(f"Scheme: {ev['schemeName']} | Result: {ev['overallStatus']} (Match Score: {ev['matchScore']}%)")
            if ev['passedRules']: eval_lines.append(f"  Passed Rules: {', '.join([r.get('ruleName', '') for r in ev['passedRules']])}")
            if ev['failedRules']: eval_lines.append(f"  FAILED Rules: {', '.join([r.get('ruleName', '') + ' (' + r.get('reason', '') + ')' for r in ev['failedRules']])}")
            if ev['unknownRules']: eval_lines.append(f"  Unknown Rules: {', '.join([r.get('ruleName', '') for r in ev['unknownRules']])}")
        grounded_context += "\n" + "\n".join(eval_lines)

    # 9. Generate Natural Conversational Response via Gemini / Fallback
    prompt_for_ai = f"User Intent: {intent}\nUser Query: {clean_msg}\nInferred Citizen Profile: {accumulated_profile}"
    ai_answer, ai_status = generate_ai_response(prompt_for_ai, grounded_context, intent=intent, candidate_schemes=candidate_schemes)

    # Gather Provenance Sources
    all_sources = []
    for s in candidate_schemes:
        for src in s.get('sources', []):
            if not any(existing['sourceUrl'] == src['sourceUrl'] for existing in all_sources):
                all_sources.append(src)

    return {
        "success": True,
        "intent": intent,
        "aiStatus": ai_status,
        "answer": ai_answer,
        "schemes": candidate_schemes,
        "sources": all_sources[:3],
        "eligibilityEvaluations": eligibility_evaluations,
        "extractedProfile": accumulated_profile,
        "needsMoreInformation": len(missing_fields) > 0,
        "missingFields": missing_fields,
        "disclaimer": "SchemeForge helps interpret official scheme information. Final eligibility and benefit disbursement are determined by the responsible government authority."
    }

def _classify_intent(msg: str) -> str:
    greetings = ['hi', 'hello', 'hey', 'good morning', 'good evening', 'good afternoon', 'namaste', 'greetings', 'hi there', 'how are you', 'who are you', 'thank you', 'thanks']
    if msg in greetings or any(msg.startswith(g + ' ') for g in greetings) or msg.rstrip('!.') in greetings:
        return 'GENERAL_CHAT'

    if any(k in msg for k in ['what can you do', 'how does schemeforge work', 'can you help me', 'what is schemeforge']):
        return 'GENERAL_CAPABILITIES'

    if any(k in msg for k in ['eligible', 'qualify', 'can i get', 'can i apply', 'am i eligible']):
        return 'ELIGIBILITY_CHECK'

    if any(k in msg for k in ['document', 'documents', 'proof', 'certificate', 'papers needed']):
        return 'DOCUMENT_GUIDANCE'

    if any(k in msg for k in ['how to apply', 'application process', 'where to apply', 'portal']):
        return 'APPLICATION_GUIDANCE'

    if any(k in msg for k in ['what is', 'explain', 'tell me about', 'details of', 'everything about']):
        return 'SPECIFIC_SCHEME'

    if any(k in msg for k in ['suggest', 'recommend', 'schemes for', 'find schemes', 'search', 'show me', 'list', 'i am a farmer', 'i need', 'scholarship', 'pension', 'loan', 'what schemes']):
        return 'SCHEME_DISCOVERY'

    if len(msg) < 3 and not msg.isalnum():
        return 'UNKNOWN_OUT_OF_SCOPE'
    if re.search(r'^(?:[b-df-hj-np-tv-z]{5,})$', msg):
        return 'UNKNOWN_OUT_OF_SCOPE'

    return 'SCHEME_DISCOVERY'

def _detect_category_hint(msg: str, profile: Dict[str, Any] = None) -> str:
    prof = profile or {}
    if prof.get('isFarmer') or 'farm' in msg or 'kisan' in msg or 'crop' in msg: return 'Agriculture'
    if prof.get('isStudent') or 'student' in msg or 'education' in msg or 'school' in msg or 'college' in msg or 'scholarship' in msg: return 'Education'
    if prof.get('gender') == 'Female' or 'women' in msg or 'female' in msg or 'girl' in msg or 'mother' in msg or 'lady' in msg: return 'Women'
    if 'house' in msg or 'home' in msg or 'awas' in msg: return 'Housing'
    if prof.get('occupation') in ['Business', 'Business Owner', 'business'] or 'business' in msg or 'startup' in msg or 'vendor' in msg or 'loan' in msg or 'credit' in msg: return 'Business'
    if 'health' in msg or 'medical' in msg or 'hospital' in msg: return 'Healthcare'
    if prof.get('occupation') == 'Unemployed' or prof.get('isUnemployed') or 'job' in msg or 'work' in msg or 'employ' in msg or 'nrega' in msg: return 'Employment'
    if (prof.get('age') and prof.get('age') >= 60) or 'senior' in msg or 'pension' in msg or 'elderly' in msg or 'old age' in msg: return 'Senior Citizens'
    return 'All'

def _extract_profile_signals(raw_msg: str, initial_profile: Dict[str, Any]) -> Dict[str, Any]:
    prof = dict(initial_profile)
    msg = raw_msg.lower()

    state_mappings = {
        'tamil nadu': 'Tamil Nadu', 'tn': 'Tamil Nadu',
        'uttar pradesh': 'Uttar Pradesh', 'up': 'Uttar Pradesh',
        'delhi': 'Delhi', 'nct delhi': 'Delhi',
        'gujarat': 'Gujarat', 'odisha': 'Odisha', 'karnataka': 'Karnataka',
        'kerala': 'Kerala', 'maharashtra': 'Maharashtra', 'rajasthan': 'Rajasthan'
    }
    for alias, st_name in state_mappings.items():
        if re.search(r'\b' + re.escape(alias) + r'\b', msg):
            prof['state'] = st_name

    if re.search(r'\b(?:not|non|never)\s+(?:a\s+)?farmer\b', msg):
        prof['isFarmer'] = False
    elif re.search(r'\b(?:farmer|kisan|agriculture|cultivator)\b', msg):
        prof['isFarmer'] = True

    if re.search(r'\b(?:not|non|never)\s+(?:a\s+)?student\b', msg):
        prof['isStudent'] = False
    elif re.search(r'\b(?:student|college|school|university|studying)\b', msg):
        prof['isStudent'] = True

    if re.search(r'\b(?:woman|female|girl|mother|lady)\b', msg):
        prof['gender'] = 'Female'
    elif re.search(r'\b(?:man|male|boy|father|gentleman)\b', msg) and not re.search(r'\bwoman|female\b', msg):
        prof['gender'] = 'Male'

    if re.search(r'\b(?:pilot)\b', msg):
        prof['occupation'] = 'Pilot'
    elif re.search(r'\b(?:unemployed|jobless)\b', msg):
        prof['occupation'] = 'Unemployed'
        prof['isUnemployed'] = True
    elif re.search(r'\b(?:salaried|employee|working)\b', msg):
        prof['occupation'] = 'Salaried'

    age_match = re.search(r'\b(?:i\s+am|age|aged)?\s*(\d{1,2})\s*(?:years?\s+old|yrs?\s+old|yr|year|years|yrs)?\b', msg)
    if age_match:
        try:
            val = int(age_match.group(1))
            if 14 <= val <= 100 and val not in [20, 30, 40, 50, 60, 70, 80, 90]:
                prof['age'] = val
        except ValueError:
            pass

    income_val = _parse_indian_currency(raw_msg)
    if income_val is not None:
        prof['annualIncome'] = income_val

    return prof

def _parse_indian_currency(msg: str) -> Any:
    m = msg.lower()
    lakh_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|lac|lacs)\b', m)
    if lakh_match:
        try:
            return int(float(lakh_match.group(1)) * 100000)
        except ValueError:
            pass
    return None

def _has_sufficient_profile(p: Dict[str, Any]) -> bool:
    return any(k in p for k in ['age', 'annualIncome', 'state', 'gender', 'isFarmer', 'isStudent', 'occupation', 'isUnemployed'])
