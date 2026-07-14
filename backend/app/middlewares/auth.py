import jwt
import datetime
from functools import wraps
from flask import request, jsonify, g
import logging
from config import Config
from app.db import users_col, barbers_col

logger = logging.getLogger(__name__)

def generate_access_token(user_id, email, role):
    """
    Generates a short-lived access token (expires in 15 minutes).
    """
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
            'iat': datetime.datetime.utcnow(),
            'sub': str(user_id),
            'email': email,
            'role': role
        }
        return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')
    except Exception as e:
        logger.error(f"Error generating access token: {e}")
        return None

def generate_refresh_token(user_id, email, role):
    """
    Generates a long-lived refresh token (expires in 7 days).
    """
    try:
        payload = {
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow(),
            'sub': str(user_id),
            'email': email,
            'role': role
        }
        return jwt.encode(payload, Config.JWT_REFRESH_SECRET_KEY, algorithm='HS256')
    except Exception as e:
        logger.error(f"Error generating refresh token: {e}")
        return None

def decode_token(token, secret):
    """
    Decodes a JWT token. Returns the payload or None if invalid/expired.
    """
    try:
        return jwt.decode(token, secret, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        logger.warning("Token signature has expired")
        return "EXPIRED"
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token signature: {e}")
        return None

def token_required(f):
    """
    Decorator to ensure access token is valid and set current_user on request context.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Express-style Authorization: Bearer <token>
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Access token is missing'}), 401

        payload = decode_token(token, Config.JWT_SECRET_KEY)
        if payload == "EXPIRED":
            return jsonify({'message': 'Access token expired', 'code': 'TOKEN_EXPIRED'}), 401
        
        if not payload:
            return jsonify({'message': 'Access token is invalid'}), 401

        user_id = payload.get('sub')
        email = payload.get('email')
        role = payload.get('role')

        # Load user from correct collection based on role
        user = None
        if role == 'barber':
            user = barbers_col.find_one({'email': email})
        else:
            user = users_col.find_one({'email': email})

        if not user:
            return jsonify({'message': 'User not found in current session'}), 401

        if role == 'barber' and not user.get('verified', False):
            # Barbers must be verified by admin, except during dashboard profiles check if admin is verifying
            pass

        # Set user context in Flask global variables
        g.current_user = user
        g.current_user_id = user_id
        g.current_user_email = email
        g.current_user_role = role

        return f(*args, **kwargs)
    return decorated

def require_role(roles):
    """
    Decorator to restrict access to specific roles.
    roles can be a string (e.g. 'admin') or a list (e.g. ['admin', 'barber'])
    """
    if isinstance(roles, str):
        roles = [roles]
        
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'current_user_role'):
                return jsonify({'message': 'Unauthorized'}), 401
                
            if g.current_user_role not in roles:
                return jsonify({'message': 'Forbidden: Insufficient privileges'}), 403
                
            return f(*args, **kwargs)
        return decorated
    return decorator
