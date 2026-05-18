import os
import pandas as pd
import joblib
import logging

logger = logging.getLogger(__name__)

class FocusModel:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
                logger.info("ML Model loaded successfully.")
            except Exception as e:
                logger.warning(f"Failed to load ML model: {e}. Falling back to rule-based scoring.")
        else:
            logger.warning("ML Model file not found. Using rule-based scoring fallback.")

    def predict(self, features):
        if not self.model:
            # Fallback scoring logic if model is not available
            # Log this once or periodically if needed, but for now just return default
            return sum(features.values()) / len(features) if features else 50.0
        
        try:
            df = pd.DataFrame([features])
            prediction = self.model.predict(df)[0]
            return float(prediction)
        except Exception as e:
            logger.error(f"Prediction error: {e}. Using fallback.")
            return 50.0

# Singleton instance
focus_predictor = FocusModel()
