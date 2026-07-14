from flask import Blueprint, request, jsonify
from app.controllers.auth_controller import (
    register_customer, verify_otp, resend_otp, login, 
    refresh_token, logout, forgot_password, reset_password
)

auth_bp = Blueprint('auth_bp', __name__)

auth_bp.route('/register', methods=['POST'])(register_customer)
auth_bp.route('/verify-otp', methods=['POST'])(verify_otp)
auth_bp.route('/resend-otp', methods=['POST'])(resend_otp)
auth_bp.route('/login', methods=['POST'])(login)
auth_bp.route('/refresh', methods=['POST'])(refresh_token)
auth_bp.route('/logout', methods=['POST'])(logout)
auth_bp.route('/forgot-password', methods=['POST'])(forgot_password)
auth_bp.route('/reset-password', methods=['POST'])(reset_password)

@auth_bp.route('/debug/echo', methods=['POST'])
def echo():
    return jsonify(request.json), 200
