from app import create_app
from app.db import users_col, barbers_col, hairstyles_col, bookings_col, master_services_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

print("Cleaning findmysalon database: Removing all users, leaving ONLY Super Admin...")

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

print("Verification Summary:")
print(f"- Super Admin Email: {admin_email} (Password: 'Kolhapur@2304')")
print(f"- Total Users Count: {users_col.count_documents({})}")
print(f"- Total Barbers Count: {barbers_col.count_documents({})}")
print(f"- Total Master Services Count: {master_services_col.count_documents({})}")
print("Database 'findmysalon' is 100% clean and ready!")
