import os, bcrypt
from pymongo import MongoClient

mongo_uri = os.getenv('MONGO_URI')
if not mongo_uri:
    mongo_uri = "mongodb+srv://sohambagade1001_db_user:UMXeMyVGbcGTnCRg@advier.wdfhjyf.mongodb.net/advier"
client = MongoClient(mongo_uri)
db_name = os.getenv('DB_NAME', 'advier')
db = client[db_name]
users = db['users']

email = "sohambagade10@gmail.com"
plain_pwd = "Kolhapur@2304"
hashed = bcrypt.hashpw(plain_pwd.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

result = users.update_one({"email": email}, {"$set": {"password": hashed}})
if result.matched_count:
    print(f"SUCCESS: password for {email} updated with bcrypt hash.")
else:
    print(f"ERROR: user {email} not found.")
