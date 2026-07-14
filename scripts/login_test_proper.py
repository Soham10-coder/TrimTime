import json, requests

url = "http://127.0.0.1:5000/api/auth/login"
payload = {
    "email": "sohambagade10@gmail.com",
    "password": "Kolhapur@2304"
}
headers = {"Content-Type": "application/json"}

try:
    resp = requests.post(url, json=payload, headers=headers, timeout=5)
    print("Status:", resp.status_code)
    print(json.dumps(resp.json(), indent=2))
except Exception as e:
    print("Request failed:", e)
