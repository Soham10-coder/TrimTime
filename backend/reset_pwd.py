from app import create_app
from app.db import users_col, barbers_col, hash_password

app = create_app()

# Set easy password '123456' for all test accounts
users_col.update_one({'email': 'sohambagade10@gmail.com'}, {'$set': {'password': hash_password('123456'), 'role': 'admin'}})
barbers_col.update_one({'email': 'sbsalon@trimtime.com'}, {'$set': {'password': hash_password('123456')}})
users_col.update_one({'email': 'customer@trimtime.com'}, {'$set': {'password': hash_password('123456'), 'role': 'customer'}})

print("All passwords updated to '123456' successfully!")
