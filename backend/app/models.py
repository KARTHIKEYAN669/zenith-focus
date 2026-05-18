from datetime import datetime
from app.extensions import db, bcrypt
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    history_records = db.relationship('History', backref='user', lazy=True, cascade="all, delete-orphan")
    feedback_records = db.relationship('Feedback', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class History(db.Model):
    __tablename__ = 'history'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    # Input Metrics
    sleep = db.Column(db.Float, default=0.0)
    study = db.Column(db.Float, default=0.0)
    screen_time = db.Column(db.Float, default=0.0)
    breaks = db.Column(db.Float, default=0.0)
    mood = db.Column(db.String(50), default='good')
    
    # Calculated Scores
    focus_score = db.Column(db.Integer, nullable=False)
    burnout_score = db.Column(db.Integer, nullable=False)
    tips = db.Column(db.Text) # Storing as a delimited string "||" for now

    def to_dict(self):
        return {
            "id": self.id,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None,
            "focus_score": self.focus_score,
            "burnout_score": self.burnout_score,
            "tips": self.tips.split("||") if self.tips else [],
            "sleep": self.sleep,
            "study": self.study,
            "screen_time": self.screen_time,
            "breaks": self.breaks,
            "mood": self.mood
        }

class Feedback(db.Model):
    __tablename__ = 'feedback'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    category = db.Column(db.String(50))
    message = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.user.email if self.user else "Unknown",
            "category": self.category,
            "message": self.message,
            "timestamp": self.timestamp.strftime("%Y-%m-%d %H:%M:%S") if self.timestamp else None
        }
    
class TokenBlocklist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, index=True)
    type = db.Column(db.String(16), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<TokenBlocklist {self.jti}>"
