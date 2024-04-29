import tenseal as ts
import datetime
import pickle

def log_message(message, file_path="operations_log.txt"):
    with open(file_path, "a") as log_file:
        log_file.write(f"{datetime.datetime.now()}: {message}\n")

def create_context(poly_modulus_degree=4096, coeff_modulus_bits=[40, 20, 40]):
    # Create TenSEAL context using the BFV scheme
    context = ts.Context(
        ts.SCHEME_TYPE.CKKS,
        poly_modulus_degree,
        -1,
        coeff_modulus_bits
    )
    # Set the global scale
    context.global_scale = 2**40
    # Generate Galois keys for vector rotations
    context.generate_galois_keys()
    return context

# Initialize the TenSEAL context
ctx = create_context()

# Log the creation of the context
log_message("CKKS encryption context initialized.")

# Example plain array
plain_array = [0, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9]

# Encrypt plain array using CKKS vector
encrypted_plain_array = ts.ckks_vector(ctx, plain_array)

# Log the encryption operation
log_message("Plain array encrypted.")

# New array to be added
new_array = [1, 0, 2, 1, 1, 0, 1, 2, 3, 0, 1]
encrypted_new_array = ts.ckks_vector(ctx, new_array)

# Add the new array to the encrypted plain array
encrypted_combined_array = encrypted_plain_array + encrypted_new_array

# Decrypt the combined result
decrypted_combined_array = encrypted_combined_array.decrypt()

# Log the decryption operation
log_message("Combined array decrypted.")

# Serialize the encrypted combined array
encrypted_combined_array_serialized = encrypted_combined_array.serialize()

# Save the serialized encrypted combined array
with open("encrypted_combined_array.bin", "wb") as f:
    f.write(encrypted_combined_array_serialized)
log_message("Encrypted combined array serialized and saved.")

# Serialize the context with the secret key for decryption
with open("context_with_secret_key.bin", "wb") as f:
    f.write(ctx.serialize(save_secret_key=True))
log_message("Context with secret key serialized and saved.")



#csv_path = os.path.join(os.getcwd(), 'd.csv')