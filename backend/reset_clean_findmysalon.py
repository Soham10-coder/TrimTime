from app import create_app
from app.db import users_col, barbers_col, hairstyles_col, bookings_col, master_services_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

print("Cleaning findmysalon database for fresh testing...")

# 1. Clear barbers, hairstyles, bookings, and users
barbers_col.delete_many({})
hairstyles_col.delete_many({})
bookings_col.delete_many({})
users_col.delete_many({})

# 2. Add ONLY Super Admin account
admin_email = "sohambagade10@gmail.com"
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

print(f"Super Admin '{admin_email}' created successfully with password 'Kolhapur@2304'!")
print(f"Current Barbers Count: {barbers_col.count_documents({})}")
print(f"Current Users Count: {users_col.count_documents({})}")
print("Database 'findmysalon' is now 100% clean and ready for your live site testing!")
