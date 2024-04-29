import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt

# Load and preprocess the dataset
df = pd.read_csv('d.csv')
df['Diabetes_Status'] = df['Diabetes'].map({'No diabetes': 0, 'Diabetes': 1})

selected_columns = [
    "Cholesterol", "Glucose", "HDL Chol", "Chol/HDL ratio", "Age",
    "Height", "Weight", "BMI", "Systolic BP", "Diastolic BP",
    "waist", "hip", "Waist/hip ratio", "Diabetes_Status"
]

data = df[selected_columns].dropna()
features = data.iloc[:, :-1].values
labels = data.iloc[:, -1].values

# Scaling
scaler = StandardScaler()
features = scaler.fit_transform(features)

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

# Logistic Regression Implementation
class LogisticRegressionManual:
    def __init__(self, learning_rate=0.01, epochs=100):
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.weights = None
        self.bias = None

    def sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def train(self, X, y):
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0
        accuracy_list = []

        for epoch in range(self.epochs):
            model_output = self.sigmoid(np.dot(X, self.weights) + self.bias)
            errors = model_output - y
            weight_update = np.dot(X.T, errors)
            bias_update = np.sum(errors)

            self.weights -= self.learning_rate * weight_update / n_samples
            self.bias -= self.learning_rate * bias_update / n_samples

            preds = self.predict(X)
            acc = accuracy_score(y, preds > 0.5)
            accuracy_list.append(acc)
            print(f"Accuracy at epoch {epoch}: {acc}")

        return accuracy_list

    def predict(self, X):
        linear_output = np.dot(X, self.weights) + self.bias
        return self.sigmoid(linear_output)

# Create and train the model
model = LogisticRegressionManual(learning_rate=0.01, epochs=350)
accuracy_over_epochs = model.train(X_train, y_train)

# Predict on the test set
y_pred_prob = model.predict(X_test)
y_pred = y_pred_prob > 0.5

# Calculate and print accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"Final accuracy on test data: {accuracy}")

# Plotting accuracy over epochs
plt.plot(range(model.epochs), accuracy_over_epochs)
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.title('Accuracy Over Epochs')
plt.show()
