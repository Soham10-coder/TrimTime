from flask import Blueprint
from app.controllers.barber_controller import (
    register_barber, resubmit_salon_documents, get_barbers, get_barber_profile, update_barber_profile,
    add_hairstyle, get_barber_hairstyles, update_hairstyle, delete_hairstyle,
    rate_barber
)
from app.middlewares.auth import token_required, require_role, auth_required

barber_bp = Blueprint('barber_bp', __name__)

# Public routes
barber_bp.route('/register', methods=['POST'])(register_barber)
barber_bp.route('/browse', methods=['GET'])(get_barbers)
barber_bp.route('/profile/<barber_id>', methods=['GET'])(get_barber_profile)
barber_bp.route('/hairstyles/<barber_id>', methods=['GET'])(get_barber_hairstyles)

# Secured routes (Barber only)
barber_bp.route('/resubmit-documents', methods=['POST'])(
    token_required(require_role('barber')(resubmit_salon_documents))
)
barber_bp.route('/profile', methods=['PUT'])(
    token_required(require_role('barber')(update_barber_profile))
)
barber_bp.route('/hairstyles', methods=['POST'])(
    token_required(require_role('barber')(add_hairstyle))
)
barber_bp.route('/hairstyles/<hairstyle_id>', methods=['PUT'])(
    token_required(require_role('barber')(update_hairstyle))
)
barber_bp.route('/hairstyles/<hairstyle_id>', methods=['DELETE'])(
    token_required(require_role('barber')(delete_hairstyle))
)

# Secured routes (Customer only)
barber_bp.route('/rate', methods=['POST'])(
    token_required(require_role('customer')(rate_barber))
)
