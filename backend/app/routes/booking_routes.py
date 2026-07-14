from flask import Blueprint
from app.controllers.booking_controller import (
    get_available_slots, create_booking, get_customer_bookings, 
    get_barber_bookings, cancel_booking
)
from app.controllers.payment_controller import (
    verify_and_confirm_payment, razorpay_webhook
)
from app.middlewares.auth import token_required, require_role

booking_bp = Blueprint('booking_bp', __name__)

# Public routes
booking_bp.route('/slots', methods=['GET'])(get_available_slots)
booking_bp.route('/webhook', methods=['POST'])(razorpay_webhook)

# Secured routes (Customers)
booking_bp.route('/create', methods=['POST'])(
    token_required(require_role('customer')(create_booking))
)
booking_bp.route('/customer', methods=['GET'])(
    token_required(require_role('customer')(get_customer_bookings))
)

# Secured routes (Barbers)
booking_bp.route('/barber', methods=['GET'])(
    token_required(require_role('barber')(get_barber_bookings))
)

# Secured routes (Both Customers and Barbers)
booking_bp.route('/cancel', methods=['POST'])(
    token_required(require_role(['customer', 'barber'])(cancel_booking))
)

# Payment confirmation (Secure: Customer)
booking_bp.route('/verify-payment', methods=['POST'])(
    token_required(require_role('customer')(verify_and_confirm_payment))
)
