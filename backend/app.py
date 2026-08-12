import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import db

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

    # Auto-create tables and seed database if missing (Production SQLite Auto-Seeding)
    with app.app_context():
        try:
            db.create_all()
            from models import Scheme
            if db.session.query(Scheme).count() == 0:
                logger.info("Initializing and seeding empty database...")
                from seed import seed_database
                seed_database()
        except Exception as e:
            logger.warning(f"Database auto-initialization notice: {e}")

    # Register Blueprints
    from routes.schemes import schemes_bp
    from routes.eligibility import eligibility_bp
    from routes.contact import contact_bp
    from routes.ai import ai_bp

    app.register_blueprint(schemes_bp, url_prefix='/api')
    app.register_blueprint(eligibility_bp, url_prefix='/api')
    app.register_blueprint(contact_bp, url_prefix='/api')
    app.register_blueprint(ai_bp, url_prefix='/api')

    # Global Health Endpoint
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

    # Global Error Handlers
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
