import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
import joblib

# Load data
data = pd.read_csv("heart.csv")

X = data.drop("target", axis=1)
y = data["target"]

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Models
lr_model = LogisticRegression(max_iter=1000)
dt_model = DecisionTreeClassifier()
rf_model = RandomForestClassifier()
svm_model = SVC()

# Train
lr_model.fit(X_train, y_train)
dt_model.fit(X_train, y_train)
rf_model.fit(X_train, y_train)
svm_model.fit(X_train, y_train)

# Predict
lr_acc = accuracy_score(y_test, lr_model.predict(X_test))
dt_acc = accuracy_score(y_test, dt_model.predict(X_test))
rf_acc = accuracy_score(y_test, rf_model.predict(X_test))
svm_acc = accuracy_score(y_test, svm_model.predict(X_test))

# Print results
print("Logistic Regression:", lr_acc)
print("Decision Tree:", dt_acc)
print("Random Forest:", rf_acc)
print("SVM:", svm_acc)

# Store models
models = {
    "Logistic Regression": lr_model,
    "Decision Tree": dt_model,
    "Random Forest": rf_model,
    "SVM": svm_model
}

accuracies = {
    "Logistic Regression": lr_acc,
    "Decision Tree": dt_acc,
    "Random Forest": rf_acc,
    "SVM": svm_acc
}

# Best model
best_model_name = max(accuracies, key=accuracies.get)
best_model = models[best_model_name]

print("Best Model:", best_model_name)

# Save model
joblib.dump(best_model, "best_heart_model.pkl")

# Load model
model = joblib.load("best_heart_model.pkl")

# Prediction function
def predict_heart(features):
    prediction = model.predict([features])[0]

    if prediction == 1:
        return "High risk of heart disease. Please consult a doctor."
    else:
        return "Low risk. Maintain healthy lifestyle."

# Comparison print
print("\nModel Comparison:")
for name, acc in accuracies.items():
    print(f"{name}: {acc:.2f}")

        
# Feature importance (Random Forest)
importance = rf_model.feature_importances_
plt.barh(X.columns, importance)
plt.title("Feature Importance")
plt.show()