import json

def test_register(client):
    """Test user registration"""
    payload = {
        "email": "test@example.com",
        "password": "Password123!"
    }
    response = client.post('/api/auth/register', json=payload)
    data = response.get_json()
    
    assert response.status_code == 201
    assert data['status'] == 'success'
    assert data['data']['user']['email'] == "test@example.com"

def test_login(client):
    """Test user login"""
    # First register
    client.post('/api/auth/register', json={
        "email": "test@example.com",
        "password": "Password123!"
    })
    
    # Then login
    payload = {
        "email": "test@example.com",
        "password": "Password123!"
    }
    response = client.post('/api/auth/login', json=payload)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['status'] == 'success'
    assert 'access_token' in data['data']
