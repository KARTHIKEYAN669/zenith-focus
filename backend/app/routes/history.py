from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import History
from app.services.scoring import generate_multi_day_insights

bp = Blueprint('history', __name__)

@bp.route('/', methods=['GET'])
@jwt_required()
def get_history():
    """
    Get User Prediction History
    ---
    tags:
      - Health Metrics
    security:
      - Bearer: []
    responses:
      200:
        description: History and insights retrieved
      401:
        description: Unauthorized
    """
    user_id = get_jwt_identity()
    
    # Get last 15 records, ordered by newest first
    records = History.query.filter_by(user_id=user_id).order_by(History.id.desc()).limit(15).all()
    
    # Return chronologically (oldest first) for charting
    chronological_data = [record.to_dict() for record in reversed(records)]
    
    insights = generate_multi_day_insights(chronological_data)
    
    return jsonify({
        "status": "success",
        "message": "History and insights retrieved",
        "data": {
            "history": chronological_data,
            "insights": insights
        }
    }), 200
