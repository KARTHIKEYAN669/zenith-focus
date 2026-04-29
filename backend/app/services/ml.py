import os
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib

class FocusModel:
    def __init__(self):
        self.model = None
        self.model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
        self.data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'student_data.csv')

    def load_or_train(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.train()

    def train(self):
        if not os.path.exists(self.data_path):
            print("No training data found. Waiting for data...")
            return

        data = pd.read_csv(self.data_path)
        mood_mapping = {'stressed': 0, 'sad': 1, 'good': 2, 'happy': 3}
        if data['mood'].dtype == object:
            data['mood'] = data['mood'].str.lower().map(mood_mapping)

        X = data[['sleep', 'study', 'screen_time', 'breaks', 'mood']]
        y = data['focus_score']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X_train, y_train)
        
        joblib.dump(self.model, self.model_path)

    def predict(self, features):
        if not self.model:
            self.load_or_train()
            if not self.model: # Fallback if training fails
                return 50.0 
        
        df = pd.DataFrame([features])
        return self.model.predict(df)[0]

# Singleton instance
focus_predictor = FocusModel()
focus_predictor.load_or_train()
