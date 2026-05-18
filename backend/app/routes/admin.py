from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from app.extensions import db
from app.models import User, History

bp = Blueprint('admin', __name__)

def admin_required():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return False
    return True

@bp.route('/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    """
    Get Admin Dashboard Stats
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    responses:
      200:
        description: Admin stats retrieved
      403:
        description: Admin access required
      401:
        description: Unauthorized
    """
    if not admin_required():
        current_app.logger.warning(f"Unauthorized admin access attempt by user {get_jwt_identity()}")
        return jsonify({
            "status": "error",
            "message": "Admin access required",
            "data": None
        }), 403
        
    total_users = User.query.count()
    total_scores = History.query.count()
    
    return jsonify({
        "status": "success",
        "message": "Admin stats retrieved",
        "data": {
            'total_users': total_users,
            'total_scores': total_scores,
            'feedback': [] 
        }
    }), 200
