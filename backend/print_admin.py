from app.db import users_col
import json, pprint
admin = users_col.find_one({'email': 'sohambagade10@gmail.com'})
print('Admin document:')
pprint.pprint(admin)
