from bson import ObjectId
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from flask_mail import Mail, Message
from flask_socketio import SocketIO, join_room, leave_room, emit
import dotenv

dotenv.load_dotenv()


app = Flask(__name__, static_folder='static')
CORS(app)
mail = Mail(app)
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def home():
    return send_from_directory("static", "1.user_login.html")

@app.route("/<path:filename>")
def serve_static(filename):
    static_path = os.path.join(app.root_path, 'static')
    if os.path.exists(os.path.join(static_path, filename)):
        return send_from_directory(static_path, filename)
    else:
        return "File not found", 404

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = os.getenv('GMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('GMAIL_PASS')
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = True

# MongoDB Setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client['legalconnect']
users = db['users']
clients = db['clients']
profiles = db['LawyerProfiles']
appointments_col = db['appointments']
messages_col = db['messages']

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Upload folders
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads', 'profilepic')
CASE_FILES_FOLDER = os.path.join(BASE_DIR, 'uploads', 'case_files')
CHAT_FILES_FOLDER = os.path.join(BASE_DIR, 'uploads', 'chat_files')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CASE_FILES_FOLDER, exist_ok=True)
os.makedirs(CHAT_FILES_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Register
@app.route('/register', methods=['POST'])
def register():
    data = request.form
    email = data.get('email', '').strip().lower()
    user_type = data.get('userType', '').lower()
    is_lawyer = user_type == 'lawyer'
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

# Login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    print(f"Login attempt for email: {email}")  # Debug log

    user = users.find_one({'email': email, 'password': password})
    if user:
        print(f"Found user in lawyers collection: {user.get('role')}")  # Debug log
    else:
        user = clients.find_one({'email': email, 'password': password})
        if user:
            print(f"Found user in clients collection: {user.get('role')}")  # Debug log
        else:
            print("User not found in either collection")  # Debug log

    if user:
        full_name = f"{user.get('firstName', '')} {user.get('lastName', '')}".strip()
        return jsonify({
            'message': 'Login successful',
            'role': user.get('role'),
            'name': full_name,
            'email': user.get('email')
        }), 200

    return jsonify({'message': 'Invalid credentials'}), 401

# Update Profile
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

    existing_profile = profiles.find_one({'email': email}) or {}

    new_certs = save_files(certifications)
    new_grads = save_files(graduation_certificates)
    new_pics = save_files([profile_pic]) if profile_pic else []

    final_certs = new_certs if new_certs else existing_profile.get('certifications', [])
    final_grads = new_grads if new_grads else existing_profile.get('graduationCertificates', [])
    final_pic = new_pics[0] if new_pics else existing_profile.get('profilePic')

    profile_data = {
        'email': email,
        'achievements': achievements,
        'experience': experience,
        'specialization': specialization,
        'certifications': final_certs,
        'graduationCertificates': final_grads,
        'profilePic': final_pic
    }

    profiles.update_one({'email': email}, {'$set': profile_data}, upsert=True)
    return jsonify({'message': 'Profile updated successfully'}), 200

# Get Profile
@app.route('/getProfile/<email>', methods=['GET'])
def get_profile(email):
    profile = profiles.find_one({'email': email}, {'_id': 0})
    if not profile:
        return jsonify({'message': 'Profile not found'}), 404

    user = users.find_one({'email': email})
    if user:
        profile['firstName'] = user.get('firstName', '')
        profile['lastName'] = user.get('lastName', '')
        profile['phone'] = user.get('phone', '')

    def get_url(path):
        if not path: return ""
        try:
            rel_path = os.path.relpath(path, UPLOAD_FOLDER).replace("\\", "/")
            return f"{request.host_url}uploads/{rel_path}"
        except:
            return ""

    profile['profilePicUrl'] = get_url(profile.get('profilePic'))
    profile['certificationsUrls'] = [get_url(p) for p in profile.get('certifications', [])]
    profile['graduationCertificatesUrls'] = [get_url(p) for p in profile.get('graduationCertificates', [])]

    return jsonify(profile), 200

# Serve uploads
@app.route('/uploads/<path:filename>')
def serve_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/uploads/case_files/<path:filename>')
def serve_case_files(filename):
    return send_from_directory(CASE_FILES_FOLDER, filename)

@app.route('/uploads/chat_files/<path:filename>')
def serve_chat_files(filename):
    return send_from_directory(CHAT_FILES_FOLDER, filename)

# Get Lawyers
@app.route('/getLawyers', methods=['GET'])
def get_lawyers():
    lawyers = users.find({'role': 'lawyer'})
    results = []
    for lawyer in lawyers:
        email = lawyer.get('email')
        profile = profiles.find_one({'email': email})
        if profile:
            profile_pic_path = profile.get('profilePic')
            if profile_pic_path:
                relative_path = os.path.relpath(profile_pic_path, UPLOAD_FOLDER).replace("\\", "/")
                profile_pic_url = f"{request.host_url}uploads/{relative_path}"
            else:
                profile_pic_url = "default.jpg"

            results.append({
                'firstName': lawyer.get('firstName', ''),
                'lastName': lawyer.get('lastName', ''),
                'email': email,
                'specialization': profile.get('specialization', 'Not specified'),
                'profilePic': profile_pic_url
            })
    return jsonify(results), 200

# Schedule Appointment (Accepts FormData)
@app.route('/scheduleAppointment', methods=['POST'])
def schedule_appointment():
    lawyer_email = request.form.get('lawyerEmail')
    client_email = request.form.get('clientEmail')
    client_name = request.form.get('clientName')
    date = request.form.get('date')
    time = request.form.get('time')
    topic = request.form.get('topic')
    description = request.form.get('description', '')

    if not all([lawyer_email, client_email, date, time, topic]):
        return jsonify({'message': 'All required fields must be filled.'}), 400

    files = request.files.getlist('caseFiles')
    file_urls = []
    
    if files:
        user_folder = os.path.join(CASE_FILES_FOLDER, secure_filename(client_email))
        os.makedirs(user_folder, exist_ok=True)
        for f in files:
            if f and f.filename:
                filename = secure_filename(f.filename)
                path = os.path.join(user_folder, filename)
                f.save(path)
                rel_path = f"{secure_filename(client_email)}/{filename}"
                file_urls.append(f"{request.host_url}uploads/case_files/{rel_path}")

    appointment = {
        'lawyer_email': lawyer_email,
        'client_email': client_email,
        'client_name': client_name,
        'date': date,
        'time': time,
        'topic': topic,
        'description': description,
        'caseFiles': file_urls,
        'created_at': datetime.utcnow()
    }

    appointments_col.insert_one(appointment)
    return jsonify({'success': True, 'message': 'Appointment scheduled successfully'}), 200

@app.route('/api/lawyer/appointments', methods=['GET'])
def get_lawyer_appointments():
    lawyer_email = request.args.get('lawyerEmail')
    if not lawyer_email:
        return jsonify([]), 200

    appointments = list(appointments_col.find({'lawyer_email': lawyer_email}))
    for appt in appointments:
        appt['_id'] = str(appt['_id'])
        appt['clientName'] = appt.get('client_name', '')
        appt['clientEmail'] = appt.get('client_email', '')
        appt['topic'] = appt.get('topic', '')
        appt['description'] = appt.get('description', '')
        appt['caseFiles'] = appt.get('caseFiles', [])
    return jsonify(appointments), 200

@app.route('/api/client/appointments', methods=['GET'])
def get_client_appointments():
    client_email = request.args.get('clientEmail')
    appointments = list(appointments_col.find({'client_email': client_email}))
    for appt in appointments:
        appt['_id'] = str(appt['_id'])
    return jsonify(appointments), 200


@app.route('/api/lawyer/appointment/status', methods=['POST'])
def update_appointment_status():
    data = request.get_json()
    appointment_id = data.get('appointmentId')
    status = data.get('status')
    if not appointment_id or not status:
        return jsonify({'message': 'Appointment ID and status are required'}), 400

    result = appointments_col.update_one(
        {'_id': ObjectId(appointment_id)},
        {'$set': {'status': status}}
    )
    if result.matched_count == 0:
        return jsonify({'message': 'Appointment not found'}), 404

    # Send email to client if accepted
    if status.lower() == 'accepted':
        appointment = appointments_col.find_one({'_id': ObjectId(appointment_id)})
        if appointment:
            # Always use the correct field for client email
            client_email = appointment.get('client_email') or appointment.get('clientEmail')
            lawyer_email = appointment.get('lawyer_email') or appointment.get('lawyerEmail')
            date = appointment.get('date')
            time = appointment.get('time')
            topic = appointment.get('topic', '')
            # Fetch names if available
            client = clients.find_one({'email': client_email})
            lawyer = users.find_one({'email': lawyer_email})
            client_name = (client.get('firstName', '') + ' ' + client.get('lastName', '')).strip() if client else client_email
            lawyer_name = (lawyer.get('firstName', '') + ' ' + lawyer.get('lastName', '')).strip() if lawyer else lawyer_email

            # Email setup
            sender_email = os.getenv('GMAIL_USER')
            sender_password = os.getenv("GMAIL_PASS")  # Use App Password, not your main password!
            receiver_email = client_email

            subject = "Appointment Accepted - LegalConnect"
            html = f"""
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
            <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #e0e0e0; padding: 32px;">
                <div style="text-align:center;">
                <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="LegalConnect" width="64" style="margin-bottom: 16px;">
                <h2 style="color: #1976d2; margin-bottom: 8px;">Appointment Accepted</h2>
                </div>
                <p style="font-size: 16px; color: #222;">
                Dear <b>{client_name}</b>,
                </p>
                <p style="font-size: 16px; color: #222;">
                Your appointment request with <b>{lawyer_name}</b> has been <span style="color: #388e3c;"><b>accepted</b></span>.
                </p>
                <div style="background: #f1f8e9; border-radius: 6px; padding: 16px; margin: 18px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">Appointment Details</h3>
                <table style="width:100%; font-size:15px;">
                    <tr>
                    <td style="padding: 4px 0;"><b>Date:</b></td>
                    <td style="padding: 4px 0;">{date}</td>
                    </tr>
                    <tr>
                    <td style="padding: 4px 0;"><b>Time:</b></td>
                    <td style="padding: 4px 0;">{time}</td>
                    </tr>
                    <tr>
                    <td style="padding: 4px 0;"><b>Topic:</b></td>
                    <td style="padding: 4px 0;">{topic}</td>
                    </tr>
                </table>
                </div>
                <p style="font-size: 15px; color: #444;">
                Please be available at the scheduled time. If you have any questions, feel free to reply to this email.
                </p>
                <div style="margin-top: 30px; text-align:center;">
                <span style="color: #888; font-size: 13px;">Thank you for using <b>LegalConnect</b>.</span>
                </div>
            </div>
            </div>
            """

            msg = MIMEMultipart()
            msg['From'] = sender_email
            msg['To'] = receiver_email
            msg['Subject'] = subject
            msg.attach(MIMEText(html, 'html'))

            try:
                print("Sending email to:", receiver_email)  # Debug print
                with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
                    server.login(sender_email, sender_password)
                    server.sendmail(sender_email, receiver_email, msg.as_string())
                print("Email sent successfully.")
            except Exception as e:
                print("Error sending email:", e)

    return jsonify({'message': f'Appointment {status.lower()}.'}), 200

@app.route('/api/client/details', methods=['GET'])
def get_client_details():
    client_email = request.args.get('clientEmail')
    client = clients.find_one({'email': client_email}, {'_id': 0, 'password': 0})
    if not client:
        return jsonify({'message': 'Client not found'}), 404
    return jsonify(client), 200

# --- Chat System ---
@app.route('/api/chat/upload', methods=['POST'])
def upload_chat_file():
    room = request.form.get('room')
    file = request.files.get('file')
    if not room or not file or not file.filename:
        return jsonify({'message': 'Invalid file sequence.'}), 400
        
    filename = secure_filename(f"{int(datetime.utcnow().timestamp())}_{file.filename}")
    room_folder = os.path.join(CHAT_FILES_FOLDER, secure_filename(room))
    os.makedirs(room_folder, exist_ok=True)
    
    path = os.path.join(room_folder, filename)
    file.save(path)
    
    file_url = f"{request.host_url}uploads/chat_files/{secure_filename(room)}/{filename}"
    return jsonify({'url': file_url, 'filename': file.filename}), 200

@app.route('/api/messages/<room>', methods=['GET'])
def get_messages(room):
    msgs = list(messages_col.find({'room': room}).sort('timestamp', 1))
    for m in msgs:
        m['_id'] = str(m['_id'])
    return jsonify(msgs), 200

@socketio.on('join_room')
def handle_join_room(data):
    room = data.get('room')
    if room:
        join_room(room)
        print(f"User joined room: {room}")

@socketio.on('send_message')
def handle_message(data):
    room = data.get('room')
    message = data.get('message', '')
    sender = data.get('sender')
    sender_email = data.get('senderEmail') 
    file_url = data.get('fileUrl', None)
    file_name = data.get('fileName', None)
    
    if room and (message or file_url):
        msg_doc = {
            'room': room,
            'message': message,
            'sender': sender,
            'senderEmail': sender_email,
            'fileUrl': file_url,
            'fileName': file_name,
            'timestamp': datetime.utcnow()
        }
        messages_col.insert_one(msg_doc)
        
        emit('receive_message', {
            'message': message,
            'sender': sender,
            'senderEmail': sender_email,
            'fileUrl': file_url,
            'fileName': file_name,
            'timestamp': msg_doc['timestamp'].isoformat()
        }, room=room)

# Run App
if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 10000))
    socketio.run(app, host="0.0.0.0", port=port, debug=False)