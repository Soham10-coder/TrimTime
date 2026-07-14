from pymongo import MongoClient
import logging
from config import Config

logger = logging.getLogger(__name__)

# Initialize MongoClient
try:
    client = MongoClient(Config.MONGO_URI)
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

def init_indexes():
    """
    Creates necessary unique constraints and search indexes in MongoDB.
    """
    try:
        # User collections
        users_col.create_index('email', unique=True)
        
        # Barber collections
        barbers_col.create_index('email', unique=True)
        barbers_col.create_index('city')
        barbers_col.create_index('shop_name')
        
        # Hairstyles collection
        hairstyles_col.create_index([('barber_id', 1), ('name', 1)])
        
        # Bookings collections
        bookings_col.create_index('booking_id', unique=True)
        bookings_col.create_index([('barber_id', 1), ('date', 1)])
        bookings_col.create_index('customer_id')
        
        # Coupons unique code
        coupons_col.create_index('code', unique=True)
        
        # OTP and tokens
        otps_col.create_index('email')
        refresh_tokens_col.create_index('token', unique=True)
        
        logger.info("MongoDB indexes created successfully.")
    except Exception as e:
        logger.error(f"Index creation failed: {e}")
