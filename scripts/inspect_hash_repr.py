import os, json
from pymongo import MongoClient

mongo_uri = os.getenv('MONGO_URI')
if not mongo_uri:
    mongo_uri = "mongodb+srv://sohambagade1001_db_user:UMXeMyVGbcGTnCRg@advier.wdfhjyf.mongodb.net/advier"
client = MongoClient(mongo_uri)
db = client[os.getenv('DB_NAME', 'advier')]
user = db['users'].find_one({'email': 'sohambagade10@gmail.com'})
print('Raw password field repr:', repr(user['password']))
