from app import create_app
from app.db import users_col, hash_password
import datetime

app = create_app()
now = datetime.datetime.utcnow()

all_emails = [
    {'email': 'sohambagade10@gmail.com', 'name': 'Soham Bagade', 'role': 'admin', 'phone': '9999999999'},
    {'email': 'sohambagade1001@gmail.com', 'name': 'Soham Bagade', 'role': 'admin', 'phone': '9999999998'},
    {'email': 'bagadesoham01@gmail.com', 'name': 'Soham Bagade', 'role': 'customer', 'phone': '9876543201'},
    {'email': 'pm1592003@gmail.com', 'name': 'PM 1592003', 'role': 'customer', 'phone': '9876543202'},
    {'email': 'swayamdakare1@gmail.com', 'name': 'Swayam Dakare', 'role': 'customer', 'phone': '9876543203'},
    {'email': 'kaushaljadhav148@gmail.com', 'name': 'Kaushal Jadhav', 'role': 'customer', 'phone': '9876543204'},
    {'email': 'omkar10@gmail.com', 'name': 'Omkar', 'role': 'customer', 'phone': '9876543205'},
    {'email': 'gavaliomkar191@gmail.com', 'name': 'Omkar Gavali', 'role': 'customer', 'phone': '9876543206'},
    {'email': 'avanishbhosale253@gmail.com', 'name': 'Avanish Bhosale', 'role': 'customer', 'phone': '9876543207'},
    {'email': 'admintestrem@test.com', 'name': 'Admin Tester', 'role': 'admin', 'phone': '9876543208'},
    {'email': 'malecust@test.com', 'name': 'Male Customer', 'role': 'customer', 'phone': '9876543209'},
    {'email': 'customer@trimtime.com', 'name': 'Swayam Customer', 'role': 'customer', 'phone': '9876543211'}
]

for item in all_emails:
    e = item['email']
    u = users_col.find_one({'email': e})
    if not u:
        users_col.insert_one({
            'name': item['name'],
            'email': e,
            'phone': item['phone'],
            'password': hash_password('123456' if item['role'] != 'admin' else 'Kolhapur@2304'),
            'role': item['role'],
            'verified': True,
            'loyalty_points': 250,
            'created_at': now
        })
        print(f"Restored account: {e}")
    else:
        print(f"Account already present: {e}")

print("All user accounts successfully restored and active in MongoDB Atlas!")
