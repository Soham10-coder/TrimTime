import os
from pymongo import MongoClient

# Load environment variables if .env exists (optional)
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
# Use the DB name defined in Config (default is 'trimtime')
db_name = os.getenv('DB_NAME', 'trimtime')
db = client[db_name]
users = db['users']

email = "sohambagade10@gmail.com"
result = users.update_one({"email": email}, {"$set": {"role": "admin", "verified": True}}, upsert=True)
if result.matched_count:
    print(f"SUCCESS: promoted {email} to admin and marked as verified.")
else:
    print(f"INFO: created new admin user {email} and marked as verified.")
