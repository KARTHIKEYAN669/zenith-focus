import os
from dotenv import load_dotenv
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '..', '.env'))

class Config:
    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-fallback-secret-key'
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    
    # Database (Default to SQLite for dev, overridden by env var for production)
    # Note: For Render/Railway, DATABASE_URL is automatically provided
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, '..', 'database.db')
    
    # Handle 'postgres://' vs 'postgresql://' for SQLAlchemy 1.4+
    if SQLALCHEMY_DATABASE_URI.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Settings
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'dev-fallback-jwt-secret'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=60) # Longer for production
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_TOKEN_LOCATION = ['headers', 'cookies']
    
    # Production: Require HTTPS for cookies, development: allow HTTP
    JWT_COOKIE_SECURE = FLASK_ENV == 'production'
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_COOKIE_CSRF_PROTECT = False
    
    # Bcrypt
    BCRYPT_LOG_ROUNDS = int(os.environ.get('BCRYPT_LOG_ROUNDS', 12))
    
    # Rate Limiting
    RATELIMIT_DEFAULT = os.environ.get('RATELIMIT_DEFAULT', "200 per day; 50 per hour")
    RATELIMIT_STORAGE_URI = os.environ.get('REDIS_URL', 'memory://')
