import sys
import json
import requests
import tenseal as ts
import numpy as np

def encrypt_and_upload_data(input_data):

    # Encrypt the classified dataset
    encrypted_classified_data = []
    for sample in input_data:
        encrypted_sample = ts.bfv_vector(public_context, sample.tolist())
        encrypted_classified_data.append(encrypted_sample)

    # Upload the text file to IPFS Pinata
    api_key = "d08a5d90b06c058adea6"
    api_secret = "ddadbd0f08f8d9bf3bdf68597619f84c24ea35d452148dd0717f42d376818d2b"
    endpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": api_key,
        "pinata_secret_api_key": api_secret,
    }

    with open("encrypted_data.txt", "w") as file:
        file.write("Encrypted classified dataset:\n")
        for i, sample in enumerate(encrypted_classified_data):
            file.write(f"Sample {i+1}: {sample.serialize()}\n")

    with open("encrypted_data.txt", "rb") as file:
        files = {"file": file}
        response = requests.post(endpoint, files=files, headers=headers)

    # Return IPFS response
    return response.json()

if __name__ == "__main__":
    context = ts.context(ts.SCHEME_TYPE.BFV, poly_modulus_degree=4096, plain_modulus=1032193)
    public_context = context.copy()
    public_context.make_context_public()

    # Generate a secret key
    secret_key = context.secret_key()
    input_data_json = sys.argv[1]
    input_data = json.loads(input_data_json)

    input_data = np.array(input_data)

    response = encrypt_and_upload_data(input_data)
    print(response)


