import os
import threading
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Index, event
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = "sqlite:///./zenith_focus.db"

# Create engine with check_same_thread=False to support concurrency
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Enable WAL (Write-Ahead Logging) and set synchronous mode to NORMAL for concurrency optimization
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Relational Database Models ---

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    target_exam = Column(String, nullable=False)  # "JEE" or "NEET"
    streak_count = Column(Integer, default=0, nullable=False)
    last_active_date = Column(String, nullable=True)  # YYYY-MM-DD

    sessions = relationship("StudySession", back_populates="user", cascade="all, delete-orphan")
    burnout_metrics = relationship("BurnoutMetrics", back_populates="user", cascade="all, delete-orphan")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    subject_tag = Column(String, nullable=False)  # "Physics", "Chemistry", "Math", "Biology"
    efficiency_score = Column(Integer, nullable=False)  # 1-100
    focus_duration_mins = Column(Integer, nullable=False)

    user = relationship("User", back_populates="sessions")

    # Composite index for user-specific session search performance
    __table_args__ = (
        Index("idx_user_sessions", "user_id", "start_time"),
    )

class BurnoutMetrics(Base):
    __tablename__ = "burnout_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    sleep_hours = Column(Float, nullable=False)
    stress_level = Column(Integer, nullable=False)  # 1-10
    screen_time_hours = Column(Float, nullable=False)
    burnout_score = Column(Float, nullable=True)  # Burnout probability predicted by ML model

    user = relationship("User", back_populates="burnout_metrics")

    # Composite index for user-specific trends queries
    __table_args__ = (
        Index("idx_user_wellness", "user_id", "timestamp"),
    )

# --- Initialize Tables Helper ---
def init_db():
    Base.metadata.create_all(bind=engine)

# DB Dependency injection helper
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Simulated Redis Leaderboard Cache ---
# Thread-safe in-memory cache storing leaderboard ranks
class LeaderboardCache:
    def __init__(self):
        self.lock = threading.Lock()
        # Prepopulate with mock JEE/NEET scores
        self.cache = {
            "JEE": [
                {"username": "ApexJEE", "score": 98.7},
                {"username": "PhysicsPro", "score": 95.4},
                {"username": "MathWizard", "score": 92.1},
                {"username": "ChemEnthusiast", "score": 89.6},
                {"username": "JEE_Warrior", "score": 87.2}
            ],
            "NEET": [
                {"username": "DoctorDream", "score": 99.1},
                {"username": "BioGenius", "score": 96.3},
                {"username": "AnatomyMaster", "score": 94.0},
                {"username": "MedAspirant", "score": 91.5},
                {"username": "CellExpert", "score": 86.8}
            ]
        }

    def get_leaderboard(self, exam: str):
        with self.lock:
            # Sort by score descending and return
            return sorted(self.cache.get(exam, []), key=lambda x: x["score"], reverse=True)

    def update_score(self, exam: str, username: str, score: float):
        with self.lock:
            if exam not in self.cache:
                self.cache[exam] = []
            
            # Find and update or add new
            found = False
            for entry in self.cache[exam]:
                if entry["username"] == username:
                    # Update only if new score is higher
                    entry["score"] = max(entry["score"], score)
                    found = True
                    break
            
            if not found:
                self.cache[exam].append({"username": username, "score": score})
            
            # Keep top 50, sorted descending
            self.cache[exam] = sorted(self.cache[exam], key=lambda x: x["score"], reverse=True)[:50]

leaderboard_cache = LeaderboardCache()
