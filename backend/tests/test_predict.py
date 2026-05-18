import json

def get_auth_header(client):
    client.post('/api/auth/register', json={
        "email": "test@example.com",
        "password": "Password123!"
    })
    resp = client.post('/api/auth/login', json={
        "email": "test@example.com",
        "password": "Password123!"
    })
    token = resp.get_json()['data']['access_token']
    return {'Authorization': f'Bearer {token}'}

def test_predict_valid(client):
    """Test valid prediction request"""
    headers = get_auth_header(client)
    payload = {
        "sleep": 8.0,
        "study": 4.0,
        "screen_time": 3.0,
        "breaks": 5,
        "mood": "good"
    }
    response = client.post('/api/predict/', json=payload, headers=headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['status'] == 'success'
    assert 'focus_score' in data['data']

def test_predict_invalid_hours(client):
    """Test unrealistic hours guard"""
    headers = get_auth_header(client)
    payload = {
        "sleep": 12.0,
        "study": 15.0,
        "screen_time": 10.0,
        "breaks": 2,
        "mood": "stressed"
    }
    response = client.post('/api/predict/', json=payload, headers=headers)
    data = response.get_json()
    
    assert response.status_code == 400
    assert data['status'] == 'error'
    assert "Total hours" in data['data']
