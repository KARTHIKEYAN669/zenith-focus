from flask import Flask, send_from_directory, jsonify
import os

from app.config import Config
from app.extensions import db, jwt, cors, limiter
from flask_jwt_extended import unset_jwt_cookies

def create_app(config_class=Config):
    frontend_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'frontend')
    app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    limiter.init_app(app)

    # JWT Error Handlers for Debugging
    @jwt.unauthorized_loader
    def unauthorized_response(callback):
        resp = jsonify({'error': 'Missing Authorization Header or Cookie', 'details': callback})
        unset_jwt_cookies(resp)
        return resp, 401

    @jwt.invalid_token_loader
    def invalid_token_response(callback):
        resp = jsonify({'error': 'Invalid Token', 'details': callback})
        unset_jwt_cookies(resp)
        return resp, 422

    @jwt.expired_token_loader
    def expired_token_response(jwt_header, jwt_payload):
        resp = jsonify({'error': 'Token Expired'})
        unset_jwt_cookies(resp)
        return resp, 401

    # Register Blueprints
    from app.routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    from app.routes.history import bp as history_bp
    app.register_blueprint(history_bp, url_prefix='/api/history')

    from app.routes.predict import bp as predict_bp
    app.register_blueprint(predict_bp, url_prefix='/api/predict')

    from app.routes.admin import bp as admin_bp
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Legacy Route Support for Frontend
    from app.routes.auth import login, register, get_me, logout
    from app.routes.predict import predict
    from app.routes.history import get_history
    from app.routes.admin import admin_stats

    app.add_url_rule('/api/login', view_func=login, methods=['POST'])
    app.add_url_rule('/api/register', view_func=register, methods=['POST'])
    app.add_url_rule('/api/user', view_func=get_me, methods=['GET'])
    app.add_url_rule('/api/logout', view_func=logout, methods=['POST'])
    app.add_url_rule('/api/predict', view_func=predict, methods=['POST'])
    app.add_url_rule('/api/history', view_func=get_history, methods=['GET'])
    app.add_url_rule('/api/admin/stats', view_func=admin_stats, methods=['GET'])

    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'index.html')

    # Create Database Tables if they don't exist
    with app.app_context():
        db.create_all()

    return app
