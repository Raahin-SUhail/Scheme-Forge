# SchemeForge 🇮🇳

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask_3.0_%7C_Python_3.11-000000?logo=flask)](https://flask.palletsprojects.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Google Gemini](https://img.shields.io/badge/AI_NLU-Google_Gemini_2.5_Flash-8E75B2?logo=google)](https://ai.google.dev/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()

> **SchemeForge** is a grounded, AI-powered discovery platform designed to simplify how Indian citizens search, understand, and apply for government welfare schemes. Powered by Google Gemini NLU, an exact deterministic eligibility engine, and a verified SQLite database of central and state welfare programs.

---

## 🌟 Overview & Purpose

Navigating government welfare schemes in India can be overwhelming. Citizens face complex eligibility criteria, fragmented information across dozens of department portals, and confusing jargon.

**SchemeForge** bridges this gap by offering:
1. **Natural Language Discovery**: Citizens can describe their situation naturally (e.g. *"I am an undergraduate from Tamil Nadu with an annual family income of ₹2 Lakhs"*) without needing to guess exact scheme acronyms.
2. **Strict Database Grounding (RAG)**: AI responses are grounded 100% in a verified SQLite database of government schemes to eliminate AI hallucinations.
3. **Deterministic Eligibility Verification**: Eligibility matching uses a rule-based engine (`PASS`, `FAIL`, `UNKNOWN`) to ensure authoritative qualification scores.
4. **ChatGPT-Style General Chat Mode**: Friendly conversational interaction for general greetings and assistance without unnecessary database calls.

---

## ✨ Key Features

- **🔍 Smart Search & Categorization**: Search across 26+ verified central & state schemes by domain (Agriculture, Education, Housing, Women Welfare, Business, Healthcare, Employment, Senior Citizens).
- **📋 Scheme Detail View**: Complete breakdowns of eligibility requirements, financial aid amounts, required documents, and official `.gov.in`/`.nic.in` application links.
- **⚡ Interactive Eligibility Checker**: Fill out citizen demographic criteria (age, state, income, gender, occupation) to get an instant match score and failed/passed rule breakdowns.
- **📊 Side-by-Side Scheme Comparison**: Compare up to 3 schemes simultaneously across financial benefits, target demographics, and required documentation.
- **🤖 SchemeForge AI Assistant**: Dual-mode conversational assistant that routes general chat naturally while providing grounded scheme answers using Google Gemini.
- **📬 Verified Contact System**: In-app feedback and inquiry routing.

---

## 🏗 System Architecture

```
                               Citizen / Web Browser
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │  React 18 + Vite SPA    │
                            │  (Vercel Production)    │
                            └────────────┬────────────┘
                                         │ REST HTTP/JSON
                                         ▼
                            ┌─────────────────────────┐
                            │    Flask REST API       │
                            │   (Render Production)   │
                            └────────────┬────────────┘
                                         │
       ┌─────────────────────────────────┼─────────────────────────────────┐
       ▼                                 ▼                                 ▼
┌──────────────┐                 ┌──────────────┐                 ┌──────────────────┐
│ Google Gemini│                 │ SQLite DB    │                 │ Deterministic    │
│  NLU Engine  │                 │ Grounded Data│                 │ Eligibility Engine│
└──────────────┘                 └──────────────┘                 └──────────────────┘
```

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18 (Vite SPA)
- **Styling**: Vanilla CSS, Design Tokens, CSS Modules
- **Icons**: Lucide React
- **HTTP Client**: Universal Fetch API wrapper (`src/services/api.js`)

### Backend
- **Framework**: Flask 3.0 (Python 3.11)
- **ORM & DB**: SQLAlchemy 3.1 + SQLite3
- **WSGI Server**: Gunicorn 21.2
- **CORS**: Flask-CORS
- **Environment**: python-dotenv

### AI & NLU Engine
- **LLM Provider**: Google Gemini API (`google-generativeai` SDK)
- **Model**: `gemini-2.5-flash` / `gemini-1.5-flash`
- **Pattern**: Retrieval-Augmented Generation (RAG) + Structured NLU Intent Parser + Deterministic Fallback Engine

---

## 📁 Repository Structure

```
Scheme_Forge_Backend-main/
├── backend/
│   ├── app.py                    # Flask application factory & error handlers
│   ├── config.py                 # Environment configuration & CORS management
│   ├── database.py               # SQLAlchemy database instance binding
│   ├── models.py                 # Scheme, EligibilityRule, SchemeSource models
│   ├── seed.py                   # Automated database seeder (26 schemes)
│   ├── wsgi.py                   # Production WSGI entrypoint for Gunicorn
│   ├── Procfile                  # Render / PaaS deployment configuration
│   ├── requirements.txt          # Python backend dependencies
│   ├── routes/                   # API Blueprint route controllers
│   │   ├── ai.py                 # AI assistant endpoints (/api/ai/assistant)
│   │   ├── schemes.py            # Scheme CRUD & category endpoints
│   │   ├── eligibility.py        # Deterministic match engine routes
│   │   └── contact.py            # Contact submission routes
│   └── services/                 # Core domain service layer
│       ├── ai_service.py         # Gemini API calls, NLU parser & fallback
│       ├── assistant_service.py  # Session memory & AI workflow orchestrator
│       ├── scheme_retrieval.py   # Grounded RAG context builder
│       ├── search_service.py     # SQLite search & query tokenization
│       └── eligibility_engine.py # Deterministic eligibility evaluation engine
├── src/                          # React Frontend Source
│   ├── App.jsx                   # Main layout & router orchestration
│   ├── components/               # Navbar, Footer, SchemeCard, Drawer components
│   ├── pages/                    # Home, Schemes, Details, Compare, Eligibility, Contact
│   └── services/                 # API client wrapper (src/services/api.js)
├── vercel.json                   # Vercel SPA build & route rewrite configuration
├── render.yaml                   # Render backend infrastructure manifest
└── docs/                         # Comprehensive technical documentation
    ├── ARCHITECTURE.md           # Deep architectural specification
    ├── API_DOCUMENTATION.md      # Complete REST API reference
    ├── DATABASE.md               # Database schema & entity relationships
    ├── AI_ARCHITECTURE.md        # Gemini NLU & RAG pipeline guide
    ├── DEPLOYMENT.md             # Production deployment handbook
    ├── CONTRIBUTING.md           # Contribution guidelines
    └── CHANGELOG.md              # Version release history
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.10 or higher
- **Git**

### 1. Clone & Setup Backend
```bash
# Clone the repository
git clone https://github.com/Raahin-SUhail/Scheme-Forge.git
cd Scheme-Forge/backend

# Create virtual environment
python -m venv venv
# Activate on Windows:
venv\Scripts\activate
# Activate on macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env configuration file
cp .env.example .env
```

Edit `backend/.env` to include your Google Gemini API key:
```env
PORT=5000
SECRET_KEY=dev-secret-key
DATABASE_URL=sqlite:///schemeforge.db
CORS_ORIGINS=*
AI_PROVIDER=gemini
AI_API_KEY=your_google_gemini_api_key_here
AI_MODEL=gemini-2.5-flash
```

Run database seeder and start backend server:
```bash
python seed.py
python app.py
# Server running at http://127.0.0.1:5000
```

### 2. Setup Frontend
Open a new terminal in the root directory:
```bash
# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev
# Frontend running at http://localhost:3000
```

---

## 📚 Technical Documentation Directory

| Document | Purpose |
| :--- | :--- |
| 📖 [**ARCHITECTURE.md**](docs/ARCHITECTURE.md) | Deep breakdown of system architecture, flowcharts, security, and scalability. |
| 🔌 [**API_DOCUMENTATION.md**](docs/API_DOCUMENTATION.md) | Complete REST API endpoint reference with JSON payloads and HTTP response codes. |
| 🗄️ [**DATABASE.md**](docs/DATABASE.md) | SQLite schema design, tables, relationships, and rule evaluation matrices. |
| 🤖 [**AI_ARCHITECTURE.md**](docs/AI_ARCHITECTURE.md) | Detailed guide on Gemini NLU, RAG grounding, context safety, and deterministic fallback. |
| 🚢 [**DEPLOYMENT.md**](docs/DEPLOYMENT.md) | Step-by-step production deployment guide for Vercel (Frontend) & Render (Backend). |
| 🤝 [**CONTRIBUTING.md**](docs/CONTRIBUTING.md) | Code of conduct, pull request process, and coding standards. |
| 📜 [**CHANGELOG.md**](docs/CHANGELOG.md) | Initial release history and feature updates. |

---

## 🖼️ Application Screenshots

> *Note: Screenshot placeholders below reflect application interfaces available in production.*

| View | Screenshot Placeholder |
| :--- | :--- |
| **Home Page** | `![Home Page](docs/screenshots/home.png)` |
| **Scheme Directory** | `![Scheme Directory](docs/screenshots/schemes.png)` |
| **Eligibility Checker** | `![Eligibility Checker](docs/screenshots/eligibility.png)` |
| **Scheme Comparison** | `![Compare Tool](docs/screenshots/compare.png)` |
| **AI Assistant Drawer** | `![AI Assistant](docs/screenshots/ai_drawer.png)` |
| **Contact Page** | `![Contact Form](docs/screenshots/contact.png)` |

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

Developed by **Raahin Suhail** & Team  
*SchemeForge — Empowering Citizens Through Accessible Government Welfare Information.*
