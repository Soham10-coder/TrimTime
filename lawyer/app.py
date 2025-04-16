from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client['legalconnect']
users = db['users']  # Unified collection

@app.route('/register', methods=['POST'])
def register():
    data = request.form

    email = data.get('email')
    if users.find_one({'email': email}):
        return jsonify({'message': 'Email already registered'}), 409

    is_lawyer = data.get('legalPractitioner') == 'on'

    user_data = {
        'firstName': data.get('firstName'),
        'middleName': data.get('MiddleName'),
        'lastName': data.get('LastName'),
        'email': email,
        'phone': data.get('phone'),
        'password': data.get('password'),
        'role': 'lawyer' if is_lawyer else 'client',
        'barCouncilNumber': data.get('barCouncilNumber') if is_lawyer else None
    }

    users.insert_one(user_data)
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = users.find_one({'email': email, 'password': password})
    if user:
        return jsonify({
            'message': 'Login successful',
            'role': user.get('role')
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

# Serve HTML files
@app.route('/')
def serve_login():
    return send_from_directory('static', '1.user_login.html')

@app.route('/register-page')
def serve_register():
    return send_from_directory('static', '2.lawyer_reg.html')

@app.route('/lawyer/dashboard')
def serve_lawyer_dashboard():
    return send_from_directory('static', '3.lawyer_dashboard.html')

@app.route('/client/dashboard')
def serve_client_dashboard():
    return send_from_directory('static', 'cdash.html')

if __name__ == '__main__':
    app.run(debug=True)
