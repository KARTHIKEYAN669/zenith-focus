import asyncio
from datetime import datetime, timedelta
import numpy as np
from fastapi import FastAPI, Depends, HTTPException, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import init_db, get_db, User, StudySession, BurnoutMetrics, leaderboard_cache
from auth import hash_password, verify_password, create_access_token, decode_access_token
from ml_model import predict_burnout
from ai_counselor import query_ai_counselor, solve_doubt_ocr

app = FastAPI(title="Zenith Focus API", version="1.0.0")

# Enable CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Initialize DB on Startup
@app.on_event("startup")
async def startup_event():
    init_db()
    # Start background loop for daily streak reset checks
    asyncio.create_task(reset_daily_streaks_loop())

async def reset_daily_streaks_loop():
    """
    Background loop checking once an hour to reset streaks of users
    who have been inactive for more than a day.
    """
    while True:
        try:
            await asyncio.sleep(3600)  # Check every hour
            db = next(get_db())
            today_str = datetime.utcnow().strftime("%Y-%m-%d")
            yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            # Find users whose streak is active but last active date is older than yesterday
            inactive_users = db.query(User).filter(
                User.last_active_date != today_str,
                User.last_active_date != yesterday_str,
                User.streak_count > 0
            ).all()
            
            if inactive_users:
                for user in inactive_users:
                    user.streak_count = 0
                db.commit()
                print(f"Background Streak Reset: Reset streaks for {len(inactive_users)} inactive users.")
            db.close()
        except Exception as e:
            print("Exception in background streak reset task:", e)

# Dependency to fetch the currently authenticated user
def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = payload["sub"]
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user not found",
        )
    return user

# --- Pydantic Schema Definitions ---

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    target_exam: str = Field(..., pattern="^(JEE|NEET)$")

class UserLogin(BaseModel):
    username: str
    password: str

class StudySessionLog(BaseModel):
    start_time: str  # ISO 8601 format
    end_time: str    # ISO 8601 format
    subject_tag: str = Field(..., pattern="^(Physics|Chemistry|Math|Biology)$")
    efficiency_score: int = Field(..., ge=1, le=100)
    focus_duration_mins: int = Field(..., ge=1)

class WellnessCheckin(BaseModel):
    sleep_hours: float = Field(..., ge=0.0, le=24.0)
    stress_level: int = Field(..., ge=1, le=10)
    screen_time_hours: float = Field(..., ge=0.0, le=24.0)

class AICounselRequest(BaseModel):
    prompt: str

class AISolveRequest(BaseModel):
    image_base64: str

class LeaderboardSubmit(BaseModel):
    score: float = Field(..., ge=0.0, le=100.0)

# --- API Endpoints ---

# 1. AUTH PIPELINE

@app.post("/api/v1/auth/register")
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    # Check if username exists
    existing = db.query(User).filter(User.username == user_in.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed = hash_password(user_in.password)
    new_user = User(
        username=user_in.username,
        password_hash=hashed,
        target_exam=user_in.target_exam,
        streak_count=0,
        last_active_date=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Initialize leaderboard entry with a starting score
    leaderboard_cache.update_score(new_user.target_exam, new_user.username, 0.0)
    
    return {"status": "success", "message": "User registered successfully"}

@app.post("/api/v1/auth/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == credentials.username).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    token = create_access_token(data={"sub": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "target_exam": user.target_exam,
        "streak_count": user.streak_count
    }

# 2. FOCUS TIMER LOGS

@app.post("/api/v1/focus/log")
def log_focus_session(session_in: StudySessionLog, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        start = datetime.fromisoformat(session_in.start_time.replace("Z", "+00:00"))
        end = datetime.fromisoformat(session_in.end_time.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid timestamp formats. Use ISO 8601 strings."
        )

    # Save session
    session = StudySession(
        user_id=current_user.id,
        start_time=start,
        end_time=end,
        subject_tag=session_in.subject_tag,
        efficiency_score=session_in.efficiency_score,
        focus_duration_mins=session_in.focus_duration_mins
    )
    db.add(session)
    
    # Update active streak
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if current_user.last_active_date != today_str:
        yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        if current_user.last_active_date == yesterday_str:
            current_user.streak_count += 1
        else:
            current_user.streak_count = 1
        current_user.last_active_date = today_str
        
    db.commit()
    return {"status": "success", "streak_count": current_user.streak_count}

@app.get("/api/v1/focus/history")
def get_focus_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).order_by(StudySession.start_time.desc()).limit(10).all()
    return [
        {
            "id": s.id,
            "start_time": s.start_time.isoformat(),
            "end_time": s.end_time.isoformat(),
            "subject_tag": s.subject_tag,
            "efficiency_score": s.efficiency_score,
            "duration": s.focus_duration_mins
        } for s in sessions
    ]

@app.get("/api/v1/focus/stats")
def get_focus_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns aggregated stats for rendering dashboards
    """
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    
    subject_durations = {"Physics": 0, "Chemistry": 0, "Math": 0, "Biology": 0}
    subject_efficiencies = {"Physics": [], "Chemistry": [], "Math": [], "Biology": []}
    
    for s in sessions:
        if s.subject_tag in subject_durations:
            subject_durations[s.subject_tag] += s.focus_duration_mins
            subject_efficiencies[s.subject_tag].append(s.efficiency_score)
            
    stats = {}
    for sub, dur in subject_durations.items():
        avg_eff = np.mean(subject_efficiencies[sub]) if subject_efficiencies[sub] else 0.0
        stats[sub] = {"total_duration_mins": dur, "average_efficiency": float(avg_eff)}
        
    return stats

# 3. WELLNESS & ML PREDICTION

@app.post("/api/v1/wellness/checkin")
def checkin_wellness(checkin_in: WellnessCheckin, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Calculate sleep drop (against a benchmark of 7.5 hours)
    sleep_drop = 7.5 - checkin_in.sleep_hours
    
    # Get past 7 days logs for rolling stress & screentime averages
    past_logs = db.query(BurnoutMetrics).filter(
        BurnoutMetrics.user_id == current_user.id,
        BurnoutMetrics.timestamp >= seven_days_ago
    ).all()
    
    stresses = [log.stress_level for log in past_logs] + [checkin_in.stress_level]
    screentimes = [log.screen_time_hours for log in past_logs] + [checkin_in.screen_time_hours]
    
    mean_stress = float(np.mean(stresses))
    mean_screentime = float(np.mean(screentimes))
    
    # Get std of study sessions in the past 7 days
    past_sessions = db.query(StudySession).filter(
        StudySession.user_id == current_user.id,
        StudySession.start_time >= seven_days_ago
    ).all()
    
    durations = [sess.focus_duration_mins for sess in past_sessions]
    std_study = float(np.std(durations)) if len(durations) >= 2 else 0.0
    
    # Predict burnout risk with ML
    prediction = predict_burnout(sleep_drop, mean_stress, mean_screentime, std_study)
    burnout_prob = prediction["probabilities"]["High"]
    
    # Save wellness check-in record
    wellness_log = BurnoutMetrics(
        user_id=current_user.id,
        sleep_hours=checkin_in.sleep_hours,
        stress_level=checkin_in.stress_level,
        screen_time_hours=checkin_in.screen_time_hours,
        burnout_score=burnout_prob
    )
    db.add(wellness_log)
    
    # Update user activity date & streak if not checked in today yet
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    if current_user.last_active_date != today_str:
        yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")
        if current_user.last_active_date == yesterday_str:
            current_user.streak_count += 1
        else:
            current_user.streak_count = 1
        current_user.last_active_date = today_str
        
    db.commit()
    
    return {
        "status": "success",
        "streak_count": current_user.streak_count,
        "burnout_prediction": prediction
    }

@app.get("/api/v1/wellness/history")
def get_wellness_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(BurnoutMetrics).filter(BurnoutMetrics.user_id == current_user.id).order_by(BurnoutMetrics.timestamp.desc()).limit(14).all()
    return [
        {
            "timestamp": log.timestamp.isoformat(),
            "sleep_hours": log.sleep_hours,
            "stress_level": log.stress_level,
            "screen_time": log.screen_time_hours,
            "burnout_score": log.burnout_score
        } for log in logs
    ]

# 4. AI SERVICE INTEGRATION

@app.post("/api/v1/ai/counsel")
def chat_with_counselor(req: AICounselRequest, current_user: User = Depends(get_current_user)):
    response = query_ai_counselor(req.prompt)
    return {"response": response}

@app.post("/api/v1/ai/solve")
def solve_doubt(req: AISolveRequest, current_user: User = Depends(get_current_user)):
    response = solve_doubt_ocr(req.image_base64)
    return {"solution": response}

# 5. CACHED LEADERBOARD

@app.get("/api/v1/leaderboard")
def get_leaderboard(current_user: User = Depends(get_current_user)):
    board = leaderboard_cache.get_leaderboard(current_user.target_exam)
    return {"target_exam": current_user.target_exam, "leaderboard": board}

@app.post("/api/v1/leaderboard/submit")
def submit_score(req: LeaderboardSubmit, current_user: User = Depends(get_current_user)):
    # Update in-memory thread-safe cache
    leaderboard_cache.update_score(current_user.target_exam, current_user.username, req.score)
    return {"status": "success", "message": f"Score of {req.score} submitted for {current_user.target_exam} leaderboard."}


# --- SPA Page Routing & Static Mounting ---

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

# Mount static folder at the very end to avoid route interception
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
