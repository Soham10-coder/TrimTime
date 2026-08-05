from app import create_app
from app.db import barbers_col, users_col, hash_password

app = create_app()

barbers_col.update_many(
    {'email': 'sohambagade1001@gmail.com'},
    {'$set': {'password': hash_password('123456'), 'verification_status': 'APPROVED', 'verified': True, 'status': 'active'}}
)
users_col.update_many(
    {'email': 'sohambagade1001@gmail.com'},
    {'$set': {'password': hash_password('123456')}}
)

print("SP Saloon (sohambagade1001@gmail.com) password set to '123456' and status set to APPROVED!")
