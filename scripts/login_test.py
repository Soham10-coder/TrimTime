import os, json, sys
import requests

url = "http://127.0.0.1:5000/api/auth/login"
payload = {
    "email": "sohambagade10@gmail.com",
    "password": "Kolhapur@2304"
}

try:
    resp = requests.post(url, json=payload)
    print("Status:", resp.status_code)
    try:
        data = resp.json()
        print(json.dumps(data, indent=2))
    except Exception:
        print("Response text:", resp.text)
except Exception as e:
    print("Error:", e)
    sys.exit(1)
