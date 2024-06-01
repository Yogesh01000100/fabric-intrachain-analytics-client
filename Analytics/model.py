import sys
import torch
import tenseal as ts

class EncryptedLR:
    def __init__(self, torch_lr):
        self.weight = torch_lr.lr.weight.data.tolist()[0]
        self.bias = torch_lr.lr.bias.data.tolist()
    
    def forward(self, enc_x):
        enc_out = enc_x.dot(self.weight) + self.bias
        enc_out = EncryptedLR.sigmoid(enc_out)
        return enc_out

    @staticmethod
    def sigmoid(enc_x):
        return enc_x.polyval([0.5, 0.197, 0, -0.004])

    def encrypt(self, context):
        self.weight = ts.ckks_vector(context, self.weight)
        self.bias = ts.ckks_vector(context, self.bias)

    def decrypt(self):
        self.weight = self.weight.decrypt()
        self.bias = self.bias.decrypt()

    def __call__(self, *args, **kwargs):
        return self.forward(*args, **kwargs)

def load_encrypted_data_from_stdin(context):
    encrypted_data = []
    # Read all input from stdin as binary data
    data = sys.stdin.buffer.read()
    idx = 0
    while idx < len(data):
        length = int.from_bytes(data[idx:idx+4], byteorder='big')
        idx += 4
        vector_bytes = data[idx:idx+length]
        encrypted_data.append(ts.ckks_vector_from(context, vector_bytes))
        idx += length
    return encrypted_data

def predict_diabetes(model, encrypted_test_data):
    enc_x = encrypted_test_data[0]
    enc_out = model(enc_x)
    out = enc_out.decrypt()
    out = torch.tensor(out)
    out = torch.sigmoid(out)
    return out.item()

def load_model_and_context(model_path, context_path):
    model = torch.load(model_path)
    with open(context_path, "rb") as f:
        context = ts.context_from(f.read())
    return model, context

if __name__ == "__main__":
    model_path = 'HE_MODEL.HD5'
    context_path = 'encryption_context.tenseal'

    model, context = load_model_and_context(model_path, context_path)

    encrypted_test_data = load_encrypted_data_from_stdin(context)

    predicted_prob = predict_diabetes(model, encrypted_test_data)

    print(f"Prediction Probability is: {predicted_prob}")
