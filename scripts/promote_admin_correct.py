from app.db import users_col

email = "sohambagade10@gmail.com"

result = users_col.update_one({"email": email}, {"$set": {"role": "admin", "verified": True}}, upsert=True)
if result.matched_count:
    print(f"SUCCESS: promoted {email} to admin and marked as verified.")
else:
    # upsert created a new document; set defaults for required fields minimally
    print(f"INFO: created new admin user {email} and marked as verified.")
