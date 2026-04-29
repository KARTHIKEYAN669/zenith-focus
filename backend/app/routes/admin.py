from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.extensions import db
from app.models import User, History, Feedback

bp = Blueprint('admin', __name__)

def admin_required():
    claims = get_jwt()
    if not claims.get('is_admin'):
        return False
    return True

@bp.route('/stats', methods=['GET'])
@jwt_required()
def admin_stats():
    if not admin_required():
        return jsonify({'error': 'Unauthorized'}), 403
        
    total_users = User.query.count()
    total_scores = History.query.count()
    
    # Get feedback with usernames
    feedbacks = Feedback.query.order_by(Feedback.id.desc()).all()
    feedback_data = [fb.to_dict() for fb in feedbacks]
    
    return jsonify({
        'total_users': total_users,
        'total_scores': total_scores,
        'feedback': feedback_data
    }), 200

@bp.route('/feedback', methods=['POST'])
@jwt_required()
def submit_feedback():
    user_id = get_jwt_identity()
    data = request.json
    
    category = data.get('category')
    message = data.get('message')
    
    if not message:
        return jsonify({'error': 'Message required'}), 400
        
    new_feedback = Feedback(user_id=user_id, category=category, message=message)
    db.session.add(new_feedback)
    db.session.commit()
    
    return jsonify({'success': True}), 201
