# Changelog

All notable changes to the **SchemeForge** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-12

### Added
- **Grounded AI RAG Architecture**: Integrated Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) for natural language understanding and zero-hallucination grounded responses.
- **Dual-Mode AI Assistant**: Added General Chat Mode for natural small talk and Scheme RAG Mode for grounded scheme discovery.
- **Deterministic Eligibility Engine**: Added exact rule evaluation engine (`PASS`, `FAIL`, `UNKNOWN`) for 26 verified schemes.
- **26 Verified Schemes**: Populated SQLite database with verified central and state welfare programs.
- **Side-by-Side Scheme Comparison**: Added multi-scheme comparison interface across benefits and documentation.
- **Production Deployment Configuration**: Created `vercel.json`, `render.yaml`, `Procfile`, and `wsgi.py` for Vercel + Render production hosting.
- **Comprehensive Documentation Suite**: Added `ARCHITECTURE.md`, `API_DOCUMENTATION.md`, `DATABASE.md`, `AI_ARCHITECTURE.md`, `DEPLOYMENT.md`, and `CONTRIBUTING.md`.
