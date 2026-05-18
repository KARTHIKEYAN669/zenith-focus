from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
)
from app.extensions import db, limiter
from app.models import User
from app.schemas import UserRegistrationSchema, UserLoginSchema
from marshmallow import ValidationError

bp = Blueprint('auth', __name__)

registration_schema = UserRegistrationSchema()
login_schema = UserLoginSchema()

@bp.route('/register', methods=['POST'])
@limiter.limit("3 per minute")
def register():
    """
    User Registration
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: UserRegistration
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: user@example.com
            password:
              type: string
              example: Password123!
    responses:
      201:
        description: User registered successfully
      400:
        description: Validation failed or email taken
    """
    data = request.json
    if not data:
        return jsonify({
            "status": "error",
            "message": "No data provided",
            "data": None
        }), 400
        
    try:
        validated_data = registration_schema.load(data)
    except ValidationError as err:
        return jsonify({
            "status": "error",
            "message": "Validation failed",
            "data": err.messages
        }), 400
        
    email = validated_data['email']
    password = validated_data['password']
    
    if User.query.filter_by(email=email).first():
        return jsonify({
            "status": "error",
            "message": "Email already registered",
            "data": None
        }), 409
        
    # First user becomes admin
    user_count = User.query.count()
    is_admin = True if user_count == 0 else False
    
    new_user = User(email=email, is_admin=is_admin)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(new_user.id), additional_claims={"is_admin": is_admin})
    refresh_token = create_refresh_token(identity=str(new_user.id))
    
    resp = jsonify({
        "status": "success",
        "message": "User registered successfully",
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                'email': email,
                'is_admin': is_admin
            }
        }
    })
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp, 201

@bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """
    User Login
    ---
    tags:
      - Authentication
    parameters:
      - name: body
        in: body
        required: true
        schema:
          id: UserLogin
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: user@example.com
            password:
              type: string
              example: Password123!
    responses:
      200:
        description: Login successful
      401:
        description: Invalid credentials
    """
    data = request.json
    if not data:
        return jsonify({
            "status": "error",
            "message": "No data provided",
            "data": None
        }), 400
        
    try:
        validated_data = login_schema.load(data)
    except ValidationError as err:
        return jsonify({
            "status": "error",
            "message": "Validation failed",
            "data": err.messages
        }), 400
        
    email = validated_data['email']
    password = validated_data['password']
    
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        current_app.logger.info(f"Successful login for user: {email}")
        access_token = create_access_token(identity=str(user.id), additional_claims={"is_admin": user.is_admin})
        refresh_token = create_refresh_token(identity=str(user.id))
        
        resp = jsonify({
            "status": "success",
            "message": "Login successful",
            "data": {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    'email': email,
                    'is_admin': user.is_admin
                }
            }
        })
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp, 200
        
    current_app.logger.warning(f"Failed login attempt for email: {email}")
    return jsonify({
        "status": "error",
        "message": "Invalid credentials",
        "data": None
    }), 401

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh Access Token
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Token refreshed
      401:
        description: Invalid or missing refresh token
    """
    identity = get_jwt_identity()
    user = db.session.get(User, identity)
    if not user:
         return jsonify({
             "status": "error",
             "message": "User not found",
             "data": None
         }), 404
         
    access_token = create_access_token(identity=str(identity), additional_claims={"is_admin": user.is_admin})
    return jsonify({
        "status": "success",
        "message": "Token refreshed",
        "data": {"access_token": access_token}
    })

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Get Current User Profile
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: User profile retrieved
      401:
        description: Unauthorized
    """
    identity = get_jwt_identity()
    claims = get_jwt()
    user = db.session.get(User, identity)
    
    if not user:
        return jsonify({
            "status": "error",
            "message": "User session not found",
            "data": {"logged_in": False}
        }), 404
        
    return jsonify({
        "status": "success",
        "message": "User profile retrieved",
        "data": {
            "user": {
                'logged_in': True,
                'user_id': identity,
                'email': user.email,
                'is_admin': claims.get('is_admin', False)
            }
        }
    }), 200

@bp.route('/logout', methods=['POST'])
@jwt_required(optional=True)
def logout():
    """
    Logout and Revoke Tokens
    ---
    tags:
      - Authentication
    security:
      - Bearer: []
    responses:
      200:
        description: Logged out successfully
    """
    from app.models import TokenBlocklist
    # Revoke access token if present
    token = get_jwt()
    if token:
        jti = token["jti"]
        ttype = token["type"]
        user_id = get_jwt_identity()
        db.session.add(TokenBlocklist(jti=jti, type=ttype, user_id=user_id))
        db.session.commit()
        current_app.logger.info(f"Token revoked for user_id: {user_id}")

    resp = jsonify({
        "status": "success",
        "message": "Logged out successfully",
        "data": None
    })
    unset_jwt_cookies(resp)
    return resp, 200
