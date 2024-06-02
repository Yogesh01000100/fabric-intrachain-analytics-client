import torch
import tenseal as ts
import pandas as pd
import random
from time import time
import numpy as np
import matplotlib.pyplot as plt
import os

# Load and preprocess the data
username = os.getenv('USER')
data_path = os.path.join('/home', username, 'intrachain-client-network', 'Analytics', 'dataset.csv')
data = pd.read_csv(data_path)
data = data.dropna()
data = data.drop(columns=["Patient number"])
data.loc[data["Diabetes"] == "No diabetes", "Diabetes"] = 0
data.loc[data["Diabetes"] == "Diabetes", "Diabetes"] = 1
data.loc[data["Gender"] == "female", "Gender"] = 0
data.loc[data["Gender"] == "male", "Gender"] = 1
data = data.astype({"Diabetes": np.float32})
data = data.astype({"Gender": np.float32})
categorical_features = ['Gender','Diabetes']

data.head()
# Generate synthetic data
from sdv.single_table import CTGANSynthesizer
from sdv.metadata import SingleTableMetadata

metadata = SingleTableMetadata()
metadata.detect_from_dataframe(data)
synthesizer = CTGANSynthesizer(metadata, enforce_rounding=False, epochs=500, verbose=True)
synthesizer.fit(data)
synthetic_data = synthesizer.sample(num_rows=5000)

synthetic_data.head()
# Split data into training and test sets
torch.random.manual_seed(73)
random.seed(73)

def split_train_test(x, y, test_ratio=0.3):
    idxs = [i for i in range(len(x))]
    random.shuffle(idxs)
    delim = int(len(x) * test_ratio)
    test_idxs, train_idxs = idxs[:delim], idxs[delim:]
    return x[train_idxs], y[train_idxs], x[test_idxs], y[test_idxs]

def diabetes_data():
    grouped = synthetic_data.groupby('Diabetes')
    data = grouped.apply(lambda x: x.sample(grouped.size().min(), random_state=73).reset_index(drop=True))
    y = torch.tensor(data["Diabetes"].values).float().unsqueeze(1)
    data = data.drop(columns=["Diabetes"])
    data = (data - data.mean()) / data.std()
    x = torch.tensor(data.values).float()
    return split_train_test(x, y)

x_train, y_train, x_test, y_test = diabetes_data()

print(f"x_train has shape: {x_train.shape}")
print(f"y_train has shape: {y_train.shape}")
print(f"x_test has shape: {x_test.shape}")
print(f"y_test has shape: {y_test.shape}")

n_features = x_train.shape[1]

# Define the logistic regression model
class LR(torch.nn.Module):
    def __init__(self, n_features):
        super(LR, self).__init__()
        self.lr = torch.nn.Linear(n_features, 1)

    def forward(self, x):
        out = torch.sigmoid(self.lr(x))
        return out

def accuracy(model, x, y):
    out = model(x)
    correct = torch.abs(y - out) < 0.5
    return correct.float().mean()

model = LR(n_features)
optim = torch.optim.Adam(model.parameters(), lr=0.001)
criterion = torch.nn.BCELoss()

# Train the model
EPOCHS = 7000
history = []
train_accuracy = []
val_accuracy = []

def train(model, optim, criterion, x, y, epochs=EPOCHS):
    for e in range(1, epochs + 1):
        optim.zero_grad()
        out = model(x)
        loss = criterion(out, y)
        loss.backward()
        optim.step()
        history.append(loss.data)
        train_accuracy.append(accuracy(model,x,y))
        val_accuracy.append(accuracy(model,x_test, y_test))
    return model

model = train(model, optim, criterion, x_train, y_train)

plain_accuracy = accuracy(model, x_test, y_test)
print(f"Accuracy on plain test_set: {plain_accuracy}")

# Plot the training and validation accuracy
epochs = range(1, 7001)
plt.plot(epochs, train_accuracy, label='Training Accuracy')
plt.plot(epochs, val_accuracy, label='Validation Accuracy')
plt.title('Accuracy vs Epochs')
plt.xlabel('Epochs')
plt.ylabel('Accuracy')
plt.legend(loc='best')
plt.show()

# Plot the training loss
plt.plot(epochs, history, label='Training Loss')
plt.title('Loss vs Epochs')
plt.xlabel('Epochs')
plt.ylabel('Loss')
plt.legend(loc='best')
plt.show()

# Encrypted Logistic Regression
class EncryptedLR:
    def __init__(self, torch_lr):
        self.weight = torch_lr.lr.weight.data.tolist()[0]
        self.bias = torch_lr.lr.bias.data.tolist()
        self._delta_w = 0
        self._delta_b = 0
        self._count = 0

    def forward(self, enc_x):
        enc_out = enc_x.dot(self.weight) + self.bias
        enc_out = EncryptedLR.sigmoid(enc_out)
        return enc_out

    def backward(self, enc_x, enc_out, enc_y):
        out_minus_y = (enc_out - enc_y)
        self._delta_w += enc_x * out_minus_y
        self._delta_b += out_minus_y
        self._count += 1

    def update_parameters(self):
        if self._count == 0:
            raise RuntimeError("At least one forward iteration required!")

        self.weight -= self._delta_w * (1 / self._count) + self.weight * 0.05
        self.bias -= self._delta_b * (1 / self._count)
        self._delta_w = 0
        self._delta_b = 0
        self._count = 0

    @staticmethod
    def sigmoid(enc_x):
        return enc_x.polyval([0.5, 0.197, 0, -0.004])

    def plain_accuracy(self, x_test, y_test):
        w = torch.tensor(self.weight)
        b = torch.tensor(self.bias)
        out = torch.sigmoid(x_test.matmul(w) + b).reshape(-1, 1)
        correct = torch.abs(y_test - out) < 0.5
        return correct.float().mean()

    def encrypt(self, context):
        self.weight = ts.ckks_vector(context, self.weight)
        self.bias = ts.ckks_vector(context, self.bias)

    def decrypt(self):
        self.weight = self.weight.decrypt()
        self.bias = self.bias.decrypt()

    def __call__(self, *args, **kwargs):
        return self.forward(*args, **kwargs)

context_file = "encryption_context.tenseal"

if not os.path.exists(context_file):
    poly_mod_degree = 8192
    coeff_mod_bit_sizes = [40, 21, 21, 21, 21, 21, 21, 40]
    ctx_training = ts.context(ts.SCHEME_TYPE.CKKS, poly_mod_degree, -1, coeff_mod_bit_sizes)
    ctx_training.global_scale = 2 ** 21
    ctx_training.generate_galois_keys()
    with open(context_file, "wb") as f:
        f.write(ctx_training.serialize(save_secret_key=True))  # Save with secret key
else:
    with open(context_file, "rb") as f:
        ctx_training = ts.context_from(f.read())


eelr = EncryptedLR(model)

'''
t_start = time()
enc_x_test = [ts.ckks_vector(ctx_training, x.tolist()) for x in x_test]
t_end = time()
print(f"Encryption of the test-set took {int(t_end - t_start)} seconds")
def encrypted_evaluation(model, enc_x_test, y_test):
    t_start = time()
    correct = 0
    for enc_x, y in zip(enc_x_test, y_test):
        enc_out = model(enc_x)
        out = enc_out.decrypt()
        out = torch.tensor(out)
        out = torch.sigmoid(out)
        if torch.abs(out - y) < 0.5:
            correct += 1
    t_end = time()
    print(f"Evaluated test_set of {len(x_test)} entries in {int(t_end - t_start)} seconds")
    print(f"Accuracy: {correct}/{len(x_test)} = {correct / len(x_test)}")
    return correct / len(x_test)

encrypted_accuracy = encrypted_evaluation(eelr, enc_x_test, y_test)
diff_accuracy = plain_accuracy - encrypted_accuracy
print(f"Difference between plain and encrypted accuracies: {diff_accuracy}")
'''
# Save the model
model_path = 'HE_MODEL.HD5'
torch.save(eelr, model_path)

'''
# Load and test the saved model
HE_MODEL = torch.load(model_path)
enc_out = HE_MODEL(enc_x_test[123])
out = enc_out.decrypt()
out = torch.tensor(out)
out = torch.sigmoid(out)

print(f"Prediction Probability is: {out} and Ground Truth is: {y_test[123]}")
'''