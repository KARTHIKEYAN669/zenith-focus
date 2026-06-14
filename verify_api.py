import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"

print("--- Starting Zenith Focus API Validation Tests ---")

try:
    # 1. Test Authentication - Register
    print("\n[Test 1] Registering test user 'jee_aspirant'...")
    reg_res = requests.post(
        f"{BASE_URL}/auth/register", 
        json={"username": "jee_aspirant", "password": "SecurePassword123", "target_exam": "JEE"}
    )
    print("Register API Response Code:", reg_res.status_code)
    print("Register API Response Body:", reg_res.json())
except Exception as e:
    print("Registration error (is the server running? Run 'python main.py' first):", e)
    sys.exit(1)

# 2. Test Authentication - Login
print("\n[Test 2] Logging in user 'jee_aspirant'...")
login_res = requests.post(
        f"{BASE_URL}/auth/login", 
        json={"username": "jee_aspirant", "password": "SecurePassword123"}
)
print("Login API Response Code:", login_res.status_code)
login_data = login_res.json()
token = login_data.get("access_token")
print("Retrieved Bearer Token:", token[:25] + "..." if token else None)

if not token:
    print("Authentication failed. Aborting further tests.")
    sys.exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 3. Test Wellness Logging & ML Burnout Prediction
print("\n[Test 3] Submitting Wellness Check-in to trigger ML Burnout Prediction model...")
well_res = requests.post(
    f"{BASE_URL}/wellness/checkin", 
    headers=headers, 
    json={"sleep_hours": 5.2, "stress_level": 8, "screen_time_hours": 11.0}
)
print("Wellness checkin Response Code:", well_res.status_code)
well_data = well_res.json()
print("Predicted Burnout Risk Level:", well_data.get("burnout_prediction", {}).get("risk_level"))
print("High Risk Probability:", well_data.get("burnout_prediction", {}).get("probabilities", {}).get("High"))

# 4. Test Mock Leaderboard Retrieval
print("\n[Test 4] Querying cached leaderboards...")
lead_res = requests.get(f"{BASE_URL}/leaderboard", headers=headers)
print("Leaderboard Response Code:", lead_res.status_code)
print("Active Ranks:")
for idx, entry in enumerate(lead_res.json().get("leaderboard", [])):
    print(f"  Rank #{idx+1}: {entry['username']} - {entry['score']}%")

print("\n--- Validation Tests Completed Successfully! ---")
