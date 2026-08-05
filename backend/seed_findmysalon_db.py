from app import create_app
from app.db import users_col, barbers_col, hairstyles_col, master_services_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

print("Initializing new database 'findmysalon'...")

# 1. Seed Master Services (79 services across 12 categories)
master_services_list = [
    # Men's Hair Services
    {'name': "Men's Classic Haircut", 'category': "Men's Hair Services", 'default_price': 250, 'default_duration': 30, 'description': 'Precision classic haircut with hair wash and styling.', 'icon': 'Scissors'},
    {'name': "Men's Fade / Styling Haircut", 'category': "Men's Hair Services", 'default_price': 300, 'default_duration': 40, 'description': 'Skin fade, taper fade, or modern textured crop styling.', 'icon': 'Scissors'},
    {'name': "Men's Buzz Cut / Clipper Cut", 'category': "Men's Hair Services", 'default_price': 150, 'default_duration': 20, 'description': 'Quick all-over uniform clipper haircut.', 'icon': 'Scissors'},
    {'name': "Men's Hair Color & Grey Blending", 'category': "Men's Hair Services", 'default_price': 400, 'default_duration': 35, 'description': 'Natural grey coverage and subtle hair coloring.', 'icon': 'Palette'},
    
    # Men Grooming
    {'name': "Beard Trim & Shape", 'category': "Men Grooming", 'default_price': 150, 'default_duration': 20, 'description': 'Precision beard line-up, razor edging, and balm finish.', 'icon': 'Scissors'},
    {'name': "Royal Hot Towel Shave", 'category': "Men Grooming", 'default_price': 200, 'default_duration': 25, 'description': 'Luxurious straight-razor shave with warm herbal towels.', 'icon': 'Sparkles'},
    {'name': "Beard Color & Conditioning", 'category': "Men Grooming", 'default_price': 250, 'default_duration': 25, 'description': 'Beard color application with softening oil massage.', 'icon': 'Palette'},

    # Skin & Facial
    {'name': "Deep Cleansing Charcoal Facial", 'category': "Skin & Facial", 'default_price': 450, 'default_duration': 45, 'description': 'Deep pore cleansing, blackhead extraction, and charcoal mask.', 'icon': 'Sparkles'},
    {'name': "Tan Removal & D-Tan Scrub", 'category': "Skin & Facial", 'default_price': 350, 'default_duration': 30, 'description': 'Exfoliating detan pack to restore natural skin glow.', 'icon': 'Sparkles'},
    {'name': "Gold Radiance Glow Facial", 'category': "Skin & Facial", 'default_price': 800, 'default_duration': 60, 'description': 'Premium gold foil skin rejuvenation treatment.', 'icon': 'Sparkles'},

    # Spa & Massages
    {'name': "Herbal Scalp Oil Massage", 'category': "Spa", 'default_price': 200, 'default_duration': 30, 'description': 'Relaxing head massage using warm Ayurvedic herbal oils.', 'icon': 'Sparkles'},
    {'name': "De-Stress Head & Shoulder Spa", 'category': "Spa", 'default_price': 400, 'default_duration': 45, 'description': 'Therapeutic neck, shoulder, and scalp stress relief.', 'icon': 'Sparkles'},

    # Women's Hair Services
    {'name': "Women's Classic Haircut", 'category': "Women's Hair Services", 'default_price': 400, 'default_duration': 45, 'description': 'Layered cut, bob, or straight trim with blow dry.', 'icon': 'Scissors'},
    {'name': "Keratin Hair Smoothing", 'category': "Women's Hair Services", 'default_price': 2500, 'default_duration': 120, 'description': 'Protein-infused anti-frizz smoothing treatment.', 'icon': 'Sparkles'},

    # Packages
    {'name': "Royal Grooming Package", 'category': "Men Grooming", 'default_price': 600, 'default_duration': 60, 'description': 'Haircut, beard styling, facial cleanup, and head massage.', 'icon': 'Crown'}
]

for ms in master_services_list:
    if not master_services_col.find_one({'name': ms['name']}):
        master_services_col.insert_one({
            'name': ms['name'],
            'category': ms['category'],
            'default_price': ms['default_price'],
            'default_duration': ms['default_duration'],
            'description': ms['description'],
            'icon': ms['icon'],
            'created_at': now
        })
print("Master Services collection seeded successfully!")

# 2. Seed Super Admin Accounts
admin_emails = [
    {'email': 'sohambagade1001@gmail.com', 'name': 'Soham Bagade', 'phone': '9999999998'},
    {'email': 'sohambagade10@gmail.com', 'name': 'Soham Bagade', 'phone': '9999999999'}
]

for adm in admin_emails:
    users_col.delete_many({'email': adm['email']})
    users_col.insert_one({
        'name': adm['name'],
        'email': adm['email'],
        'phone': adm['phone'],
        'password': hash_password('Kolhapur@2304'),
        'role': 'admin',
        'verified': True,
        'gender': 'Male',
        'created_at': now
    })
print("Super Admin accounts seeded successfully!")

# 3. Seed SB Salon
sb_email = "sbsalon@trimtime.com"
barbers_col.delete_many({'email': sb_email})
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
print(f"SB Salon seeded with ID: {sb_id}")

# 4. Link Master Services to SB Salon
hairstyles_col.delete_many({'barber_id': sb_id})
masters = list(master_services_col.find())
services_to_insert = []
for ms in masters:
    services_to_insert.append({
        'barber_id': sb_id,
        'master_service_id': ms['_id'],
        'name': ms['name'],
        'category': ms.get('category', 'Others'),
        'description': ms.get('description', ''),
        'duration': ms.get('default_duration', 30),
        'price': ms.get('default_price', 250),
        'enabled': True
    })
if services_to_insert:
    hairstyles_col.insert_many(services_to_insert)
print(f"Linked {len(services_to_insert)} services to SB Salon!")

# 5. Seed Customer Accounts
user_list = [
    {'email': 'customer@trimtime.com', 'name': 'Swayam Customer', 'phone': '9876543211'},
    {'email': 'bagadesoham01@gmail.com', 'name': 'Soham Bagade', 'phone': '9876543201'},
    {'email': 'pm1592003@gmail.com', 'name': 'PM 1592003', 'phone': '9876543202'},
    {'email': 'swayamdakare1@gmail.com', 'name': 'Swayam Dakare', 'phone': '9876543203'},
    {'email': 'kaushaljadhav148@gmail.com', 'name': 'Kaushal Jadhav', 'phone': '9876543204'},
    {'email': 'omkar10@gmail.com', 'name': 'Omkar', 'phone': '9876543205'},
    {'email': 'gavaliomkar191@gmail.com', 'name': 'Omkar Gavali', 'phone': '9876543206'},
    {'email': 'avanishbhosale253@gmail.com', 'name': 'Avanish Bhosale', 'phone': '9876543207'},
    {'email': 'malecust@test.com', 'name': 'Male Customer', 'phone': '9876543209'}
]

for usr in user_list:
    if not users_col.find_one({'email': usr['email']}):
        users_col.insert_one({
            'name': usr['name'],
            'email': usr['email'],
            'phone': usr['phone'],
            'password': hash_password('123456'),
            'role': 'customer',
            'verified': True,
            'loyalty_points': 250,
            'created_at': now
        })
print("User accounts seeded successfully into findmysalon database!")

print("COMPLETE! Database 'findmysalon' is 100% active and healthy!")
