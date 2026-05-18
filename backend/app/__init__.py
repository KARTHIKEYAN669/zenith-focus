from flask import Flask, send_from_directory, jsonify
import os
import logging
from logging.handlers import RotatingFileHandler

from app.config import Config
from app.extensions import db, jwt, cors, limiter, talisman, migrate, swagger

# Configure Logging with structured format
class ContextFilter(logging.Filter):
    def filter(self, record):
        from flask import has_request_context, request
        record.client_ip = request.remote_addr if has_request_context() else '0.0.0.0'
        return True

handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s [%(name)s] [%(filename)s:%(lineno)d] [IP: %(client_ip)s] - %(message)s'))
handler.addFilter(ContextFilter())

root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
# Remove existing handlers to avoid duplicates
for h in root_logger.handlers[:]:
    root_logger.removeHandler(h)
root_logger.addHandler(handler)

def create_app(config_class=Config):
    # Configure static files for frontend
    frontend_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'frontend')
    app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
    app.config.from_object(config_class)
    
    # Configure Swagger route
    app.config['SWAGGER'] = {
        'title': 'Nexus AI API',
        'uiversion': 3,
        'openapi': '3.0.0'
    }

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)
    talisman.init_app(app, force_https=False)
    migrate.init_app(app, db)
    swagger.init_app(app)

    # Register Blueprints
    from app.routes.auth import bp as auth_bp
    from app.routes.admin import bp as admin_bp
    from app.routes.history import bp as history_bp
    from app.routes.predict import bp as predict_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(predict_bp, url_prefix='/api/predict')

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app
