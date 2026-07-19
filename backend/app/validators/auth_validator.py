import re
import html

ALLOWED_GENDERS = ["Male", "Female", "Prefer Not To Say"]
ALLOWED_SALON_TYPES = ["Men's Salon", "Women's Salon", "Unisex Salon"]
ALLOWED_IDENTITY_PROOFS = ["Aadhaar Card", "PAN Card", "Driving License", "Passport"]
ALLOWED_BUSINESS_PROOFS = ["Shop License", "GST Certificate", "Electricity Bill", "Rent Agreement"]

def validate_email(email):
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    email = email.strip()
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if not re.match(pattern, email):
        return False, "Invalid email format."
    return True, None

def validate_phone(phone):
    if not phone or not isinstance(phone, str):
        return False, "Phone number is required."
    phone = phone.strip()
    # Accept 10 digits or with country code
    clean_phone = re.sub(r"[^\d]", "", phone)
    if len(clean_phone) < 10 or len(clean_phone) > 12:
        return False, "Phone number must be 10 digits."
    return True, None

def validate_password(password):
    if not password or not isinstance(password, str):
        return False, "Password is required."
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit."
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."
    return True, None

def validate_gender(gender):
    if not gender or not isinstance(gender, str):
        return False, "Gender is required."
    gender = gender.strip()
    if gender not in ALLOWED_GENDERS:
        return False, f"Gender must be one of: {', '.join(ALLOWED_GENDERS)}"
    return True, None

def validate_salon_type(salon_type):
    if not salon_type or not isinstance(salon_type, str):
        return False, "Salon Type is required."
    # Unescape HTML entities e.g. Men&#x27;s Salon -> Men's Salon
    unescaped_type = html.unescape(salon_type.strip())
    if unescaped_type not in ALLOWED_SALON_TYPES:
        return False, f"Salon Type must be one of: {', '.join(ALLOWED_SALON_TYPES)}"
    return True, None

def validate_proof_types(identity_proof_type, business_proof_type):
    if identity_proof_type:
        identity_proof_type = html.unescape(identity_proof_type.strip())
        if identity_proof_type not in ALLOWED_IDENTITY_PROOFS:
            return False, f"Identity Proof Type must be one of: {', '.join(ALLOWED_IDENTITY_PROOFS)}"
    if business_proof_type:
        business_proof_type = html.unescape(business_proof_type.strip())
        if business_proof_type not in ALLOWED_BUSINESS_PROOFS:
            return False, f"Business Proof Type must be one of: {', '.join(ALLOWED_BUSINESS_PROOFS)}"
    return True, None
