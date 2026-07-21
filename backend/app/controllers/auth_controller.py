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
        if not hashed:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), str(hashed).encode('utf-8'))
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

        if role not in ['customer', 'admin']:
            role = 'customer'

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

        # Send Email Verification via SMTP
        email_sent = send_verification_otp(email, name, otp)

        res_body = {
            'message': 'Registration successful. Please verify your email with the 6-digit OTP.',
            'email': email,
            'emailSent': email_sent
        }
        if not email_sent:
            res_body['devOtp'] = otp

        return jsonify(res_body), 201

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

        record = otps_col.find_one({'email': email, 'type': otp_type})
        if not record:
            return jsonify({'message': 'No OTP request found for this email'}), 404

        now = datetime.datetime.utcnow()
        if (now - record['created_at']).total_seconds() > 600:
            otps_col.delete_one({'_id': record['_id']})
            return jsonify({'message': 'OTP has expired. Please request a new one.'}), 400

        if record['otp'] != otp:
            return jsonify({'message': 'Invalid OTP code'}), 400

        otps_col.delete_one({'_id': record['_id']})

        if otp_type == 'signup':
            users_col.update_one({'email': email}, {'$set': {'verified': True}})
            return jsonify({'message': 'Email verified successfully. You can now log in.'}), 200
        elif otp_type == 'reset':
            return jsonify({'message': 'OTP verified successfully. Proceed to reset password.'}), 200

        return jsonify({'message': 'OTP verified'}), 200

    except Exception as e:
        logger.error(f"Error in verify_otp: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def resend_otp():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        otp_type = data.get('type', 'signup')

        if not email:
            return jsonify({'message': 'Email is required'}), 400

        user = users_col.find_one({'email': email})
        if not user and otp_type == 'signup':
            return jsonify({'message': 'User not found'}), 404

        otp = generate_otp()
        otps_col.delete_many({'email': email, 'type': otp_type})
        otps_col.insert_one({
            'email': email,
            'otp': otp,
            'type': otp_type,
            'created_at': datetime.datetime.utcnow()
        })

        name = user.get('name', 'User') if user else 'User'
        if otp_type == 'signup':
            email_sent = send_verification_otp(email, name, otp)
        else:
            email_sent = send_reset_otp(email, otp)

        res_body = {
            'message': 'A new OTP has been sent to your email.',
            'emailSent': email_sent
        }
        if not email_sent:
            res_body['devOtp'] = otp

        return jsonify(res_body), 200

    except Exception as e:
        logger.error(f"Error in resend_otp: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def login():
    try:
        data = request.json or {}
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        user = users_col.find_one({'email': email})
        is_barber = False
        if not user:
            from app.db import barbers_col
            user = barbers_col.find_one({'email': email})
            if user:
                is_barber = True
            else:
                return jsonify({'message': 'Invalid email or password'}), 401

        if not check_password(password, user.get('password')):
            return jsonify({'message': 'Invalid email or password'}), 401

        user_id = str(user['_id'])
        user_role = 'barber' if is_barber else user.get('role', 'customer')

        # Correct parameter order: (user_id, email, role)
        access_token = generate_access_token(user_id, user.get('email'), user_role)
        refresh_token_val = generate_refresh_token(user_id, user.get('email'), user_role)

        refresh_tokens_col.insert_one({
            'token': refresh_token_val,
            'user_id': user_id,
            'created_at': datetime.datetime.utcnow()
        })

        user_payload = {
            'id': user_id,
            'name': user.get('name') if not is_barber else user.get('owner_name'),
            'email': user.get('email'),
            'role': user_role,
            'verified': user.get('verified', False),
            'loyaltyPoints': user.get('loyalty_points', 0) if not is_barber else 0
        }
        if is_barber:
            user_payload['shopName'] = user.get('shop_name')
            user_payload['profilePic'] = user.get('profile_pic', '')

        resp = make_response(jsonify({
            'message': 'Login successful',
            'accessToken': access_token,
            'user': user_payload
        }), 200)

        resp.set_cookie(
            'refreshToken',
            refresh_token_val,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=7 * 24 * 3600
        )

        return resp

    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def refresh_token():
    try:
        ref_token = request.cookies.get('refreshToken') or request.headers.get('X-Refresh-Token')
        if not ref_token:
            return jsonify({'message': 'Refresh token missing'}), 401

        token_doc = refresh_tokens_col.find_one({'token': ref_token})
        if not token_doc:
            return jsonify({'message': 'Invalid refresh token'}), 401

        payload, err = decode_token(ref_token, is_refresh=True)
        if err:
            refresh_tokens_col.delete_one({'token': ref_token})
            return jsonify({'message': f'Refresh token invalid: {err}'}), 401

        user_id = payload.get('sub')
        role = payload.get('role')
        
        user = users_col.find_one({'_id': ObjectId(user_id)})
        if not user:
            from app.db import barbers_col
            user = barbers_col.find_one({'_id': ObjectId(user_id)})

        if not user:
            return jsonify({'message': 'User not found'}), 401

        new_access_token = generate_access_token(user_id, user.get('email'), role)

        return jsonify({
            'accessToken': new_access_token
        }), 200

    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def logout():
    try:
        refresh_token_val = request.cookies.get('refreshToken')
        if refresh_token_val:
            refresh_tokens_col.delete_one({'token': refresh_token_val})

        resp = make_response(jsonify({'message': 'Logout successful'}), 200)
        resp.set_cookie('refreshToken', '', expires=0)
        return resp
    except Exception as e:
        logger.error(f"Error during logout: {e}")
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
            return jsonify({'message': 'No user account found with this email address.'}), 404

        otp = generate_otp()
        otps_col.delete_many({'email': email, 'type': 'reset'})
        otps_col.insert_one({
            'email': email,
            'otp': otp,
            'type': 'reset',
            'created_at': datetime.datetime.utcnow()
        })

        email_sent = send_reset_otp(email, otp)
        res_body = {
            'message': 'Password reset verification code sent to your email.',
            'emailSent': email_sent
        }
        if not email_sent:
            res_body['devOtp'] = otp

        return jsonify(res_body), 200

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
            return jsonify({'message': 'Invalid or expired OTP code'}), 400

        now = datetime.datetime.utcnow()
        if (now - record['created_at']).total_seconds() > 600:
            otps_col.delete_one({'_id': record['_id']})
            return jsonify({'message': 'OTP has expired. Please request a new one.'}), 400

        hashed_pass = hash_password(new_password)
        
        result = users_col.update_one({'email': email}, {'$set': {'password': hashed_pass}})
        if result.matched_count == 0:
            from app.db import barbers_col
            barbers_col.update_one({'email': email}, {'$set': {'password': hashed_pass}})

        otps_col.delete_one({'_id': record['_id']})

        return jsonify({'message': 'Password reset successful. You can now log in.'}), 200

    except Exception as e:
        logger.error(f"Error in reset_password: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
