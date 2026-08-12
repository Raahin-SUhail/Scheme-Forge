import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv('PORT', 5000))
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///schemeforge.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    cors_env = os.getenv('CORS_ORIGINS', '*').strip()
    if cors_env == '*' or not cors_env:
        CORS_ORIGINS = '*'
    else:
        CORS_ORIGINS = [o.strip() for o in cors_env.split(',') if o.strip()]

    SECRET_KEY = os.getenv('SECRET_KEY', 'schemeforge-production-secret-key-2026')
