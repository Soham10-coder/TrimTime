from app.db import users_col
from app.controllers.auth_controller import check_password

email = 'sohambagade10@gmail.com'
user = users_col.find_one({'email': email})
print('User fetched:', user)
if user:
    pwd_match = check_password('Kolhapur@2304', user['password'])
    print('Password match:', pwd_match)
else:
    print('User not found')
