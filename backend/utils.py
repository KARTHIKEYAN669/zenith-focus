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
    """
    Calculates a burnout risk score from 0 to 100 based on lifestyle habits.
    Higher score indicates a higher risk of burnout.
    """
    score = 0
    
    # Sleep rule: Lack of sleep heavily increases burnout risk
    if sleep < 5: score += 30
    elif sleep < 6: score += 15
    elif sleep >= 8: score -= 10

    # Study rule: Overworking without limits increases burnout
    if study > 8: score += 30
    elif study > 6: score += 15
    
    # Screen time rule: High screen exposure causes mental fatigue
    if screen > 8: score += 20
    elif screen > 6: score += 10

    # Breaks rule: Not taking breaks is a major burnout factor
    if breaks == 0: score += 20
    elif breaks == 1: score += 10
    elif breaks >= 4: score -= 10
    
    # Mood rule: Negative moods compound burnout symptoms
    if isinstance(mood, str):
        mood = mood.lower()
        if mood == "stressed": score += 25
        elif mood == "sad": score += 15
        elif mood == "good": score -= 5
        elif mood == "happy": score -= 10
    else:
        if mood == 0: score += 25 # stressed
        elif mood == 1: score += 15 # sad
        elif mood == 2: score -= 5 # good
        elif mood == 3: score -= 10 # happy
        
    # Clamp score between 0 and 100
    return max(0, min(100, score))

def calculate_focus_score(sleep, study, screen, breaks, mood):
    """
    Calculates a baseline rule-based focus score from 0 to 100.
    Starts at 100 and deducts points for bad habits, adding points for good ones.
    """
    score = 100

    # Sleep rule: Less sleep directly reduces focus potential
    if sleep < 5:
        score -= 25
    elif sleep < 6:
        score -= 15
    elif sleep < 7:
        score -= 5

    # Study hours rule: Too little or too much study time limits optimal focus
    if study < 2:
        score -= 20
    elif study < 4:
        score -= 10
    elif study > 10:
        score -= 10

    # Screen time rule: High screen time causes distraction and eye strain
    if screen > 8:
        score -= 25
    elif screen > 6:
        score -= 15
    elif screen > 4:
        score -= 5

    # Breaks rule: Moderate breaks improve focus, while none ruins it
    if breaks == 0:
        score -= 20
    elif breaks == 1:
        score -= 10
    elif 2 <= breaks <= 4:
        score += 5

    # Mood rule: Positive moods enhance focus
    if isinstance(mood, str):
        mood = mood.lower()
        mood_val = mood_mapping.get(mood, 2) # default to good
    else:
        mood_val = mood

    if mood_val == 0: # stressed
        score -= 20
    elif mood_val == 1: # sad
        score -= 15
    elif mood_val == 2: # good
        score += 5
    elif mood_val == 3: # happy
        score += 10

    # Clamp score between 0 and 100
    return max(0, min(100, score))

def generate_recovery_tips(sleep, study, screen, breaks, mood, burnout_score):
    """
    Generates personalized burnout recovery and focus enhancement tips based on user habits.
    """
    tips = []
    
    if sleep < 6:
        tips.append("Your sleep is critically low. Aim for at least 7-8 hours tonight to restore cognitive function.")
    elif sleep < 7:
        tips.append("A little more sleep could significantly boost your focus. Try going to bed 30 minutes earlier.")
        
    if study > 8 and breaks < 3:
        tips.append("You are overworking without enough rest. Implement the Pomodoro technique (25m work, 5m rest).")
    
    if screen > 6:
        tips.append("High screen time detected. Practice the 20-20-20 rule: every 20 mins, look at something 20 feet away for 20 seconds.")
        
    if breaks <= 1:
        tips.append("Zero to one break will severely damage your long-term focus. Step away from your desk periodically.")
        
    mood_str = mood.lower() if isinstance(mood, str) else ""
    if mood_str == "stressed" or mood == 0:
        tips.append("You seem stressed. Try a 5-minute deep breathing exercise or a quick walk outside to lower cortisol levels.")
    elif mood_str == "sad" or mood == 1:
        tips.append("Your mood is low. Do something you enjoy today, even if it's small, to boost dopamine and improve focus.")
        
    if burnout_score >= 60:
        tips.insert(0, "⚠️ HIGH BURNOUT RISK: Prioritize immediate rest over productivity today. You are running on empty.")
    elif burnout_score >= 40:
        tips.insert(0, "⚠️ MODERATE BURNOUT RISK: You need to slow down and actively schedule recovery time this week.")
    else:
        tips.insert(0, "✅ HEALTHY HABITS: You're doing great! Keep maintaining this balance to avoid future burnout.")
        
    # Limit to top 4 tips so it's not overwhelming
    return tips[:4]

def generate_multi_day_insights(history_data):
    """
    Analyzes an array of chronological history data (oldest first) to identify multi-day trends.
    Expects history_data to be a list of dictionaries.
    """
    insights = []
    if not history_data or len(history_data) < 3:
        return ["Not enough data yet. Log your habits for at least 3 days to unlock AI deep insights."]
        
    recent_3 = history_data[-3:]
    
    # Check for chronic sleep debt
    sleep_avg = sum(entry['sleep'] for entry in recent_3) / 3
    if sleep_avg < 6:
        insights.append("🛌 Chronic Sleep Debt: You have averaged less than 6 hours of sleep recently. This severely impacts memory consolidation.")
        
    # Check for rising burnout
    if recent_3[0]['burnout_score'] < recent_3[1]['burnout_score'] < recent_3[2]['burnout_score']:
        if recent_3[2]['burnout_score'] >= 50:
            insights.append("🔥 Burnout Spike: Your burnout risk has increased for 3 consecutive entries. You must schedule immediate downtime.")
            
    # Check for intense study without breaks
    study_avg = sum(entry['study'] for entry in recent_3) / 3
    breaks_avg = sum(entry['breaks'] for entry in recent_3) / 3
    if study_avg > 6 and breaks_avg <= 2:
        insights.append("⏳ Unsustainable Routine: You are studying/working heavily with minimal breaks. This pattern leads directly to mental fatigue.")
        
    # Check for great focus
    focus_avg = sum(entry['focus_score'] for entry in recent_3) / 3
    if focus_avg > 75:
        insights.append("⭐ High Performance State: Your focus has been excellent recently. Whatever routine you are following right now is working perfectly!")
        
    if not insights:
        insights.append("📊 Stable Patterns: Your habits have been relatively stable over the last few days. Try optimizing one metric (like sleep) to see if your focus improves.")
        
    return insights
