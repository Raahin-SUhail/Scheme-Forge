import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    PORT = int(os.getenv('PORT', 5000))
    
    # Process DATABASE_URL to guarantee clean, valid SQLite absolute paths
    raw_db_url = os.getenv('DATABASE_URL', '').strip()
    if not raw_db_url:
        default_db_path = os.path.join(BASE_DIR, 'instance', 'schemeforge.db')
        os.makedirs(os.path.dirname(default_db_path), exist_ok=True)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{default_db_path}"
    elif raw_db_url.startswith('sqlite:///') and not raw_db_url.startswith('sqlite:////'):
        rel_path = raw_db_url[len('sqlite:///'):]
        if not os.path.isabs(rel_path):
            abs_db_path = os.path.abspath(os.path.join(BASE_DIR, rel_path))
            os.makedirs(os.path.dirname(abs_db_path), exist_ok=True)
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{abs_db_path}"
        else:
            SQLALCHEMY_DATABASE_URI = raw_db_url
    else:
        SQLALCHEMY_DATABASE_URI = raw_db_url

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    cors_env = os.getenv('CORS_ORIGINS', '*').strip()
    if cors_env == '*' or not cors_env:
        CORS_ORIGINS = '*'
    else:
        CORS_ORIGINS = [o.strip() for o in cors_env.split(',') if o.strip()]

    SECRET_KEY = os.getenv('SECRET_KEY', 'schemeforge-production-secret-key-2026')
