from app.db import users_col
import datetime

email = "sohambagade10@gmail.com"
# Update role to admin and set verified True
result = users_col.update_one({"email": email}, {"$set": {"role": "admin", "verified": True}})
if result.matched_count:
    print(f"SUCCESS: Updated {email} to admin and verified.")
else:
    # If not found, create a minimal admin document (ensure password is set later)
    users_col.insert_one({
        "email": email,
        "password": "",  # placeholder; should be set by password reset or existing
        "role": "admin",
        "verified": True,
        "name": "",
        "phone": "",
        "loyalty_points": 0,
        "favorites": [],
        "created_at": datetime.datetime.utcnow()
    })
    print(f"INFO: Created new admin user {email} and marked as verified.")
