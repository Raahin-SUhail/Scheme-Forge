# SchemeForge — Technical Architecture Specification

This document provides a deep architectural overview of the **SchemeForge** platform, detailing its decoupled frontend-backend model, database design, deterministic eligibility engine, and Gemini-powered Natural Language Understanding (NLU) RAG pipeline.

---

## 1. System Overview & Architecture Model

SchemeForge uses a modern, decoupled architecture split into three core layers:
1. **Frontend Presentation Layer**: A React 18 Single Page Application (SPA) built with Vite and hosted on Vercel.
2. **Orchestration & Business Logic Layer**: A Flask REST API built with Python 3.11, SQLAlchemy 3.1, and Gunicorn, hosted on Render.
3. **Intelligence & Verification Engines**:
   - **Google Gemini 2.5 Flash / 1.5 Flash**: Semantic query interpretation, structured profile extraction, and natural-language grounded generation.
   - **SQLite Database**: Verified government scheme repository (26+ schemes).
   - **Deterministic Eligibility Engine**: Exact rule evaluation engine (`PASS`, `FAIL`, `UNKNOWN`) that operates authoritatively without LLM hallucination.

```
+-----------------------------------------------------------------------+
|                         Frontend (React 18 SPA)                       |
|  - Home / Hero       - Search & Filters     - Scheme Detail Modal     |
|  - Categories        - Compare Schemes      - AI Assistant Drawer     |
+-----------------------------------┬-----------------------------------+
                                    |
                                    | REST HTTP / JSON APIs
                                    v
+-----------------------------------------------------------------------+
|                         Backend (Flask 3.0 API)                       |
|  - CORS Security     - Route Blueprints     - Session Context Store   |
+---------┬─────────────────────────┬─────────────────────────┬---------+
          |                         |                         |
          v                         v                         v
+-------------------+     +-------------------+     +-------------------+
|  Google Gemini    |     | SQLite Database   |     | Deterministic     |
|  NLU & RAG Engine |     | Schemes & Sources |     | Eligibility Engine|
+-------------------+     +-------------------+     +-------------------+
```

---

## 2. Frontend Architecture (React + Vite)

### Architecture Highlights
- **Vite Build Infrastructure**: Lightning-fast hot module replacement (HMR) and optimized rollup production bundles (`dist/assets/`).
- **Single Page Application (SPA) Routing**: Dynamic state-driven page views (`Home`, `Schemes`, `SchemeDetails`, `EligibilityChecker`, `Compare`, `Contact`) orchestrated cleanly without bloat.
- **Universal API Layer (`src/services/api.js`)**: Encapsulates `fetch` calls with sanitized `VITE_API_BASE_URL` resolution, query parameter serialization, and standardized error handling.
- **Global Design System**: CSS variables and tokens defined in `src/styles/index.css` supporting dark glassmorphism, responsive dynamic layouts, and modern typography.

---

## 3. Backend Architecture (Flask REST API)

### Blueprint Separation
The Flask backend is structured into modular Blueprints located in `backend/routes/`:
- `schemes_bp` (`/api/schemes`, `/api/categories`, `/api/stats`): Scheme retrieval, category filtering, keyword search, and detail lookup.
- `eligibility_bp` (`/api/find-schemes`, `/api/schemes/<id>/check-eligibility`): Deterministic eligibility calculation routes.
- `contact_bp` (`/api/contact`): Form submissions and message verification.
- `ai_bp` (`/api/ai/assistant`): Conversational AI assistant drawer orchestration.

---

## 4. Grounded RAG & AI Pipeline

```
Citizen Query ──► Gemini NLU Parser ──► SQLite Scheme DB ──► Deterministic Engine ──► Grounded LLM Response
                  ("I grow crops")      (Filter: Farmer)     (Evaluate Rules)        (Markdown Format)
```

1. **Query Intent & Profile Extraction**:
   - Query parsed via `analyze_query_with_gemini()`.
   - Returns structured intent (`SCHEME_DISCOVERY`, `GENERAL_CHAT`, etc.), profile signals (`state`, `age`, `income`, `isFarmer`, `isStudent`, `occupation`), and semantic search keywords.
2. **SQLite Database Grounding**:
   - `retrieve_grounded_schemes()` retrieves matching verified records from SQLite.
   - Information not present in the DB is explicitly acknowledged as unavailable.
3. **Deterministic Eligibility Handoff**:
   - `DeterministicEligibilityEngine` evaluates exact rule logic (`age`, `income`, `state`, `gender`, `occupation`).
   - Results (`PASS`/`FAIL`/`UNKNOWN`) are passed into Gemini's grounded context block.
4. **Natural Grounded Output**:
   - Gemini generates human-friendly Markdown response adhering strictly to SQLite database truth.

---

## 5. Security & Protection Principles

1. **Server-Side API Key Isolation**: The Gemini API key (`AI_API_KEY`) is stored strictly in `backend/.env` and read server-side via `python-dotenv`. It is never transmitted to the browser.
2. **CORS Origin Restricting**: `Flask-CORS` configures `CORS_ORIGINS` to allow requests only from authorized production frontend domains.
3. **Input Sanitization & Injection Defense**: System prompts enforce strict grounding, preventing prompt injection or override attempts.

---

## 6. Scalability & Operational Characteristics

- **Stateless API Design**: Session context is maintained in memory per `session_id`, making the backend easily scalable to redis-backed distributed context.
- **Production Server Readiness**: Uses `gunicorn` with worker-thread threading model for high concurrency.
