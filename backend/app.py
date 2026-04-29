from flask import Flask, request, jsonify
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import pandas as pd

import os
import sqlite3
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask import session

frontend_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend')
app = Flask(__name__, static_folder=frontend_folder, static_url_path='')
app.secret_key = 'nexus_ai_super_secret_key'

def init_db():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            timestamp TEXT,
            sleep REAL,
            study REAL,
            screen_time REAL,
            breaks REAL,
            mood TEXT,
            focus_score INTEGER,
            burnout_score INTEGER,
            tips TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            category TEXT,
            message TEXT,
            timestamp TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Safely add is_admin column if it doesn't exist
    try:
        c.execute('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0')
    except sqlite3.OperationalError:
        pass
        
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def index():
    return app.send_static_file('index.html')

from utils import get_focus_status, calculate_burnout_score, calculate_focus_score, mood_mapping, generate_recovery_tips, generate_multi_day_insights

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
        
    hashed_pw = generate_password_hash(password)
    
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        # First user becomes admin
        c.execute('SELECT COUNT(*) FROM users')
        user_count = c.fetchone()[0]
        is_admin = 1 if user_count == 0 else 0
        
        c.execute('INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)', (username, hashed_pw, is_admin))
        conn.commit()
        user_id = c.lastrowid
        session['user_id'] = user_id
        session['username'] = username
        session['is_admin'] = is_admin
        conn.close()
        return jsonify({'success': True, 'username': username, 'is_admin': is_admin})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT id, password_hash, is_admin FROM users WHERE username = ?', (username,))
    user = c.fetchone()
    conn.close()
    
    if user and check_password_hash(user[1], password):
        session['user_id'] = user[0]
        session['username'] = username
        session['is_admin'] = user[2]
        return jsonify({'success': True, 'username': username, 'is_admin': user[2]})
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/user', methods=['GET'])
def get_user():
    if 'user_id' in session:
        return jsonify({'logged_in': True, 'username': session['username'], 'is_admin': session.get('is_admin', 0)})
    return jsonify({'logged_in': False})

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    category = data.get('category')
    message = data.get('message')
    if not message:
        return jsonify({'error': 'Message required'}), 400
        
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('INSERT INTO feedback (user_id, category, message, timestamp) VALUES (?, ?, ?, ?)', 
              (session['user_id'], category, message, datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    if not session.get('is_admin'):
        return jsonify({'error': 'Unauthorized'}), 403
        
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT COUNT(*) FROM users')
    total_users = c.fetchone()[0]
    c.execute('SELECT COUNT(*) FROM history')
    total_scores = c.fetchone()[0]
    
    c.execute('''
        SELECT users.username, feedback.category, feedback.message, feedback.timestamp 
        FROM feedback 
        JOIN users ON feedback.user_id = users.id 
        ORDER BY feedback.id DESC
    ''')
    feedbacks = [{"username": row[0], "category": row[1], "message": row[2], "timestamp": row[3]} for row in c.fetchall()]
    
    conn.close()
    return jsonify({
        'total_users': total_users,
        'total_scores': total_scores,
        'feedback': feedbacks
    })

@app.route('/api/history', methods=['GET'])
def history():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT timestamp, focus_score, burnout_score, tips, sleep, study, screen_time, breaks FROM history WHERE user_id = ? ORDER BY id DESC LIMIT 15', (session['user_id'],))
    rows = c.fetchall()
    conn.close()
    
    history_data = []
    for row in rows:
        history_data.append({
            "timestamp": row[0],
            "focus_score": row[1],
            "burnout_score": row[2],
            "tips": row[3].split("||") if row[3] else [],
            "sleep": row[4],
            "study": row[5],
            "screen_time": row[6],
            "breaks": row[7]
        })
    # Return chronologically (oldest first) for charting
    chronological_data = list(reversed(history_data))
    insights = generate_multi_day_insights(chronological_data)
    
    return jsonify({
        "history": chronological_data,
        "insights": insights
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
        
    req_data = request.json
    sleep = float(req_data.get('sleep', 0))
    study = float(req_data.get('study', 0))
    screen = float(req_data.get('screen_time', 0))
    breaks = float(req_data.get('breaks', 0))
    mood = req_data.get('mood', 'good')
    
    rule_score = calculate_focus_score(sleep, study, screen, breaks, mood)
    burnout_score = calculate_burnout_score(sleep, study, screen, breaks, mood)
    
    mood_num = mood_mapping.get(mood.lower(), 2)
    ml_input = pd.DataFrame([{
        "sleep": sleep,
        "study": study,
        "screen_time": screen,
        "breaks": breaks,
        "mood": mood_num
    }])
    ml_score = model.predict(ml_input)[0]
    
    score = int((rule_score * 0.7) + (ml_score * 0.3))
    
    tips = generate_recovery_tips(sleep, study, screen, breaks, mood, burnout_score)
    tips_str = "||".join(tips)
    
    # Save to db
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO history (user_id, timestamp, sleep, study, screen_time, breaks, mood, focus_score, burnout_score, tips)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (session['user_id'], datetime.now().strftime("%Y-%m-%d %H:%M:%S"), sleep, study, screen, breaks, str(mood), score, burnout_score, tips_str))
    conn.commit()
    conn.close()
    
    return jsonify({
        "focus_score": score,
        "burnout_score": burnout_score,
        "rule_score": rule_score,
        "ml_score": round(float(ml_score), 2),
        "status": get_focus_status(score),
        "tips": tips
    })


# --- 1. Load and Prepare Data ---
# In production, load from a real CSV or database
data = pd.read_csv('student_data.csv')

# Encode 'mood' column to numbers
if data['mood'].dtype == object:
    data['mood'] = data['mood'].str.lower().map(mood_mapping)

# Define features (X) and target (y)
X = data[['sleep', 'study', 'screen_time', 'breaks', 'mood']]
y = data['focus_score']

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# --- 2. Train Machine Learning Model ---
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate model (optional, but good for knowing accuracy)
predictions = model.predict(X_test)
print(f"Model Accuracy (MAE): {mean_absolute_error(y_test, predictions):.2f}")


if __name__ == '__main__':
    app.run(debug=True, port=5000)