from config import Config
from app.db import users_col
import pprint

print('Config.DB_NAME =', Config.DB_NAME)
print('User emails in this DB:')
emails = [u.get('email') for u in users_col.find({}, {'email': 1})]
pp = pprint.PrettyPrinter(indent=2)
pp.pprint(emails)
