import os
from dotenv import load_dotenv

# Load .env file from root directory or current directory
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'trimtime-flask-secret-key-129837')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'trimtime-jwt-access-secret-492019')
    JWT_REFRESH_SECRET_KEY = os.getenv('JWT_REFRESH_SECRET_KEY', 'trimtime-jwt-refresh-secret-901234')
    
    # MongoDB settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    # Use distinct database for TrimTime
    DB_NAME = 'trimtime'
    
    # SMTP Settings (using standard Gmail or Brevo defaults)
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', '465'))
    MAIL_USERNAME = os.getenv('GMAIL_USER') or os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('GMAIL_PASS') or os.getenv('MAIL_PASSWORD')
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'False').lower() in ('true', '1')
    MAIL_USE_SSL = os.getenv('MAIL_USE_SSL', 'True').lower() in ('true', '1')
    
    # Cloudinary Config
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')
    
    # Razorpay Config
    RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_mockkeyid123')
    RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'mockkeysecret12345678')
    RAZORPAY_WEBHOOK_SECRET = os.getenv('RAZORPAY_WEBHOOK_SECRET', 'mockwebhooksecret123')

    @classmethod
    def is_cloudinary_configured(cls):
        return all([cls.CLOUDINARY_CLOUD_NAME, cls.CLOUDINARY_API_KEY, cls.CLOUDINARY_API_SECRET])

    @classmethod
    def is_razorpay_configured(cls):
        # rzp_test is usually the prefix for test mode, we check if it is mock
        return cls.RAZORPAY_KEY_ID != 'rzp_test_mockkeyid123'
