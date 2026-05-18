import joblib
import os
import sys

# Add the project directory to sys.path
project_root = r"c:\Users\karthikeyan\Desktop\Health & Wellness app"
model_path = os.path.join(project_root, "heart disease prediction", "best_heart_model.pkl")

try:
    model = joblib.load(model_path)
    print(f"Model loaded: {type(model)}")
    has_proba = hasattr(model, "predict_proba")
    print(f"Has predict_proba: {has_proba}")
    
    # Test with some dummy data (13 features)
    dummy_data = [[63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1]]
    prediction = model.predict(dummy_data)[0]
    print(f"Prediction: {prediction}")
    
    if has_proba:
        proba = model.predict_proba(dummy_data)[0]
        print(f"Probability: {proba}")

except Exception as e:
    print(f"Error: {e}")
