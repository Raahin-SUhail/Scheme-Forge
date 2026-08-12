# Contributing to SchemeForge 🇮🇳

Thank you for your interest in contributing to **SchemeForge**! We welcome contributions from open-source developers, data annotators, frontend engineers, and policy researchers to help make government scheme discovery easier for every Indian citizen.

---

## Code of Conduct

Please maintain a respectful, inclusive, and constructive environment in all issues, pull requests, and discussions.

---

## How to Contribute

### 1. Reporting Bugs
If you find a bug or error in scheme data/eligibility logic:
1. Open a GitHub Issue using the **Bug Report** template.
2. Describe the expected vs actual behavior.
3. Provide steps to reproduce and system details.

### 2. Adding New Government Schemes
To add a new verified government scheme to the SQLite dataset:
1. Edit `backend/schemes_seed.json`.
2. Include official government sources (`.gov.in`/`.nic.in` links only).
3. Ensure accurate eligibility bounds (`minAge`, `maxAge`, `maxIncome`, `state`).

### 3. Submitting Pull Requests
1. Fork the repository and create a feature branch:
   ```bash
   git checkout -b feature/add-new-scheme
   ```
2. Make your modifications adhering to existing formatting.
3. Run backend unit tests:
   ```bash
   cd backend
   python -m pytest tests/
   ```
4. Verify frontend build:
   ```bash
   npm run build
   ```
5. Submit a Pull Request describing your changes clearly.

---

## Coding Standards

- **Python**: PEP 8 style guidelines. Include descriptive docstrings for new API endpoints or services.
- **JavaScript/React**: Functional React components using hooks. Maintain clean design system tokens defined in `src/styles/index.css`.
- **Security**: NEVER commit API keys, `.env` files, or secrets into git.
