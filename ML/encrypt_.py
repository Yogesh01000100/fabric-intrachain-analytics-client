import sys
import json
import tenseal as ts

def create_context():
    poly_mod_degree = 8192
    coeff_mod_bit_sizes = [40, 21, 21, 21, 21, 21, 21, 40]
    ctx = ts.context(ts.SCHEME_TYPE.CKKS, poly_mod_degree, -1, coeff_mod_bit_sizes)
    ctx.global_scale = 2 ** 21
    ctx.generate_galois_keys()
    return ctx

def convert_data(data):
    gender_map = {'female': 0, 'male': 1}
    diabetes_map = {'No': 0, 'Yes': 1}
    numerical_data = [
        data.get('weight', 0),
        data.get('height', 0),
        data.get('age', 0),
        data.get('bmi', 0),
        data.get('children', 0),
        gender_map.get(data.get('gender', 'female'), 0),
        data.get('systolic_bp', 0),
        data.get('diastolic_bp', 0),
        data.get('temperature', 0),
        data.get('pulse_rate', 0),
        data.get('respiration_rate', 0),
        data.get('glucose_level', 0),
        data.get('cholesterol', 0),
        data.get('hemoglobin', 0),
        diabetes_map.get(data.get('diabetes', 'No'), 0)
    ]
    return numerical_data

def encrypt_data(ctx, data):
    numerical_data = convert_data(json.loads(data))
    encrypted_vector = ts.ckks_vector(ctx, numerical_data)
    return encrypted_vector.serialize()

if __name__ == '__main__':
    ctx = create_context()
    input_data = sys.stdin.read()
    encrypted_data = encrypt_data(ctx, input_data)
    print(encrypted_data)
