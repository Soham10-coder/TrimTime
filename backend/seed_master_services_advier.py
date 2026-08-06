from pymongo import MongoClient

mongo_uri = "mongodb+srv://sohambagade1001_db_user:UMXeMyVGbcGTnCRg@advier.wdfhjyf.mongodb.net/findmysalon?retryWrites=true&w=majority&appName=advier"
client = MongoClient(mongo_uri)
db = client['findmysalon']

# Copy master services from trimtime db if present or seed standard 90 services
src_master = list(client['trimtime']['master_services'].find({}))
if src_master:
    db['master_services'].delete_many({})
    db['master_services'].insert_many(src_master)
    print(f"Successfully copied {len(src_master)} master services into findmysalon on advier cluster!")

# Normalize categories & cover images
from populate_master_catalog_with_images import category_mapping, category_images

ms_list = list(db['master_services'].find({}))
for idx, s in enumerate(ms_list):
    curr_cat = s.get('category', 'Others')
    new_cat = category_mapping.get(curr_cat, curr_cat)
    img_list = category_images.get(new_cat, category_images["Men's Hair Services"])
    cover_img = img_list[idx % len(img_list)]
    db['master_services'].update_one(
        {'_id': s['_id']},
        {'$set': {'category': new_cat, 'cover_image': cover_img}}
    )

print("Final Master Services Count in findmysalon DB:", db['master_services'].count_documents({}))
print("Categories in DB:", db['master_services'].distinct('category'))
