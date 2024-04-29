import time
import tenseal as ts
import requests
import pickle
import pandas as pd

# Function to upload files to Pinata Cloud and measure time taken
def upload_to_pinata(file_data, file_name, api_key, api_secret):
    headers = {
        "pinata_api_key": api_key,
        "pinata_secret_api_key": api_secret
    }
    files = {"file": (file_name, file_data)}
    start_time = time.time()
    response = requests.post("https://api.pinata.cloud/pinning/pinFileToIPFS", files=files, headers=headers)
    end_time = time.time()
    
    if response.status_code == 200:
        ipfs_hash = response.json()['IpfsHash']
        duration = end_time - start_time
        print(f"File '{file_name}' uploaded to IPFS with hash: {ipfs_hash} in {duration} seconds")
        return ipfs_hash, duration
    else:
        print(f"Error occurred while uploading file '{file_name}' to IPFS:", response.text)
        return None, None

# Function to fetch files from IPFS and measure time taken
def fetch_from_ipfs(ipfs_hash):
    start_time = time.time()
    response = requests.get(f"https://ipfs.io/ipfs/{ipfs_hash}")
    end_time = time.time()
    
    duration = end_time - start_time
    if response.status_code == 200:
        print(f"File with IPFS hash: {ipfs_hash} fetched in {duration} seconds")
        return duration
    else:
        print(f"Error occurred while fetching file with IPFS hash {ipfs_hash}: {response.text}")
        return None

# Your main script
def main():
    # Load the dataset
    df = pd.read_csv("d.csv", nrows=10)
    df['Diabetes_Status'] = df['Diabetes'].map({'No diabetes': 0, 'Diabetes': 1})
    selected_columns = ["Cholesterol", "Glucose", "HDL Chol", "Chol/HDL ratio", "Age",
                    "Height", "Weight", "BMI", "Systolic BP", "Diastolic BP",
                    "waist", "hip", "Waist/hip ratio", "Diabetes_Status"]
    classified_data = df[selected_columns].values

    context = ts.context(ts.SCHEME_TYPE.CKKS, poly_modulus_degree=8192, coeff_mod_bit_sizes=[60, 40, 40, 60])
    context.generate_galois_keys()
    context.global_scale = 2**40


    # Serialize the context
    serialized_context = context.serialize()
    with open("serialized_context.obj", "wb") as f:
        pickle.dump(serialized_context, f)

    # Initialize Pinata API credentials
    api_key = "d08a5d90b06c058adea6"
    api_secret = "ddadbd0f08f8d9bf3bdf68597619f84c24ea35d452148dd0717f42d376818d2b"

    # Encrypt and upload the data
    upload_times = []
    ipfs_hashes = []
    for i, sample in enumerate(classified_data):
        encrypted_sample = ts.ckks_vector(context, sample.tolist())
        serialized_sample = encrypted_sample.serialize()
        file_name = f"encrypted_data_{i+1}.txt"
        ipfs_hash, upload_time = upload_to_pinata(serialized_sample, file_name, api_key, api_secret)
        if ipfs_hash:
            ipfs_hashes.append(ipfs_hash)
            upload_times.append((ipfs_hash, upload_time))

    # Save upload times and IPFS hashes to a CSV
    upload_times_df = pd.DataFrame(upload_times, columns=['IPFS Hash', 'Time Taken (seconds)'])
    upload_times_df.to_csv('upload_times.csv', index=False)

    # Fetch all files and measure time
    fetch_times = []
    for ipfs_hash in ipfs_hashes:
        fetch_time = fetch_from_ipfs(ipfs_hash)
        if fetch_time is not None:
            fetch_times.append((ipfs_hash, fetch_time))

    # Save fetch times and IPFS hashes to a CSV
    fetch_times_df = pd.DataFrame(fetch_times, columns=['IPFS Hash', 'Fetch Time (seconds)'])
    fetch_times_df.to_csv('fetch_times.csv', index=False)

# Run the main function
if __name__ == "__main__":
    main()
