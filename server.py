import os
import requests
import openai
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# --- Configuration ---
API_KEY = "291c9b21df97c8c3deb972626945b12e"
OPENAI_API_KEY = ""


DISEASE_DB = {
    "flu": ["fever","cough","cold","headache","body pain"],
    "covid-19":["fever","cough","loss of smell","breathing difficulty"],
    "malaria":["fever","chills","sweating","headache"],
    "typhoid":["fever","weakness","stomach pain","loss of appetite"],
    "dengue":["fever","rash","joint pain","headache"]
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Logic Functions ---

def get_auto_location():
    try:
        response = requests.get("https://ipinfo.io/json", timeout=2)
        data = response.json()
        return data.get("city")
    except:
        return None

def get_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    response = requests.get(url)
    data = response.json()

    if data["cod"] == 200:
        temp = data["main"]["temp"]
        weather = data["weather"][0]["description"]
        msg = f"Weather in {city} is {temp} degrees Celsius with {weather}. "
        
        if temp > 35:
            msg += "It is very hot. Stay hydrated."
        elif "rain" in weather:
            msg += "Carry an umbrella."
        
        return msg
    return "City not found."


def predict_disease(user_input):
    user_input = user_input.lower()
    detected = []

    for disease,symptoms in DISEASE_DB.items():
        match = sum(1 for s in symptoms if s in user_input)

        if match >= 2:
            detected.append(disease)
            
    return detected

def process_command(user):
    user = user.lower()

    #Disease Prediction
    if "symptom" in user or "disease" in user or "i have" in user:
        diseases = predict_disease(user)

        if diseases:
            return f"You may have: {', '.join(diseases)}. This is not a medical diagnosis. Please consult a doctor."
        
        else:
            return "I couldn't identify the disease clearly. Please provide more symptoms."

    elif "hello" in user or "hi" in user:
        return "Hi there!"

    elif "health" in user:
        return "You can check your health parameters. However, in this mobile version, health inputs need to be asked directly."

    elif "weather" in user:
        # Check if they specified a city in the prompt
        # We can do a simple check. If not, autodetect.
        if "in" in user:
            words = user.split()
            city = words[-1]
            return get_weather(city)
        else:
            city = get_auto_location()
            if city:
                return f"For your current location, {city}: " + get_weather(city)
            else:
                return "I couldn't detect your location to check the weather."


    elif "skill" in user or "study" in user:
        return "Consistency is the key to success. Keep learning your skills!"

    elif "how are you" in user:
        return "I'm just code, but I'm doing great!"
    
    elif "your name" in user:
        return "I'm your AI Robot Assistant."
    
    else:
        # ChatGPT Brain Fallback
        if not OPENAI_API_KEY:
            return "I don't understand that command. Please add your OpenAI API key to activate my ChatGPT brain."
        else:
            try:
                from openai import OpenAI
                client = OpenAI(api_key=OPENAI_API_KEY)
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": f"Please briefly answer: {user}"}],
                    max_tokens=60
                )
                return response.choices[0].message.content
            except Exception as e:
                return "Sorry, my ChatGPT brain is currently unavailable or the API key is incorrect."

# --- API ENDPOINTS ---

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    data = await request.json()
    user_text = data.get("text", "")
    response_text = process_command(user_text)
    return JSONResponse({"reply": response_text})

# Mount static frontend
if not os.path.exists("frontend"):
    os.makedirs("frontend")

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
