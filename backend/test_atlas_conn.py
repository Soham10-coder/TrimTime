import certifi
import pymongo
from config import Config

print("Testing MongoDB Atlas connection...")
try:
    client = pymongo.MongoClient(
        Config.MONGO_URI,
        tls=True,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000
    )
    print("Database Names:", client.list_database_names())
    print("SUCCESSFULLY CONNECTED TO MONGODB ATLAS!")
except Exception as e:
    print("CONNECTION ERROR:", e)
