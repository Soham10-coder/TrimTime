from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import os

app = Flask(__name__, static_folder='static')
CORS(app)

# MongoDB Setup
client = MongoClient("mongodb://localhost:27017/")
db = client['legalconnect']
users = db['users']       # For lawyers
clients = db['clients']   # For clients
profiles = db['LawyerProfiles']

UPLOAD_FOLDER = r"D:/legalconnect/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/register', methods=['POST'])
def register():
    data = request.form
    email = data.get('email', '').strip().lower()
    is_lawyer = data.get('legalPractitioner') == 'on'

    collection = users if is_lawyer else clients

    if collection.find_one({'email': email}):
        return jsonify({'message': 'Email already registered'}), 409

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

    collection.insert_one(user_data)
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    # Try both collections
    user = users.find_one({'email': email, 'password': password})
    if not user:
        user = clients.find_one({'email': email, 'password': password})

    if user:
        full_name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
        return jsonify({
            'message': 'Login successful',
            'role': user.get('role'),
            'name': full_name,
            'email': user.get('email')
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/updateProfile', methods=['POST'])
def update_profile():
    email = request.form.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    achievements = request.form.get('achievements')
    experience = request.form.get('experience')
    specialization = request.form.get('specialization')

    user_folder = os.path.join(UPLOAD_FOLDER, secure_filename(email))
    os.makedirs(user_folder, exist_ok=True)

    def save_files(file_storage_list):
        file_urls = []
        for f in file_storage_list:
            if f and f.filename:
                filename = secure_filename(f.filename)
                path = os.path.join(user_folder, filename)
                f.save(path)
                file_urls.append(path)
        return file_urls

    certifications = request.files.getlist('certifications')
    graduation_certificates = request.files.getlist('graduationCertificates')
    profile_pic = request.files.get('profilePic')

    profile_data = {
        'email': email,
        'achievements': achievements,
        'experience': experience,
        'specialization': specialization,
        'certifications': save_files(certifications),
        'graduationCertificates': save_files(graduation_certificates),
        'profilePic': save_files([profile_pic])[0] if profile_pic else None
    }

    profiles.update_one({'email': email}, {'$set': profile_data}, upsert=True)
    return jsonify({'message': 'Profile updated successfully'}), 200

@app.route('/getProfile/<email>', methods=['GET'])
def get_profile(email):
    profile = profiles.find_one({'email': email}, {'_id': 0})
    if profile:
        return jsonify(profile), 200
    return jsonify({'message': 'Profile not found'}), 404

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

@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/profile')
def serve_profile():
    return send_from_directory('static', '4.lawyer_profile.html')

@app.route('/view-profile')
def serve_view_profile():
    return send_from_directory('static', '5.view_profile.html')

if __name__ == '__main__':
    app.run(debug=True)
