import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from app.db import init_indexes, seed_default_data

# Initialize Limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    import re
    # Enable CORS (support credentials for HTTP-only cookies, matching all origins)
    CORS(app, supports_credentials=True, origins=re.compile(r"https?://.*"))

    # Initialize Limiter with App
    limiter.init_app(app)

    # Database index setup & auto-seeding
    with app.app_context():
        init_indexes()
        seed_default_data()

    # Serve uploaded files route
    @app.route('/uploads/<path:filename>')
    def serve_uploads(filename):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        upload_path = os.path.join(base_dir, 'uploads')
        return send_from_directory(upload_path, filename)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.barber_routes import barber_bp
    from app.routes.booking_routes import booking_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.wizard_routes import wizard_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(barber_bp, url_prefix='/api/barber')
    app.register_blueprint(booking_bp, url_prefix='/api/booking')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(wizard_bp, url_prefix='/api/barber/wizard')

    # Basic Health Check
    @app.route('/api/health', methods=['GET'])
    def health():
        return {"status": "healthy", "service": "TrimTime Backend API"}, 200

    return app
