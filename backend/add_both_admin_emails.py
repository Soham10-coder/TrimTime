from app import create_app
from app.db import users_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

admin_accounts = [
    {'email': 'sohambagade10@gmail.com', 'passwords': ['Kolhapur@2304', 'Soham@2304']},
    {'email': 'sohambagade1001@gmail.com', 'passwords': ['Kolhapur@2304', 'Soham@2304']}
]

for item in admin_accounts:
    e = item['email']
    # Ensure sohambagade10@gmail.com and sohambagade1001@gmail.com exist as Super Admin
    users_col.delete_many({'email': e})
    users_col.insert_one({
        'name': 'Super Admin',
        'email': e,
        'phone': '9999999999' if e == 'sohambagade10@gmail.com' else '9999999998',
        'password': hash_password('Kolhapur@2304'),
        'role': 'admin',
        'verified': True,
        'gender': 'Male',
        'created_at': now
    })
    print(f"Registered Admin: {e} with password 'Kolhapur@2304'")

print("Both Admin emails (sohambagade10@gmail.com & sohambagade1001@gmail.com) are now active Super Admins!")
