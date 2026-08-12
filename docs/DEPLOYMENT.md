# SchemeForge — Production Deployment Guide

Complete step-by-step deployment guide for hosting **SchemeForge** using **Vercel** for the React frontend and **Render** for the Flask Python backend.

---

## 1. Environment Variables Overview

### Backend Environment Variables (`backend/.env` / Render Dashboard)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | Port bound by Flask / Gunicorn |
| `SECRET_KEY` | **Required** | `schemeforge-sec` | Session and Flask security key |
| `DATABASE_URL` | Optional | `sqlite:///schemeforge.db` | SQLAlchemy connection URI |
| `CORS_ORIGINS` | **Required in Prod** | `*` | Allowed origins (e.g. `https://schemeforge.vercel.app`) |
| `AI_PROVIDER` | **Required** | `gemini` | AI Provider (`gemini`, `openai`, `fallback`) |
| `AI_API_KEY` | **Required for AI** | `""` | Google Gemini API Key from AI Studio |
| `AI_MODEL` | Optional | `gemini-2.5-flash` | Gemini model name |

### Frontend Environment Variables (`.env` / Vercel Dashboard)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Required in Prod** | `http://127.0.0.1:5000/api` | Production URL of deployed Flask backend |

---

## 2. Deploying Backend to Render

1. Create a free account on [Render.com](https://render.com/).
2. Click **New +** ──► **Web Service**.
3. Connect your GitHub repository (`Scheme-Forge`).
4. Configure service settings:
   - **Name**: `schemeforge-backend`
   - **Region**: Oregon (US West) or Singapore
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn wsgi:app`
5. Under **Environment Variables**, add:
   - `AI_PROVIDER` = `gemini`
   - `AI_API_KEY` = `<YOUR_GEMINI_API_KEY>`
   - `AI_MODEL` = `gemini-2.5-flash`
   - `CORS_ORIGINS` = `https://schemeforge.vercel.app`
   - `SECRET_KEY` = `<GENERATE_RANDOM_KEY>`
6. Click **Create Web Service**. Render will build the image, initialize the SQLite database, run `seed.py` automatically, and output your backend URL (`https://schemeforge-backend.onrender.com`).

---

## 3. Deploying Frontend to Vercel

1. Create a free account on [Vercel.com](https://vercel.com/).
2. Click **Add New...** ──► **Project**.
3. Import your GitHub repository (`Scheme-Forge`).
4. Framework Preset will auto-detect as **Vite**.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://schemeforge-backend.onrender.com/api`
6. Click **Deploy**. Vercel will compile static React assets (`npm run build`) and output your live production URL (`https://schemeforge.vercel.app`).

---

## 4. Verifying Production Deployment

1. Test API Health:  
   Open `https://schemeforge-backend.onrender.com/api/health` in your browser. Expected response:
   ```json
   {
     "status": "healthy",
     "service": "SchemeForge REST API",
     "aiProvider": "gemini",
     "aiConfigured": true
   }
   ```
2. Open Frontend App:  
   Navigate to `https://schemeforge.vercel.app`. Verify that scheme cards, categories, eligibility checker, search, and AI assistant drawer work online seamlessly.
