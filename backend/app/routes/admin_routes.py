from flask import Blueprint
from app.controllers.admin_controller import (
    get_pending_barbers, approve_barber, toggle_barber_status,
    get_admin_analytics, create_coupon, get_coupons, toggle_coupon_status,
    get_all_users, get_all_barbers, remove_barber, remove_user, send_reminders
)
from app.middlewares.auth import token_required, require_role

admin_bp = Blueprint('admin_bp', __name__)

# Apply Admin role guards globally to all administrative operations
admin_bp.route('/pending-barbers', methods=['GET'])(
    token_required(require_role('admin')(get_pending_barbers))
)
admin_bp.route('/approve-barber/<barber_id>', methods=['POST'])(
    token_required(require_role('admin')(approve_barber))
)
admin_bp.route('/toggle-barber/<barber_id>', methods=['POST'])(
    token_required(require_role('admin')(toggle_barber_status))
)
admin_bp.route('/remove-barber/<barber_id>', methods=['DELETE'])(
    token_required(require_role('admin')(remove_barber))
)
admin_bp.route('/remove-user/<user_id>', methods=['DELETE'])(
    token_required(require_role('admin')(remove_user))
)
admin_bp.route('/send-reminders', methods=['POST'])(
    token_required(require_role('admin')(send_reminders))
)
admin_bp.route('/analytics', methods=['GET'])(
    token_required(require_role('admin')(get_admin_analytics))
)
admin_bp.route('/coupons', methods=['POST'])(
    token_required(require_role('admin')(create_coupon))
)
admin_bp.route('/coupons', methods=['GET'])(
    token_required(require_role('admin')(get_coupons))
)
admin_bp.route('/coupons/<coupon_id>', methods=['PUT'])(
    token_required(require_role('admin')(toggle_coupon_status))
)
admin_bp.route('/users', methods=['GET'])(
    token_required(require_role('admin')(get_all_users))
)
admin_bp.route('/barbers', methods=['GET'])(
    token_required(require_role('admin')(get_all_barbers))
)
