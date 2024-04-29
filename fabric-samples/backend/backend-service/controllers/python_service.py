import sys
import json
import ipfshttpclient

def upload_data(data):
    with open('temp_encrypted_data.txt', 'w') as file:
        file.write(data)
    try:
        client = ipfshttpclient.connect()
        res = client.add('temp_encrypted_data.txt')
        return {'IpfsHash': res['Hash']}
    except Exception as e:
        print("Failed to upload to IPFS:", str(e))
        return None

if __name__ == "__main__":
    data = sys.argv[1]
    ipfs_hash = upload_data(data)
    print(json.dumps(ipfs_hash))
