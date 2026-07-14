import os
from pymongo import MongoClient
from config import Config

# Connect using Config settings
mongo_uri = Config.MONGO_URI
client = MongoClient(mongo_uri)
db = client[Config.DB_NAME]
users = db['users']

email = "sohambagade10@gmail.com"
result = users.update_one({"email": email}, {"$set": {"role": "admin", "verified": True}})
if result.matched_count:
    print(f"SUCCESS: Updated {email} to admin and verified.")
else:
    # If user not found, create minimal admin document
    users.insert_one({
        "email": email,
        "password": "",  # placeholder, should already exist
        "role": "admin",
        "verified": True,
        "name": "",
        "phone": "",
        "loyalty_points": 0,
        "favorites": [],
        "created_at": __import__('datetime').datetime.utcnow()
    })
    print(f"INFO: Created new admin user {email} and marked as verified.")
