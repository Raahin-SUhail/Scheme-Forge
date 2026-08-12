# SchemeForge — AI & Grounded NLU Architecture

This document provides a comprehensive technical breakdown of the AI Assistant in **SchemeForge**, detailing how Google Gemini is integrated with Retrieval-Augmented Generation (RAG) and deterministic rule execution.

---

## 1. High-Level AI Design Principles

1. **Dual-Mode Intent Routing**:
   - **General Chat Mode**: Conversational queries (`"Hi"`, `"How are you?"`, `"Who are you?"`, `"Thank you"`) bypass database retrieval and receive warm, natural responses directly from Gemini.
   - **Scheme RAG Mode**: Government scheme queries trigger Gemini NLU intent classification and profile extraction to query SQLite verified records.
2. **Strict Grounding & Zero Hallucination**:
   - Factual scheme information originates exclusively from SQLite database records passed in Gemini's prompt (`=== GROUNDED SCHEME DATABASE CONTEXT ===`).
   - If a requested scheme or detail is not present in the database, Gemini is explicitly instructed to state that the information is unavailable.
3. **Authoritative Eligibility Handoff**:
   - Eligibility rules are evaluated by `DeterministicEligibilityEngine`, NOT guessed by Gemini.
   - Exact rule results (`PASS`, `FAIL`, `UNKNOWN`) and match scores are provided to Gemini to explain in natural conversational Markdown without altering decision logic.

---

## 2. Gemini NLU & Profile Signal Extraction

When a user submits a query, `analyze_query_with_gemini()` invokes Gemini with a specialized system prompt (`NLU_SYSTEM_PROMPT`) to parse the input into structured JSON:

```json
{
  "intent": "SCHEME_DISCOVERY",
  "target_scheme_name": null,
  "category_hint": "Education",
  "search_keywords": ["student", "scholarship", "higher education"],
  "profile": {
    "state": "Tamil Nadu",
    "annualIncome": 200000,
    "occupation": "student",
    "isStudent": true,
    "gender": null,
    "age": null
  }
}
```

### Profile Extraction Mapping Examples
- `"I am an undergraduate"` / `"doing my bachelor's"` ──► `isStudent: true`, `occupation: "student"`, Category: `"Education"`
- `"I grow crops for a living"` ──► `isFarmer: true`, `occupation: "farmer"`, Category: `"Agriculture"`
- `"I am between jobs"` ──► `isUnemployed: true`, `occupation: "unemployed"`, Category: `"Employment"`
- `"I need somewhere affordable to live"` ──► Category: `"Housing"`, Search Concepts: `["Housing", "PMAY", "Awas"]`

---

## 3. SQLite Database Retrieval Pipeline

1. The extracted `search_keywords` and `category_hint` are passed to `retrieve_grounded_schemes()`.
2. Tokenized search and category filtering query the SQLite database (`schemes` and `scheme_sources` tables).
3. If the user mentions an unmapped profession (e.g. `"I am a pilot"`):
   - SQLite search identifies 0 pilot-specific schemes.
   - The retrieval engine falls back to fetching top broad welfare schemes (loans, housing, financial inclusion).
   - Gemini responds naturally: `"I couldn't find any scheme specifically designed for pilots. However, based on your profile, here are some broader government schemes that may still be useful..."`

---

## 4. Model Candidate Fallback Architecture

To ensure high availability, `ai_service.py` implements automated model candidate failover:

```python
candidate_models = [primary_model, "gemini-1.5-flash", "gemini-1.5-pro"]
for m in candidate_models:
    try:
        model = genai.GenerativeModel(model_name=m, system_instruction=SYSTEM_PROMPT)
        response = model.generate_content(prompt)
        if response and response.text:
            return response.text.strip(), "GEMINI_SUCCESS"
    except Exception as ex:
        if "404" in str(ex) or "NotFound" in str(ex):
            continue
        raise ex
```

If Gemini API is completely unavailable or unconfigured, the system automatically falls back to `_fallback_grounded_generator()`, formatting verified database records in natural Markdown without crashing.
