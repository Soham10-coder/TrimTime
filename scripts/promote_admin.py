import os
from pymongo import MongoClient

# Load connection string from environment variable if present
mongo_uri = os.getenv('MONGO_URI')
if not mongo_uri:
    # Fallback hard‑coded URI (should match .env)
    mongo_uri = "mongodb+srv://sohambagade1001_db_user:UMXeMyVGbcGTnCRg@advier.wdfhjyf.mongodb.net/advier"

client = MongoClient(mongo_uri)
# Database name (default in config)
db_name = os.getenv('DB_NAME', 'advier')
db = client[db_name]
users = db['users']

email = "sohambagade10@gmail.com"
# upsert ensures the document exists; set role to admin and verified true
result = users.update_one({"email": email}, {"$set": {"role": "admin", "verified": True}}, upsert=True)
if result.matched_count:
    print(f"SUCCESS: promoted {email} to admin and marked as verified.")
else:
    print(f"INFO: created new admin user {email} and marked as verified.")
