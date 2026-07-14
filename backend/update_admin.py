import os
from pymongo import MongoClient
from config import Config

# Connect to the MongoDB using the same config as the Flask app
client = MongoClient(Config.MONGO_URI)
db = client[Config.DB_NAME]
users = db['users']

email = "sohambagade10@gmail.com"
# Update the user to have admin role and be verified
result = users.update_one({"email": email}, {"$set": {"role": "admin", "verified": True}})
print(f"Matched {result.matched_count} document(s), modified {result.modified_count} document(s).")
