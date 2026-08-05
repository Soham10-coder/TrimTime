from pymongo import MongoClient
import bcrypt
import datetime
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

        # 2. Seed SB Salon if barbers collection is empty
        sb_email = "sbsalon@trimtime.com"
        if not barbers_col.find_one({'email': sb_email}):
            sb_doc = {
                'shop_name': 'SB Salon',
                'owner_name': 'Swayam Patil',
                'email': sb_email,
                'phone': '9876543210',
                'password': hash_password('123456'),
                'salon_type': "Men's Salon",
                'address': 'near CPR Kolhapur',
                'city': 'Kolhapur',
                'lat': 16.7050,
                'lng': 74.2433,
                'weekly_holiday': 1,
                'weekly_holidays': [1],
                'opening_time': '09:00 AM',
                'closing_time': '09:00 PM',
                'verification_status': 'APPROVED',
                'verified_badge': True,
                'rating_avg': 4.9,
                'rating_count': 12,
                'staff': [{
                    'id': '6a683d6c27cb2989c679c84f',
                    'name': 'Sunil kambale',
                    'role': 'Senior Barber Stylist',
                    'shift': '10:00 AM - 09:00 PM',
                    'phone': '',
                    'holiday': 'Wednesday',
                    'photoUrl': 'https://trimtimebucket.s3.us-east-2.amazonaws.com/uploads/staff_photos/4d7e2b7139ba46779f14cfdef9a82ab7_textured-fringe-straight-hair-men.webp',
                    'status': 'ACTIVE',
                    'experience': 4
                }],
                'created_at': now
            }
            res = barbers_col.insert_one(sb_doc)
            sb_id = res.inserted_id

            services = [
                {'barber_id': sb_id, 'name': 'Executive Haircut', 'description': 'Precision haircut with hair wash and styling.', 'duration': 30, 'price': 250, 'category': 'Haircut', 'enabled': True},
                {'barber_id': sb_id, 'name': 'Beard Trim and Shape', 'description': 'Beard grooming, edging, and hot towel finish.', 'duration': 20, 'price': 150, 'category': 'Beard', 'enabled': True},
                {'barber_id': sb_id, 'name': 'Head Massage and Spa', 'description': 'Relaxing herbal oil head massage and scalp care.', 'duration': 30, 'price': 200, 'category': 'Spa', 'enabled': True},
                {'barber_id': sb_id, 'name': 'Royal Grooming Package', 'description': 'Haircut, beard styling, facial cleanup, and head massage.', 'duration': 60, 'price': 500, 'category': 'Package', 'enabled': True}
            ]
            hairstyles_col.insert_many(services)
            logger.info("SB Salon and services seeded successfully.")

        # 3. Seed Demo Customer if not present
        cust_email = "customer@trimtime.com"
        if not users_col.find_one({'email': cust_email}):
            users_col.insert_one({
                'name': 'Swayam Customer',
                'email': cust_email,
                'phone': '9876543211',
                'password': hash_password('123456'),
                'role': 'customer',
                'verified': True,
                'loyalty_points': 250,
                'created_at': now
            })
            logger.info("Demo Customer account seeded successfully.")

        logger.info("Database auto-healing and account safeguard completed cleanly.")

    except Exception as e:
        logger.error(f"Error in seed_default_data: {e}")
