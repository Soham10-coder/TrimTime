from app import create_app
from app.db import barbers_col, hairstyles_col, users_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

# Seed SB Salon
sb_email = "sbsalon@trimtime.com"
sb = barbers_col.find_one({'email': sb_email})

if not sb:
    res = barbers_col.insert_one({
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
    })
    sb_id = res.inserted_id
    print(f"Successfully seeded SB Salon with ID: {sb_id}")

    services = [
        {'barber_id': sb_id, 'name': 'Executive Haircut', 'description': 'Precision haircut with hair wash and styling.', 'duration': 30, 'price': 250, 'category': 'Haircut', 'enabled': True},
        {'barber_id': sb_id, 'name': 'Beard Trim and Shape', 'description': 'Beard grooming, edging, and hot towel finish.', 'duration': 20, 'price': 150, 'category': 'Beard', 'enabled': True},
        {'barber_id': sb_id, 'name': 'Head Massage and Spa', 'description': 'Relaxing herbal oil head massage and scalp care.', 'duration': 30, 'price': 200, 'category': 'Spa', 'enabled': True},
        {'barber_id': sb_id, 'name': 'Royal Grooming Package', 'description': 'Haircut, beard styling, facial cleanup, and head massage.', 'duration': 60, 'price': 500, 'category': 'Package', 'enabled': True}
    ]
    hairstyles_col.insert_many(services)
    print("Successfully seeded master hairstyles for SB Salon!")
else:
    print(f"SB Salon already exists with ID: {sb['_id']}")
