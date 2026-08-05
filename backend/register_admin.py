from app import create_app
from app.db import users_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

emails = ['sohambagade10@gmail.com', 'sohambagade1001@gmail.com']

for e in emails:
    u = users_col.find_one({'email': e})
    if not u:
        users_col.insert_one({
            'name': 'Super Admin',
            'email': e,
            'phone': '9999999999',
            'password': hash_password('Kolhapur@2304'),
            'role': 'admin',
            'verified': True,
            'gender': 'Male',
            'created_at': now
        })
        print(f"Registered brand new Admin: {e}")
    else:
        users_col.update_one({'email': e}, {'$set': {'password': hash_password('Kolhapur@2304'), 'role': 'admin', 'verified': True}})
        print(f"Updated password for Admin: {e}")

print("Both Admin accounts are now 100% active with password 'Kolhapur@2304'!")
