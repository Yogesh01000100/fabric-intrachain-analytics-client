import sys
import json
import os
import tenseal as ts
import pandas as pd
import numpy as np
import base64


context_file = '/home/yogesh/intrachain-client-network/fabric-samples/backend/backend-service/controllers/encryption_context.tenseal'

def load_context_from_file(file_name):
    #logging.info("Loading encryption context from file.")
    with open(file_name, 'rb') as f:
        context_bytes = f.read()
    ctx = ts.context_from(context_bytes)
    #logging.info("Encryption context loaded successfully.")
    return ctx

def prepare_data(data):
    #logging.info("Preparing data for encryption.")
    if isinstance(data, dict):
        if not any(isinstance(v, list) for v in data.values()):
            data = [data]

    df = pd.DataFrame(data)
    df.dropna(inplace=True)
    df.drop(columns=["Patient number"], inplace=True)
    df.replace({"Diabetes": {"No diabetes": 0, "Diabetes": 1},
                "Gender": {"female": 0, "male": 1}}, inplace=True)
    df = df.astype({"Diabetes": np.float32, "Gender": np.float32})
    df = (df - df.mean()) / df.std() 
    #logging.info("Data prepared and normalized.")
    return df.values.tolist()

def encrypt_data(ctx, data):
    #logging.info("Encrypting data.")
    encrypted_vectors = [ts.ckks_vector(ctx, record) for record in data]
    serialized_data = [base64.b64encode(vec.serialize()).decode('utf-8') for vec in encrypted_vectors]
    #logging.info("Data encrypted and serialized successfully.")
    return serialized_data

if __name__ == '__main__':
    if not os.path.exists(context_file):
        #logging.error("Context file does not exist.")
        sys.exit(1)

    ctx = load_context_from_file(context_file)
    input_data = sys.stdin.read()
    try:
        json_data = json.loads(input_data)
    except json.JSONDecodeError as e:
        #logging.error(f"Error decoding JSON: {e}")
        sys.exit(1)
        
    prepared_data = prepare_data(json_data)
    encrypted_data = encrypt_data(ctx, prepared_data)
    print(json.dumps({"encrypted_data": encrypted_data}))
