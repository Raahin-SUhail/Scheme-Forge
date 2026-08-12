from sqlalchemy import or_
from database import db
from models import Scheme, SchemeSource
from services.search_service import search_schemes

def retrieve_grounded_schemes(query_text="", state=None, category=None, beneficiary=None, limit=6):
    """
    Retrieve candidate verified scheme records and their associated sources from SQLite database.
    Uses the unified tokenized search engine from search_service.py.
    """
    search_res = search_schemes(
        query_text=query_text,
        state=state,
        category=category,
        beneficiary=beneficiary,
        limit=limit,
        page=1
    )

    candidates = search_res['schemes']

    # Fallback to top active schemes if query was empty OR general discovery request (e.g. "suggest some schemes")
    if not candidates:
        q_clean = (query_text or "").lower()
        is_general_discovery = (
            not query_text 
            or not query_text.strip()
            or any(k in q_clean for k in ['suggest', 'recommend', 'show', 'some', 'any', 'available', 'what', 'list', 'help', 'find', 'get', 'give'])
        )
        
        if is_general_discovery:
            base_q = Scheme.query.filter(Scheme.lifecycle_status == 'ACTIVE')
            if state and state != 'All':
                base_q = base_q.filter(or_(Scheme.state == state, Scheme.state == 'All India'))
            if category and category != 'All':
                base_q = base_q.filter(Scheme.category.ilike(f"%{category}%"))
            candidates = base_q.order_by(
                Scheme.is_featured.desc(), Scheme.is_popular.desc(), Scheme.id.asc()
            ).limit(limit).all()

    grounded_data = []
    for s in candidates:
        scheme_dict = s.to_dict()
        sources = SchemeSource.query.filter_by(scheme_id=s.id).all()
        scheme_dict['sources'] = [src.to_dict() for src in sources]
        grounded_data.append(scheme_dict)

    return grounded_data

def build_llm_grounded_context(schemes):
    """
    Construct concise, token-efficient, factual context block for LLM prompt.
    """
    if not schemes:
        return "No relevant verified government schemes found in the SchemeForge database."

    lines = []
    for idx, s in enumerate(schemes, 1):
        lines.append(f"[{idx}] SCHEME NAME: {s['name']} (Code: {s['schemeCode']})")
        lines.append(f"    Category: {s['category']} | Type: {s['type']} | State: {s['state']}")
        lines.append(f"    Target Beneficiary: {s['beneficiary']} | Dept: {s['department']}")
        lines.append(f"    Short Description: {s['shortDescription']}")
        lines.append(f"    Full Description: {s['fullDescription']}")
        lines.append(f"    Benefits & Aid: {s['subsidyAmount']} - {', '.join(s.get('benefits', []))}")
        
        min_a, max_a = s.get('minAge', 0), s.get('maxAge', 100)
        age_desc = f"{min_a}–{max_a} years" if max_a < 100 else f"Minimum {min_a} years (No structured upper age limit recorded)"

        max_i = s.get('maxIncome', 10000000)
        inc_desc = f"Up to ₹{max_i:,}" if max_i < 10000000 else "No maximum income restriction recorded"

        lines.append(f"    Eligibility Bounds: Age ({age_desc}) | Income ({inc_desc})")
        lines.append(f"    Required Documents: {', '.join(s.get('documentsRequired', []))}")
        lines.append(f"    Application Portal: {s['officialLink']}")
        
        sources = s.get('sources', [])
        if sources:
            src_titles = [f"{src['sourceTitle']} ({src['sourceUrl']})" for src in sources]
            lines.append(f"    Official Provenance Sources: {'; '.join(src_titles)}")
        lines.append("")

    return "\n".join(lines)
