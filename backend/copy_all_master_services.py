from pymongo import MongoClient
from app.db import master_services_col, barbers_col, hairstyles_col, hash_password
from config import Config
import datetime

# Source database cluster (Advier)
src_client = MongoClient("mongodb+srv://sohambagade1001_db_user:UMXeMyVGbcGTnCRg@advier.wdfhjyf.mongodb.net/trimtime?retryWrites=true&w=majority&appName=advier")
src_db = src_client['trimtime']

# Target database (findmysalon on new Cluster0)
tgt_masters = master_services_col

print("Copying full Master Services catalog (79 services) to findmysalon...")
src_services = list(src_db['master_services'].find())

inserted = 0
for ms in src_services:
    ms_id = ms.pop('_id', None)
    if not tgt_masters.find_one({'name': ms.get('name')}):
        tgt_masters.insert_one(ms)
        inserted += 1

print(f"Successfully copied {inserted} master services! Total master services in findmysalon: {tgt_masters.count_documents({})}")

# Link all master services to SB Salon
sb = barbers_col.find_one({'email': 'sbsalon@trimtime.com'})
if sb:
    sb_id = sb['_id']
    all_masters = list(tgt_masters.find())
    linked_count = 0
    for ms in all_masters:
        if not hairstyles_col.find_one({'barber_id': sb_id, 'name': ms.get('name')}):
            hairstyles_col.insert_one({
                'barber_id': sb_id,
                'master_service_id': ms.get('_id'),
                'name': ms.get('name'),
                'category': ms.get('category', 'Others'),
                'description': ms.get('description', ''),
                'duration': ms.get('default_duration', 30),
                'price': ms.get('default_price', 250),
                'enabled': True
            })
            linked_count += 1
    print(f"Successfully linked {linked_count} services to SB Salon! Total active services for SB Salon: {hairstyles_col.count_documents({'barber_id': sb_id})}")
