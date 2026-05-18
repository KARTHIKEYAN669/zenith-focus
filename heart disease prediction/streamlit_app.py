import streamlit as st
import joblib

# Load trained model
model = joblib.load("best_heart_model.pkl")

st.title("❤️ Heart Disease Prediction App")

st.write("Enter your health details:")

# Input fields
age = st.number_input("Age", 1, 100)
sex = st.selectbox("Sex (1 = Male, 0 = Female)", [1, 0])
cp = st.selectbox("Chest Pain Type (0-3)", [0,1,2,3])
bp = st.number_input("Resting Blood Pressure", 80, 200)
chol = st.number_input("Cholesterol", 100, 400)
fbs = st.selectbox("Fasting Blood Sugar > 120 (1 = Yes, 0 = No)", [1,0])
restecg = st.selectbox("Rest ECG (0-2)", [0,1,2])
thalach = st.number_input("Max Heart Rate", 60, 220)
exang = st.selectbox("Exercise Angina (1 = Yes, 0 = No)", [1,0])
oldpeak = st.number_input("Oldpeak", 0.0, 6.0)
slope = st.selectbox("Slope (0-2)", [0,1,2])
ca = st.selectbox("Number of vessels (0-4)", [0,1,2,3,4])
thal = st.selectbox("Thal (0-3)", [0,1,2,3])

# Predict button
if st.button("Predict"):
    features = [[age, sex, cp, bp, chol, fbs, restecg, thalach, exang, oldpeak, slope, ca, thal]]
    
    prediction = model.predict(features)[0]

    if prediction == 1:
        st.error("⚠️ High risk of heart disease")
    else:
        st.success("✅ Low risk of heart disease")

    st.warning("⚠️ This is an AI prediction, not a medical diagnosis.")