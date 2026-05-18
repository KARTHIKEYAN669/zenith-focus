import sys
import os
sys.path.append(r"c:\Users\karthikeyan\Desktop\Health & Wellness app")
from Conditional_Bot import process_command

# Sample metrics for heart disease prediction
# Age, Sex (1/0), Chest Pain Type (0-3), Resting BP, Cholesterol, Fasting Blood Sugar > 120 (1/0), Rest ECG (0-2), Max Heart Rate, Exercise Angina (1/0), Oldpeak, Slope (0-2), Major Vessels (0-4), Thal (0-3)
metrics = "63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1"
user_text = f"Predict my heart risk with these metrics: {metrics}"

print(f"User Input: {user_text}")
result = process_command(user_text)
print("\nBot Response:")
print(result)

if "[VISUAL:HEART_RISK|" in result:
    print("\nSUCCESS: Visual tag found in response.")
else:
    print("\nFAILURE: Visual tag NOT found in response.")
