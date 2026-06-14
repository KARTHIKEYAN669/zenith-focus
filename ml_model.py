import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

MODEL_PATH = "burnout_rf_model.pkl"

def generate_synthetic_data(num_samples=1000):
    """
    Generates realistic synthetic data for 1000 students to train the burnout model.
    Features:
      - sleep_drop: 7.5 - sleep_hours (can range from -1.0 to +4.5)
      - mean_stress: Average stress level (1 to 10)
      - mean_screentime: Average screen time in hours (2 to 14)
      - std_study_duration: Standard deviation of study durations in minutes (0 to 90)
    Target:
      - burnout_label: 0 (Low), 1 (Medium), 2 (High) risk
    """
    np.random.seed(42)
    
    # Generate random features
    sleep_hours = np.random.uniform(3.5, 9.0, num_samples)
    sleep_drop = 7.5 - sleep_hours  # Higher means less sleep than 7.5hr benchmark
    
    mean_stress = np.random.uniform(1.0, 10.0, num_samples)
    mean_screentime = np.random.uniform(2.0, 14.0, num_samples)
    std_study_duration = np.random.uniform(0.0, 90.0, num_samples) # Erratic study patterns
    
    # Define a scoring function with some noise to determine labels
    # Weights: sleep_drop (30%), stress (35%), screentime (20%), std_study_duration (15%)
    score = (
        0.30 * (sleep_drop + 1.0) / 5.0 + 
        0.35 * (mean_stress / 10.0) + 
        0.20 * (mean_screentime / 14.0) + 
        0.15 * (std_study_duration / 90.0)
    )
    # Add random noise
    score += np.random.normal(0, 0.08, num_samples)
    
    # Assign labels based on score distribution
    burnout_label = []
    for s in score:
        if s < 0.42:
            burnout_label.append(0)  # Low Risk
        elif s < 0.68:
            burnout_label.append(1)  # Medium Risk
        else:
            burnout_label.append(2)  # High Risk
            
    df = pd.DataFrame({
        "sleep_drop": sleep_drop,
        "mean_stress": mean_stress,
        "mean_screentime": mean_screentime,
        "std_study_duration": std_study_duration,
        "burnout_label": burnout_label
    })
    
    return df

def train_and_save_model():
    """
    Generates synthetic data, trains the Random Forest Classifier, and saves it to a pickle file.
    """
    print("Generating synthetic student data for ML model training...")
    df = generate_synthetic_data(1000)
    
    X = df[["sleep_drop", "mean_stress", "mean_screentime", "std_study_duration"]].values
    y = df["burnout_label"].values
    
    # Initialize and fit Random Forest
    rf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    rf.fit(X, y)
    
    # Save the model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(rf, f)
    print(f"Burnout prediction model trained and saved successfully at {MODEL_PATH}")
    return rf

def get_model():
    """
    Retrieves the trained model. Trains and saves it if not already present.
    """
    if not os.path.exists(MODEL_PATH):
        return train_and_save_model()
    
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    return model

def predict_burnout(sleep_drop: float, mean_stress: float, mean_screentime: float, std_study_duration: float):
    """
    Inference function.
    Takes features matching the training layout exactly:
    x = [sleep_drop, mean_stress, mean_screentime, std_study_duration]
    Returns prediction risk class (0, 1, 2) and probabilities.
    """
    model = get_model()
    
    # Shape input feature vector
    x_input = np.array([[sleep_drop, mean_stress, mean_screentime, std_study_duration]])
    
    # Run prediction
    pred_class = int(model.predict(x_input)[0])
    probabilities = model.predict_proba(x_input)[0].tolist()
    
    risk_mapping = {0: "Low", 1: "Medium", 2: "High"}
    
    return {
        "risk_level": risk_mapping[pred_class],
        "risk_code": pred_class,
        "probabilities": {
            "Low": probabilities[0],
            "Medium": probabilities[1],
            "High": probabilities[2]
        }
    }

# Train the model immediately on import if it doesn't exist
get_model()
