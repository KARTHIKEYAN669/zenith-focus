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

def process_prediction(user_id, data):
    """
    Business logic for processing focus/burnout prediction.
    """
    sleep = float(data.get('sleep', 0))
    study = float(data.get('study', 0))
    screen = float(data.get('screen_time', 0))
    breaks = float(data.get('breaks', 0))
    mood = data.get('mood', 'good')
    
    # Extra guard: total hours cannot exceed 24
    if (sleep + study + screen) > 24:
        raise ValueError("Total hours for sleep, study, and screen time cannot exceed 24.")
    
    # 1. Rule-based logic (Stability Fallback)
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
    
    # 3. Blended Score (70% Rules, 30% ML)
    score = int((rule_score * 0.7) + (ml_score * 0.3))
    
    # 4. Generate Tips
    tips = generate_recovery_tips(sleep, study, screen, breaks, mood, burnout_score)
    tips_str = "||".join(tips)
    
    # 5. Save to History
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
    
    return {
        "focus_score": score,
        "burnout_score": burnout_score,
        "rule_score": rule_score,
        "ml_score": round(float(ml_score), 2),
        "status": get_focus_status(score),
        "tips": tips
    }
