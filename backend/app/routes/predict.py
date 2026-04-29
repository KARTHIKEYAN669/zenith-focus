from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import History
from app.services.scoring import (
    calculate_focus_score, 
    calculate_burnout_score, 
    get_focus_status, 
    generate_recovery_tips,
    mood_mapping
)
from app.services.ml import focus_predictor

bp = Blueprint('predict', __name__)

@bp.route('/', methods=['POST'])
@jwt_required()
def predict():
    user_id = get_jwt_identity()
    req_data = request.json
    
    sleep = float(req_data.get('sleep', 0))
    study = float(req_data.get('study', 0))
    screen = float(req_data.get('screen_time', 0))
    breaks = float(req_data.get('breaks', 0))
    mood = req_data.get('mood', 'good')
    
    # 1. Rule-based logic
    rule_score = calculate_focus_score(sleep, study, screen, breaks, mood)
    burnout_score = calculate_burnout_score(sleep, study, screen, breaks, mood)
    
    # 2. ML Prediction
    mood_num = mood_mapping.get(mood.lower(), 2)
    ml_features = {
        "sleep": sleep,
        "study": study,
        "screen_time": screen,
        "breaks": breaks,
        "mood": mood_num
    }
    ml_score = focus_predictor.predict(ml_features)
    
    # Blended Score
    score = int((rule_score * 0.7) + (ml_score * 0.3))
    
    # Tips
    tips = generate_recovery_tips(sleep, study, screen, breaks, mood, burnout_score)
    tips_str = "||".join(tips)
    
    # Save to db
    new_record = History(
        user_id=user_id,
        sleep=sleep,
        study=study,
        screen_time=screen,
        breaks=breaks,
        mood=str(mood),
        focus_score=score,
        burnout_score=burnout_score,
        tips=tips_str
    )
    db.session.add(new_record)
    db.session.commit()
    
    return jsonify({
        "focus_score": score,
        "burnout_score": burnout_score,
        "rule_score": rule_score,
        "ml_score": round(float(ml_score), 2),
        "status": get_focus_status(score),
        "tips": tips
    }), 200
