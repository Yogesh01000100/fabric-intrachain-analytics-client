import pandas as pd
import pickle
import tenseal as ts
import numpy as np
import os

# Define the LogisticRegressionEncrypted class
class LogisticRegressionEncrypted:
    def __init__(self, n_features):
        self.weights = np.random.randn(n_features)
        self.bias = 0

    def predict(self, x):
        return 1 / (1 + np.exp(-(np.dot(x, self.weights) + self.bias)))

# Define the stable sigmoid function
def sigmoid(z):
    """Compute the sigmoid function in a way that avoids overflow."""
    if z < 0:
        return 1 - 1 / (1 + np.exp(z))
    else:
        return 1 / (1 + np.exp(-z))

training_folder = 'training_folder'

# Load the saved model and scaler from the specified training folder
model_path = os.path.join(training_folder, 'model.pkl')
scaler_path = os.path.join(training_folder, 'scaler.pkl')
encrypted_bias = os.path.join(training_folder, 'encrypted_bias.seal')
encrypted_weights = os.path.join(training_folder, 'encrypted_weights.seal')

with open(model_path, 'rb') as f:
    model = pickle.load(f)
with open(scaler_path, 'rb') as f:
    scaler = pickle.load(f)

# Initialize the TenSEAL context for deserialization
context = ts.context(ts.SCHEME_TYPE.CKKS, poly_modulus_degree=8192, coeff_mod_bit_sizes=[60, 40, 40, 60])
context.global_scale = 2**40
context.generate_galois_keys()

# Load the encrypted weights and biases using the context
with open(encrypted_weights, 'rb') as f:
    encrypted_weights = ts.ckks_vector_from(context, f.read())
with open(encrypted_bias, 'rb') as f:
    encrypted_bias = ts.ckks_vector_from(context, f.read())

# Function to predict using encrypted data
def encrypted_predict(x):
    return encrypted_weights.dot(x) + encrypted_bias

# Function to decrypt and interpret encrypted predictions
def encrypted_predict_new_data(encrypted_data):
    encrypted_prediction = encrypted_predict(encrypted_data[0])  # Assuming single data point
    decrypted_prediction = encrypted_prediction.decrypt()
    return sigmoid(decrypted_prediction[0])  # Using the stable sigmoid function

# Example input data for a new patient
new_data = {
    "Cholesterol": [320], "Glucose": [260], "HDL Chol": [66], "Chol/HDL ratio": [3.3],
    "Age": [26], "Height": [70], "Weight": [180], "BMI": [27.7], "Systolic BP": [130],
    "Diastolic BP": [85], "waist": [100], "hip": [110], "Waist/hip ratio": [0.91]
}
new_df = pd.DataFrame(new_data)

# Scale the new data using the loaded scaler
new_features = scaler.transform(new_df)

# Encrypt the new data using the same or reinitialized context
encrypted_new_features = [ts.ckks_vector(context, sample.tolist()) for sample in new_features]

# Predict the diabetes status
diabetes_status = encrypted_predict_new_data(encrypted_new_features)
print("Diabetes status (1 for Diabetes, 0 for No Diabetes):", int(diabetes_status > 0.5))
