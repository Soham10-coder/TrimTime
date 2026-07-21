import os
from dotenv import load_dotenv

# Load .env file from root directory or current directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv()

def get_env_clean(key, default=''):
    # Try exact key, trimmed key, or key without spaces
    val = os.getenv(key)
    if val is None:
        for k, v in os.environ.items():
            if k.strip() == key:
                val = v
                break
    if val is not None:
        return str(val).strip().strip('"').strip("'")
    return default

class Config:
    SECRET_KEY = get_env_clean('SECRET_KEY', 'trimtime-flask-secret-key-129837')
    JWT_SECRET_KEY = get_env_clean('JWT_SECRET_KEY', 'trimtime-jwt-access-secret-492019')
    JWT_REFRESH_SECRET_KEY = get_env_clean('JWT_REFRESH_SECRET_KEY', 'trimtime-jwt-refresh-secret-901234')
    
    # MongoDB settings
    MONGO_URI = get_env_clean('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = 'trimtime'
    
    # SMTP Settings
    MAIL_SERVER = get_env_clean('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(get_env_clean('MAIL_PORT', '587'))
    
    # Support GMAIL_USER, MAIL_USERNAME, SMTP_USER, SENDER_EMAIL
    MAIL_USERNAME = (
        get_env_clean('GMAIL_USER') or 
        get_env_clean('MAIL_USERNAME') or 
        get_env_clean('SMTP_USER') or 
        get_env_clean('SENDER_EMAIL') or
        'sohambagade10@gmail.com'
    )
    
    # Support GMAIL_PASS, MAIL_PASSWORD, SMTP_PASS, SMTP_SECRET_KEY, SECRET_ACCESS_KEY
    MAIL_PASSWORD = (
        get_env_clean('GMAIL_PASS') or 
        get_env_clean('MAIL_PASSWORD') or 
        get_env_clean('SMTP_PASS') or 
        get_env_clean('SMTP_SECRET_KEY') or
        get_env_clean('SECRET_ACCESS_KEY')
    )
    
    MAIL_USE_TLS = get_env_clean('MAIL_USE_TLS', 'True').lower() in ('true', '1')
    MAIL_USE_SSL = get_env_clean('MAIL_USE_SSL', 'False').lower() in ('true', '1')
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME = get_env_clean('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = get_env_clean('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = get_env_clean('CLOUDINARY_API_SECRET')
    
    # Razorpay Config
    RAZORPAY_KEY_ID = get_env_clean('RAZORPAY_KEY_ID', 'rzp_test_mockkeyid123')
    RAZORPAY_KEY_SECRET = get_env_clean('RAZORPAY_KEY_SECRET', 'mockkeysecret12345678')
    RAZORPAY_WEBHOOK_SECRET = get_env_clean('RAZORPAY_WEBHOOK_SECRET', 'mockwebhooksecret123')

    @classmethod
    def is_cloudinary_configured(cls):
        return all([cls.CLOUDINARY_CLOUD_NAME, cls.CLOUDINARY_API_KEY, cls.CLOUDINARY_API_SECRET])

    @classmethod
    def is_razorpay_configured(cls):
        return cls.RAZORPAY_KEY_ID != 'rzp_test_mockkeyid123'
