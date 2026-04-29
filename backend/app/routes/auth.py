from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, get_jwt, set_access_cookies, set_refresh_cookies, unset_jwt_cookies
)
from app.extensions import db, limiter
from app.models import User

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    # First user becomes admin
    user_count = User.query.count()
    is_admin = True if user_count == 0 else False
    
    new_user = User(username=username, is_admin=is_admin)
    new_user.set_password(password)
    
    db.session.add(new_user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=str(new_user.id), additional_claims={"is_admin": is_admin})
    refresh_token = create_refresh_token(identity=str(new_user.id))
    
    resp = jsonify({
        'success': True,
        'username': username,
        'is_admin': is_admin,
        'access_token': access_token,
        'refresh_token': refresh_token
    })
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp, 201

@bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id), additional_claims={"is_admin": user.is_admin})
        refresh_token = create_refresh_token(identity=str(user.id))
        
        resp = jsonify({
            'success': True,
            'username': username,
            'is_admin': user.is_admin,
            'access_token': access_token,
            'refresh_token': refresh_token
        })
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp, 200
        
    return jsonify({'error': 'Invalid credentials'}), 401

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    user = db.session.get(User, identity)
    if not user:
         return jsonify({'error': 'User not found'}), 404
         
    access_token = create_access_token(identity=str(identity), additional_claims={"is_admin": user.is_admin})
    return jsonify(access_token=access_token)

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    identity = get_jwt_identity()
    claims = get_jwt()
    user = db.session.get(User, identity)
    
    if not user:
        return jsonify({'logged_in': False}), 404
        
    return jsonify({
        'logged_in': True,
        'user_id': identity,
        'username': user.username,
        'is_admin': claims.get('is_admin', False)
    }), 200

@bp.route('/logout', methods=['POST'])
def logout():
    resp = jsonify({'success': True, 'message': 'Logged out'})
    unset_jwt_cookies(resp)
    return resp, 200
