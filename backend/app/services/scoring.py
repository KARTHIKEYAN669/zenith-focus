"""
Utility functions for calculating Health & Wellness metrics.
"""

# Mapping of mood strings to numeric values for ML and logic processing
mood_mapping = {'stressed': 0, 'sad': 1, 'good': 2, 'happy': 3}

def get_focus_status(score):
    """
    Categorizes the focus score into a human-readable status.
    Returns Excellent (80+), Good (60+), Weak (40+), or Poor (<40).
    """
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Weak"
    return "Poor"

def calculate_burnout_score(sleep, study, screen, breaks, mood):
    score = 0
    if sleep < 5: score += 30
    elif sleep < 6: score += 15
    elif sleep >= 8: score -= 10
    if study > 8: score += 30
    elif study > 6: score += 15
    if screen > 8: score += 20
    elif screen > 6: score += 10
    if breaks == 0: score += 20
    elif breaks == 1: score += 10
    elif breaks >= 4: score -= 10
    
    if isinstance(mood, str):
        mood = mood.lower()
        if mood == "stressed": score += 25
        elif mood == "sad": score += 15
        elif mood == "good": score -= 5
        elif mood == "happy": score -= 10
    else:
        if mood == 0: score += 25
        elif mood == 1: score += 15
        elif mood == 2: score -= 5
        elif mood == 3: score -= 10
        
    return max(0, min(100, score))

def calculate_focus_score(sleep, study, screen, breaks, mood):
    score = 100
    if sleep < 5: score -= 25
    elif sleep < 6: score -= 15
    elif sleep < 7: score -= 5
    if study < 2: score -= 20
    elif study < 4: score -= 10
    elif study > 10: score -= 10
    if screen > 8: score -= 25
    elif screen > 6: score -= 15
    elif screen > 4: score -= 5
    if breaks == 0: score -= 20
    elif breaks == 1: score -= 10
    elif 2 <= breaks <= 4: score += 5

    if isinstance(mood, str):
        mood = mood.lower()
        mood_val = mood_mapping.get(mood, 2)
    else:
        mood_val = mood

    if mood_val == 0: score -= 20
    elif mood_val == 1: score -= 15
    elif mood_val == 2: score += 5
    elif mood_val == 3: score += 10

    return max(0, min(100, score))

def generate_recovery_tips(sleep, study, screen, breaks, mood, burnout_score):
    tips = []
    if sleep < 6: tips.append("Your sleep is critically low. Aim for at least 7-8 hours tonight.")
    elif sleep < 7: tips.append("A little more sleep could significantly boost your focus.")
    if study > 8 and breaks < 3: tips.append("You are overworking. Implement the Pomodoro technique.")
    if screen > 6: tips.append("High screen time detected. Practice the 20-20-20 rule.")
    if breaks <= 1: tips.append("Step away from your desk periodically.")
        
    mood_str = mood.lower() if isinstance(mood, str) else ""
    if mood_str == "stressed" or mood == 0:
        tips.append("Try a 5-minute deep breathing exercise.")
    elif mood_str == "sad" or mood == 1:
        tips.append("Do something you enjoy today to boost dopamine.")
        
    if burnout_score >= 60:
        tips.insert(0, "⚠️ HIGH BURNOUT RISK: Prioritize immediate rest.")
    elif burnout_score >= 40:
        tips.insert(0, "⚠️ MODERATE BURNOUT RISK: Schedule recovery time.")
    else:
        tips.insert(0, "✅ HEALTHY HABITS: Keep maintaining this balance.")
        
    return tips[:4]

def generate_multi_day_insights(history_data):
    insights = []
    if not history_data or len(history_data) < 3:
        return ["Not enough data yet. Log your habits for at least 3 days."]
        
    recent_3 = history_data[-3:]
    sleep_avg = sum(entry['sleep'] for entry in recent_3) / 3
    if sleep_avg < 6:
        insights.append("🛌 Chronic Sleep Debt: Averaging < 6 hours.")
        
    if recent_3[0]['burnout_score'] < recent_3[1]['burnout_score'] < recent_3[2]['burnout_score']:
        if recent_3[2]['burnout_score'] >= 50:
            insights.append("🔥 Burnout Spike: Burnout risk increasing.")
            
    study_avg = sum(entry['study'] for entry in recent_3) / 3
    breaks_avg = sum(entry['breaks'] for entry in recent_3) / 3
    if study_avg > 6 and breaks_avg <= 2:
        insights.append("⏳ Unsustainable Routine: Heavy study with minimal breaks.")
        
    focus_avg = sum(entry['focus_score'] for entry in recent_3) / 3
    if focus_avg > 75:
        insights.append("⭐ High Performance State: Focus is excellent.")
        
    if not insights:
        insights.append("📊 Stable Patterns: Habits are stable.")
        
    return insights
