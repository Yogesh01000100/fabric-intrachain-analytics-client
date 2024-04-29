# Import necessary libraries
import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from concrete.ml.sklearn import LogisticRegression

def load_and_preprocess_data(csv_path):
    # Load data
    df = pd.read_csv(csv_path)
    
    # Map diabetes status to binary
    df['Diabetes_Status'] = df['Diabetes'].map({'No diabetes': 0, 'Diabetes': 1})

    # Select features and the target
    X = df[['Cholesterol', 'Glucose', 'HDL Chol', 'Chol/HDL ratio', 'Age', 'Height', 'Weight', 'BMI', 'Systolic BP', 'Diastolic BP', 'waist', 'hip', 'Waist/hip ratio']].values
    y = df['Diabetes_Status'].values

    return X, y

def main():
    # Path to the CSV dataset
    csv_path = os.path.join(os.getcwd(), 'd.csv')  # Adjust path as needed
    
    # Load and preprocess the data
    X, y = load_and_preprocess_data(csv_path)
    
    # Normalize features to range [0, 1]
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # Train the model on plaintext data
    model = LogisticRegression(n_bits=8)  # Use n_bits for quantization if needed
    model.fit(X_train, y_train)
    
    # Compile the model to optimize it for encrypted inference
    model.compile(X_train)  # Use a representative set of data to optimize FHE parameters
    
    # Encrypt test data
    x_test_encrypted = model.encrypt_input(X_test)
    
    # Make predictions on encrypted data
    y_pred_encrypted = model.predict(x_test_encrypted, fhe="execute")
    
    # Decrypt the predictions
    y_pred = model.decrypt_output(y_pred_encrypted)
    
    # Output decrypted predictions (you can add any evaluation here if desired)
    print("Decrypted predictions:", y_pred)

if __name__ == "__main__":
    main()
