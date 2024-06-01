import os
import tenseal as ts
import pandas as pd
import numpy as np
import sys
import json

context_file = '/home/yogesh/intrachain-client-network/fabric-samples/backend/backend-service/controllers/encryption_context.tenseal'
output_file = 'encrypted_data.dat'
test_index = 0

def load_context_from_file(file_name):
    with open(file_name, 'rb') as f:
        context_bytes = f.read()
    ctx = ts.context_from(context_bytes)
    return ctx

def prepare_data(df):
    print("Original DataFrame:\n", df)
    df.dropna(inplace=True)
    df.drop(columns=["Patient number"], inplace=True)
    df.replace({"Gender": {"female": 0, "male": 1}}, inplace=True)
    df = df.astype(np.float32)
    if df.shape[0] > 1:
        df = (df - df.mean()) / df.std()
    else:
        df = df - df.mean()
    print("DataFrame after preprocessing:\n", df)
    return df

def encrypt_data(ctx, data):
    encrypted_vectors = [ts.ckks_vector(ctx, record.tolist()) for record in data.to_numpy()]
    return encrypted_vectors

def save_encrypted_data(encrypted_data, file_path):
    with open(file_path, 'wb') as f:
        for vec in encrypted_data:
            vec_bytes = vec.serialize()
            length_bytes = len(vec_bytes).to_bytes(4, byteorder='big')
            f.write(length_bytes)
            f.write(vec_bytes)

if __name__ == '__main__':
    if not os.path.exists(context_file):
        print("Context file does not exist.")
        sys.exit(1)

    ctx = load_context_from_file(context_file)

    json_data = sys.stdin.read()
    print(json_data)
    data = json.loads(json_data)

    df = pd.DataFrame([data])
    prepared_data = prepare_data(df)

    row_to_encrypt = prepared_data.iloc[[test_index]]
    print(f"Data to encrypt (size {row_to_encrypt.shape[1]}):", row_to_encrypt.values)
    encrypted_data = encrypt_data(ctx, row_to_encrypt)

    save_encrypted_data(encrypted_data, output_file)

    print(f"Encrypted data has been saved to {output_file}")
