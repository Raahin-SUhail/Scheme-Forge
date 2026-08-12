import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db

# Configure structured logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize database extension
    db.init_app(app)

    # Initialize CORS for frontend domain(s)
    origins = app.config['CORS_ORIGINS']
    if origins == '*':
        CORS(app, resources={r"/api/*": {"origins": "*"}})
    else:
        CORS(app, resources={r"/api/*": {"origins": origins}})

    # Step 1: Import all SQLAlchemy models BEFORE db.create_all() so metadata contains all tables
    import models
    from models import Scheme

    # Step 2: Auto-create tables and seed database if missing (Production SQLite Auto-Seeding)
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables initialized")

            scheme_count = db.session.query(Scheme).count()
            logger.info(f"Database contains {scheme_count} schemes")

            if scheme_count == 0:
                logger.info("Database is empty. Starting seed process...")
                from seed import seed_database
                seed_database(app=app)
                seeded_count = db.session.query(Scheme).count()
                logger.info(f"Database seeded with {seeded_count} schemes")
        except Exception as e:
            logger.error(f"Failed to initialize SQLite database: {e}", exc_info=True)
            raise e

    # Step 3: Register Blueprints
    from routes.schemes import schemes_bp
    from routes.eligibility import eligibility_bp
    from routes.contact import contact_bp
    from routes.ai import ai_bp

    app.register_blueprint(schemes_bp, url_prefix='/api')
    app.register_blueprint(eligibility_bp, url_prefix='/api')
    app.register_blueprint(contact_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api')

    # Step 4: Global Health Endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        ai_provider = os.getenv('AI_PROVIDER', 'fallback')
        ai_configured = bool(os.getenv('AI_API_KEY', '').strip())
        return jsonify({
            "status": "healthy",
            "service": "SchemeForge REST API",
            "aiProvider": ai_provider,
            "aiConfigured": ai_configured
        }), 200

    # Step 5: Global Error Handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"success": False, "error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "error": "Resource Not Found", "message": str(error)}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "error": "Internal Server Error", "message": "An unexpected error occurred."}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=False)
