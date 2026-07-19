import bcrypt
import random
import datetime
import logging
from flask import request, jsonify, make_response
from bson import ObjectId
from app.db import users_col, otps_col, refresh_tokens_col
from app.middlewares.auth import generate_access_token, generate_refresh_token, decode_token
from app.utils.email_utils import send_verification_otp, send_reset_otp
from app.validators.auth_validator import validate_email, validate_phone, validate_password, validate_gender
from config import Config

logger = logging.getLogger(__name__)

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        logger.error(f"Error checking password: {e}")
        return False

def generate_otp():
    return str(random.randint(100000, 999999))

def register_customer():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        phone = data.get('phone', '').strip()
        gender = data.get('gender', 'Male').strip()
        role = data.get('role', 'customer')

        if not email or not password or not name:
            return jsonify({'message': 'Name, email and password are required'}), 400

        # Validate inputs
        val_e, msg_e = validate_email(email)
        if not val_e:
            return jsonify({'message': msg_e}), 400

        if phone:
            val_p, msg_p = validate_phone(phone)
            if not val_p:
                return jsonify({'message': msg_p}), 400

        val_pwd, msg_pwd = validate_password(password)
        if not val_pwd:
            return jsonify({'message': msg_pwd}), 400

        val_g, msg_g = validate_gender(gender)
        if not val_g:
            return jsonify({'message': msg_g}), 400

        # Validate role
        if role not in ['customer', 'admin']:
            role = 'customer'

        # Check existing user
        if users_col.find_one({'$or': [{'email': email}, {'phone': phone}] if phone else [{'email': email}]}):
            return jsonify({'message': 'Email or phone number is already registered'}), 409

        hashed_pass = hash_password(password)
        user_doc = {
            'name': name,
            'email': email,
            'phone': phone,
            'gender': gender,
            'password': hashed_pass,
            'role': role,
            'verified': False,
            'loyalty_points': 0,
            'favorites': [],
            'created_at': datetime.datetime.utcnow()
        }

        result = users_col.insert_one(user_doc)
        
        # Generate OTP
        otp = generate_otp()
        otps_col.delete_many({'email': email})
        otps_col.insert_one({
            'email': email,
            'otp': otp,
            'type': 'signup',
            'created_at': datetime.datetime.utcnow()
        })

        # Send Email Verification
        send_verification_otp(email, name, otp)

        return jsonify({
            'message': 'Registration successful. Please verify email with OTP sent.',
            'email': email
        }), 201

    except Exception as e:
        logger.error(f"Error in register_customer: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def verify_otp():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        otp_type = data.get('type', 'signup')

        if not email or not otp:
            return jsonify({'message': 'Email and OTP are required'}), 400

        # Validate OTP
        record = otps_col.find_one({'email': email, 'otp': otp, 'type': otp_type})
        if not record:
            return jsonify({'message': 'Invalid OTP or expired code'}), 400

        # Check expiry (10 minutes)
        now = datetime.datetime.utcnow()
        if (now - record['created_at']).total_seconds() > 600:
            otps_col.delete_one({'_id': record['_id']})
            return jsonify({'message': 'OTP has expired'}), 400

        # Update verification status in users collection
        users_col.update_one({'email': email}, {'$set': {'verified': True}})
        
        # Delete OTP record
        otps_col.delete_one({'_id': record['_id']})

        return jsonify({'message': 'OTP verified successfully. Your account is active.'}), 200

    except Exception as e:
        logger.error(f"Error in verify_otp: {e}")
        return jsonify({'message': 'Internal server error'}), 500

def resend_otp():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        otp_type = data.get('type', 'signup')

        if not email:
            return jsonify({'message': 'Email is required'}), 400

        user = users_col.find_one({'email': email})
        if not user:
            return jsonify({'message': 'User not found'}), 404

        otp = generate_otp()
        otps_col.delete_many({'email': email, 'type': otp_type})
        otps_col.insert_one({
            'email': email,
            'otp': otp,
            'type': otp_type,
            'created_at': datetime.datetime.utcnow()
        })

        if otp_type == 'signup':
            send_verification_otp(email, user.get('name'), otp)
        else:
            send_reset_otp(email, otp)

        return jsonify({'message': 'OTP resent successfully.'}), 200

    except Exception as e:
        logger.error(f"Error in resend_otp: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def login():
    try:
        data = request.json or {}
        identifier = data.get('email', '').strip().lower() # Can be email or phone
        password = data.get('password', '')

        if not identifier or not password:
            return jsonify({'message': 'Email/Mobile and password are required'}), 400

        # Dual Login Lookup: Query by email or phone
        user = users_col.find_one({'role': 'admin', '$or': [{'email': identifier}, {'phone': identifier}]})
        role = None

        if user:
            role = 'admin'
        else:
            user = users_col.find_one({'$or': [{'email': identifier}, {'phone': identifier}]})
            if user:
                role = user.get('role', 'customer')
            else:
                from app.db import barbers_col
                user = barbers_col.find_one({'$or': [{'email': identifier}, {'phone': identifier}]})
                if user:
                    role = 'barber'

        pwd_match = check_password(password, user['password']) if user else False
        if not user or not pwd_match:
            return jsonify({'message': 'Invalid email/mobile or password'}), 401

        user_email = user.get('email')

        # Check if verified (barbers check for active, customers check for verified)
        if role == 'customer' and not user.get('verified', False):
            # Send verification OTP again
            otp = generate_otp()
            otps_col.delete_many({'email': user_email})
            otps_col.insert_one({
                'email': user_email,
                'otp': otp,
                'type': 'signup',
                'created_at': datetime.datetime.utcnow()
            })
            send_verification_otp(user_email, user.get('name', 'Customer'), otp)
            return jsonify({
                'message': 'Account not verified. OTP sent to your email.',
                'code': 'UNVERIFIED',
                'email': user_email
            }), 403

        if role == 'barber':
            # Barbers check verification status
            ver_status = user.get('verification_status', 'PENDING_VERIFICATION')
            if not user.get('verified', False) and ver_status != 'APPROVED':
                return jsonify({
                    'message': 'Your barber account registration is pending admin approval. You will receive an email once approved.',
                    'code': 'PENDING_APPROVAL'
                }), 403
            if user.get('status') == 'inactive':
                return jsonify({
                    'message': 'Your account has been deactivated. Please contact administration.',
                    'code': 'DEACTIVATED'
                }), 403

        # Create JWT Tokens
        user_id = str(user['_id'])
        access_token = generate_access_token(user_id, user_email, role)
        refresh_token = generate_refresh_token(user_id, user_email, role)

        # Save refresh token in DB
        refresh_tokens_col.insert_one({
            'token': refresh_token,
            'user_id': user_id,
            'email': user_email,
            'role': role,
            'created_at': datetime.datetime.utcnow()
        })

        # Return Access Token in body and Refresh Token in HTTP-only Cookie
        response = make_response(jsonify({
            'accessToken': access_token,
            'user': {
                'id': user_id,
                'name': user.get('name') if role != 'barber' else user.get('owner_name'),
                'email': user_email,
                'role': role,
                'shopName': user.get('shop_name') if role == 'barber' else None,
                'profilePic': user.get('profile_pic', '')
            }
        }), 200)

        # 7 days cookie
        response.set_cookie(
            'refreshToken', 
            refresh_token, 
            httponly=True, 
            secure=True,
            samesite='None',
            max_age=7*24*60*60
        )
        return response

    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def refresh_token():
    try:
        refresh_token_val = request.cookies.get('refreshToken') or (request.json or {}).get('refreshToken')

        if not refresh_token_val:
            return jsonify({'message': 'Refresh token is missing'}), 401

        payload = decode_token(refresh_token_val, Config.JWT_REFRESH_SECRET_KEY)
        if payload == "EXPIRED" or not payload:
            refresh_tokens_col.delete_one({'token': refresh_token_val})
            return jsonify({'message': 'Refresh token expired or invalid', 'code': 'REFRESH_TOKEN_EXPIRED'}), 401

        email = payload.get('email')
        user_id = payload.get('sub')
        role = payload.get('role')

        token_doc = refresh_tokens_col.find_one({'token': refresh_token_val})
        if not token_doc:
            refresh_tokens_col.delete_many({'email': email})
            return jsonify({'message': 'Token reuse detected. All sessions revoked.', 'code': 'TOKEN_REUSE'}), 401

        refresh_tokens_col.delete_one({'token': refresh_token_val})

        new_access_token = generate_access_token(user_id, email, role)
        new_refresh_token = generate_refresh_token(user_id, email, role)

        refresh_tokens_col.insert_one({
            'token': new_refresh_token,
            'user_id': user_id,
            'email': email,
            'role': role,
            'created_at': datetime.datetime.utcnow()
        })

        response = make_response(jsonify({'accessToken': new_access_token}), 200)
        response.set_cookie(
            'refreshToken', 
            new_refresh_token, 
            httponly=True, 
            secure=True, 
            samesite='None',
            max_age=7*24*60*60
        )
        return response

    except Exception as e:
        logger.error(f"Error in refresh_token: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def logout():
    try:
        refresh_token_val = request.cookies.get('refreshToken') or (request.json or {}).get('refreshToken')
        
        if refresh_token_val:
            refresh_tokens_col.delete_one({'token': refresh_token_val})

        response = make_response(jsonify({'message': 'Logout successful'}), 200)
        response.delete_cookie('refreshToken')
        return response
    except Exception as e:
        logger.error(f"Error in logout: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def forgot_password():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()

        if not email:
            return jsonify({'message': 'Email is required'}), 400

        user = users_col.find_one({'email': email})
        if not user:
            from app.db import barbers_col
            user = barbers_col.find_one({'email': email})
            
        if not user:
            return jsonify({'message': 'If the email exists, an OTP has been sent.'}), 200

        otp = generate_otp()
        otps_col.delete_many({'email': email, 'type': 'reset'})
        otps_col.insert_one({
            'email': email,
            'otp': otp,
            'type': 'reset',
            'created_at': datetime.datetime.utcnow()
        })

        send_reset_otp(email, otp)
        return jsonify({'message': 'Reset OTP sent to your email.'}), 200

    except Exception as e:
        logger.error(f"Error in forgot_password: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def reset_password():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        otp = data.get('otp', '').strip()
        new_password = data.get('newPassword', '')

        if not email or not otp or not new_password:
            return jsonify({'message': 'Email, OTP, and new password are required'}), 400

        val_pwd, msg_pwd = validate_password(new_password)
        if not val_pwd:
            return jsonify({'message': msg_pwd}), 400

        record = otps_col.find_one({'email': email, 'otp': otp, 'type': 'reset'})
        if not record:
            return jsonify({'message': 'Invalid or expired reset code'}), 400

        now = datetime.datetime.utcnow()
        if (now - record['created_at']).total_seconds() > 600:
            otps_col.delete_one({'_id': record['_id']})
            return jsonify({'message': 'OTP has expired'}), 400

        hashed_pass = hash_password(new_password)

        result = users_col.update_one({'email': email}, {'$set': {'password': hashed_pass}})
        if result.matched_count == 0:
            from app.db import barbers_col
            barbers_col.update_one({'email': email}, {'$set': {'password': hashed_pass}})

        otps_col.delete_one({'_id': record['_id']})
        return jsonify({'message': 'Password has been reset successfully.'}), 200

    except Exception as e:
        logger.error(f"Error in reset_password: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
