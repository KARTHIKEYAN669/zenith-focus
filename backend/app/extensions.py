from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_talisman import Talisman
from flask_migrate import Migrate
from flasgger import Swagger


db = SQLAlchemy()
jwt = JWTManager()
cors = CORS()
bcrypt = Bcrypt()
talisman = Talisman()
migrate = Migrate()
swagger = Swagger()

# Set up limiter, using memory storage by default. Can switch to Redis for production.
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["100 per day", "50 per hour"]
)
