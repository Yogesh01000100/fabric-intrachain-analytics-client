import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score
import tenseal as ts
import pickle
import os


training_folder = 'training_folder'
os.makedirs(training_folder, exist_ok=True)
# Logistic regression class definition
class LogisticRegressionEncrypted:
    def __init__(self, n_features):
        self.weights = np.random.randn(n_features)
        self.bias = 0

    def predict(self, x):
        return 1 / (1 + np.exp(-(np.dot(x, self.weights) + self.bias)))

    def train(self, X, y, epochs, lr=0.01):
        for epoch in range(epochs):
            for i, x in enumerate(X):
                pred = self.predict(x)
                error = pred - y[i]
                self.weights -= lr * error * x
                self.bias -= lr * error
            preds = np.array([self.predict(x) for x in X])
            accuracy = accuracy_score(y, preds > 0.5)
            print(f"Accuracy at epoch {epoch}: {accuracy}")

# Load and preprocess the dataset
df = pd.read_csv('d.csv')
df['Diabetes_Status'] = df['Diabetes'].map({'No diabetes': 0, 'Diabetes': 1})
selected_columns = ["Cholesterol", "Glucose", "HDL Chol", "Chol/HDL ratio", "Age",
                    "Height", "Weight", "BMI", "Systolic BP", "Diastolic BP",
                    "waist", "hip", "Waist/hip ratio", "Diabetes_Status"]
data = df[selected_columns].dropna()

# Scale features using DataFrame to preserve feature names
scaler = StandardScaler()
features = scaler.fit_transform(data[selected_columns[:-1]])  # Exclude the target variable column
labels = data['Diabetes_Status'].values

# Split the dataset
X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

# Initialize homomorphic encryption context
context = ts.context(ts.SCHEME_TYPE.CKKS, poly_modulus_degree=8192, coeff_mod_bit_sizes=[60, 40, 40, 60])
context.global_scale = 2**40
context.generate_galois_keys()


# Encrypt the data
encrypted_X_train = [ts.ckks_vector(context, sample.tolist()) for sample in X_train]
encrypted_X_test = [ts.ckks_vector(context, sample.tolist()) for sample in X_test]


# Train the logistic regression model
model = LogisticRegressionEncrypted(X_train.shape[1])
model.train(X_train, y_train, epochs=30)

# Encrypt model weights and bias
encrypted_weights = ts.ckks_vector(context, model.weights.tolist())
encrypted_bias = ts.ckks_vector(context, [model.bias])

# Save the trained model
with open(os.path.join(training_folder, 'scaler.pkl'), 'wb') as f:
    pickle.dump(scaler, f)
with open(os.path.join(training_folder, 'model.pkl'), 'wb') as f:
    pickle.dump(model, f)
with open(os.path.join(training_folder, 'encrypted_weights.seal'), 'wb') as f:
    f.write(encrypted_weights.serialize())
with open(os.path.join(training_folder, 'encrypted_bias.seal'), 'wb') as f:
    f.write(encrypted_bias.serialize())