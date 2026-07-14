import os
from pymongo import MongoClient
import bcrypt
from config import Config

# Connect using same config
client = MongoClient(Config.MONGO_URI)
db = client[Config.DB_NAME]
users = db['users']

email = "sohambagade10@gmail.com"
new_password = "Kolhapur@2304"
# Generate bcrypt hash
hashed = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

result = users.update_one({"email": email}, {"$set": {"password": hashed, "role": "admin", "verified": True}})
print(f"Matched: {result.matched_count}, Modified: {result.modified_count}")
print(f"New hash: {hashed}")
