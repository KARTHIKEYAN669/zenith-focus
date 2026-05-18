import requests
import json
import time

BASE_URL = "http://127.0.0.1:5000/api"
TEST_USER = {
    "email": f"test_{int(time.time())}@example.com",
    "password": "Password123!"
}

def test_api():
    session = requests.Session()
    
    print("--- 1. Testing Registration ---")
    resp = session.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    assert resp.status_code == 201

    print("\n--- 2. Testing Login ---")
    resp = session.post(f"{BASE_URL}/auth/login", json=TEST_USER)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    assert resp.status_code == 200

    print("\n--- 3. Testing Prediction (Valid) ---")
    pred_data = {
        "sleep": 8.0,
        "study": 4.0,
        "screen_time": 3.0,
        "breaks": 4,
        "mood": "good"
    }
    resp = session.post(f"{BASE_URL}/predict/", json=pred_data)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    assert resp.status_code == 200

    print("\n--- 4. Testing Prediction (Invalid - Unrealistic Hours) ---")
    invalid_data = {
        "sleep": 12.0,
        "study": 15.0,
        "screen_time": 10.0,
        "breaks": 2,
        "mood": "stressed"
    }
    resp = session.post(f"{BASE_URL}/predict/", json=invalid_data)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    # Should now fail with 400 after our fix
    assert resp.status_code == 400

    print("\n--- 5. Testing Logout (Revocation) ---")
    resp = session.post(f"{BASE_URL}/auth/logout")
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    assert resp.status_code == 200

    print("\n--- 6. Testing Protected Route after Logout (Revoked Token) ---")
    resp = session.get(f"{BASE_URL}/auth/me")
    print(f"Status: {resp.status_code}")
    assert resp.status_code == 401

    print("\n--- 7. Testing Invalid Token (Garbage) ---")
    headers = {"Authorization": "Bearer not-a-token"}
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    assert resp.status_code == 422

    print("\n--- 8. Testing Malformed Token ---")
    headers = {"Authorization": "Bearer a.b.c"} # Correct segments but invalid content
    resp = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Status: {resp.status_code}")
    print(json.dumps(resp.json(), ensure_ascii=True))
    assert resp.status_code == 422

    print("\nAll regression tests passed!")

if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"\nTest failed: {e}")
