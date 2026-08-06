from pymongo import MongoClient
import bcrypt
import datetime
import logging
from config import Config

logger = logging.getLogger(__name__)

# Initialize MongoClient
try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000, tlsAllowInvalidCertificates=True)
    db = client[Config.DB_NAME]
    logger.info(f"Connected to MongoDB database: {Config.DB_NAME}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise e

# Export collections
users_col = db['users']
barbers_col = db['barbers']
hairstyles_col = db['hairstyles']
bookings_col = db['bookings']
payments_col = db['payments']
reviews_col = db['reviews']
coupons_col = db['coupons']
otps_col = db['otps']
refresh_tokens_col = db['refresh_tokens']
master_services_col = db['master_services']

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def init_indexes():
    """
    Creates necessary unique constraints and search indexes in MongoDB.
    """
    try:
        users_col.create_index('email', unique=True)
        barbers_col.create_index('email', unique=True)
        barbers_col.create_index('city')
        barbers_col.create_index('shop_name')
        hairstyles_col.create_index([('barber_id', 1), ('name', 1)])
        bookings_col.create_index('booking_id', unique=True)
        bookings_col.create_index([('barber_id', 1), ('date', 1)])
        bookings_col.create_index('customer_id')
        coupons_col.create_index('code', unique=True)
        otps_col.create_index('email')
        refresh_tokens_col.create_index('token', unique=True)
        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.error(f"Index creation failed: {e}")

def seed_default_data():
    """
    Automatically seeds default Super Admin, Demo Barber Salon, and Demo Customer accounts on startup if database is fresh.
    """
    try:
        now = datetime.datetime.utcnow()

        # 1. Seed Super Admin
        admin_email = "sohambagade10@gmail.com"
        barbers_col.delete_many({'email': admin_email}) # Ensure admin email is not locked in barbers collection
        if not users_col.find_one({'email': admin_email}):
            users_col.insert_one({
                'name': 'Super Admin',
                'email': admin_email,
                'phone': '9999999999',
                'password': hash_password('Kolhapur@2304'),
                'role': 'admin',
                'verified': True,
                'gender': 'Male',
                'created_at': now
            })
            logger.info("Super Admin account seeded successfully.")
        else:
            users_col.update_one({'email': admin_email}, {'$set': {'role': 'admin', 'verified': True}})

        logger.info("Super Admin account seeded/verified successfully.")

    except Exception as e:
        logger.error(f"Error in seed_default_data: {e}")
