import bcrypt
import random
import datetime
import logging
from flask import request, jsonify, make_response
from bson import ObjectId
from app.db import users_col, otps_col, refresh_tokens_col
from app.middlewares.auth import generate_access_token, generate_refresh_token, decode_token
from app.utils.email_utils import send_verification_otp, send_reset_otp
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
        role = data.get('role', 'customer') # Can be 'admin' if specified in setup

        if not email or not password or not name:
            return jsonify({'message': 'Name, email and password are required'}), 400

        # Validate role
        if role not in ['customer', 'admin']:
            role = 'customer'

        # Check existing user
        if users_col.find_one({'email': email}):
            return jsonify({'message': 'Email is already registered'}), 409

        hashed_pass = hash_password(password)
        user_doc = {
            'name': name,
            'email': email,
            'phone': phone,
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
        otps_col.delete_many({'email': email}) # Clear previous OTPs
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
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        logger.debug(f"Login request payload: email={email}, password={password}")

        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        # Check in users collection
        user = users_col.find_one({'email': email})
        role = None
        
        if user:
            role = user.get('role', 'customer')
        else:
            # Check in barbers collection
            from app.db import barbers_col
            user = barbers_col.find_one({'email': email})
            if user:
                role = 'barber'

        pwd_match = check_password(password, user['password']) if user else False
        logger.debug(f"Password match result: {pwd_match}")
        if not user or not pwd_match:
            return jsonify({'message': 'Invalid email or password'}), 401

        # Check if verified (barbers check for active, customers check for verified)
        if role == 'customer' and not user.get('verified', False):
            # Send verification OTP again
            otp = generate_otp()
            otps_col.delete_many({'email': email})
            otps_col.insert_one({
                'email': email,
                'otp': otp,
                'type': 'signup',
                'created_at': datetime.datetime.utcnow()
            })
            send_verification_otp(email, user.get('name', 'Customer'), otp)
            return jsonify({
                'message': 'Account not verified. OTP sent to your email.',
                'code': 'UNVERIFIED',
                'email': email
            }), 403

        if role == 'barber':
            # Barbers must be verified by admin
            if not user.get('verified', False):
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
        access_token = generate_access_token(user_id, email, role)
        refresh_token = generate_refresh_token(user_id, email, role)

        # Save refresh token in DB
        refresh_tokens_col.insert_one({
            'token': refresh_token,
            'user_id': user_id,
            'email': email,
            'role': role,
            'created_at': datetime.datetime.utcnow()
        })

        # Return Access Token in body and Refresh Token in HTTP-only Cookie
        response = make_response(jsonify({
            'accessToken': access_token,
            'user': {
                'id': user_id,
                'name': user.get('name') if role != 'barber' else user.get('owner_name'),
                'email': email,
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
            secure=True, # Set to True for Production HTTPS
            samesite='None', # Required for cross-origin local testing
            max_age=7*24*60*60
        )
        return response

    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def refresh_token():
    try:
        # Get refresh token from cookie or body
        refresh_token_val = request.cookies.get('refreshToken') or (request.json or {}).get('refreshToken')

        if not refresh_token_val:
            return jsonify({'message': 'Refresh token is missing'}), 401

        # Decode Refresh Token
        payload = decode_token(refresh_token_val, Config.JWT_REFRESH_SECRET_KEY)
        if payload == "EXPIRED" or not payload:
            # Delete token if exists
            refresh_tokens_col.delete_one({'token': refresh_token_val})
            return jsonify({'message': 'Refresh token expired or invalid', 'code': 'REFRESH_TOKEN_EXPIRED'}), 401

        email = payload.get('email')
        user_id = payload.get('sub')
        role = payload.get('role')

        # Rotation & Replay Attack Protection: Check if this token exists in the database
        token_doc = refresh_tokens_col.find_one({'token': refresh_token_val})
        if not token_doc:
            # Token is valid but not in DB! This implies it has been REUSED or stolen!
            # Revoke all tokens for this user for security
            refresh_tokens_col.delete_many({'email': email})
            return jsonify({'message': 'Token reuse detected. All sessions revoked.', 'code': 'TOKEN_REUSE'}), 401

        # Invalidate old refresh token
        refresh_tokens_col.delete_one({'token': refresh_token_val})

        # Generate new tokens
        new_access_token = generate_access_token(user_id, email, role)
        new_refresh_token = generate_refresh_token(user_id, email, role)

        # Save new refresh token in DB
        refresh_tokens_col.insert_one({
            'token': new_refresh_token,
            'user_id': user_id,
            'email': email,
            'role': role,
            'created_at': datetime.datetime.utcnow()
        })

        # Return responses
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
            # Delete token from DB
            refresh_tokens_col.delete_one({'token': refresh_token_val})

        response = make_response(jsonify({'message': 'Logout successful'}), 200)
        # Clear cookie
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

        # Check in both customer/admin and barber collection
        user = users_col.find_one({'email': email})
        if not user:
            from app.db import barbers_col
            user = barbers_col.find_one({'email': email})
            
        if not user:
            # For security, do not leak user existence. Return 200.
            return jsonify({'message': 'If the email exists, an OTP has been sent.'}), 200

        # Generate Reset OTP
        otp = generate_otp()
        otps_col.delete_many({'email': email, 'type': 'reset'})
        otps_col.insert_one({
            'email': email,
            'otp': otp,
            'type': 'reset',
            'created_at': datetime.datetime.utcnow()
        })

        # Send Reset Email
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

        # Verify Reset OTP
        record = otps_col.find_one({'email': email, 'otp': otp, 'type': 'reset'})
        if not record:
            return jsonify({'message': 'Invalid or expired reset code'}), 400

        # Check expiry (10 mins)
        now = datetime.datetime.utcnow()
        if (now - record['created_at']).total_seconds() > 600:
            otps_col.delete_one({'_id': record['_id']})
            return jsonify({'message': 'OTP has expired'}), 400

        # Hash new password
        hashed_pass = hash_password(new_password)

        # Update in users or barbers
        result = users_col.update_one({'email': email}, {'$set': {'password': hashed_pass}})
        if result.matched_count == 0:
            from app.db import barbers_col
            barbers_col.update_one({'email': email}, {'$set': {'password': hashed_pass}})

        # Clean OTP
        otps_col.delete_one({'_id': record['_id']})

        return jsonify({'message': 'Password has been reset successfully.'}), 200

    except Exception as e:
        logger.error(f"Error in reset_password: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
