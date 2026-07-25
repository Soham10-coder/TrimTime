import os
import sys
import urllib.request
import urllib.parse
import json

# Fallback defaults for local/production environments
API_URL = os.environ.get("API_URL", "http://localhost:5000/api")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "sohambagade10@gmail.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "Kolhapur@2304")

def run_reminder_cron():
    print("--- Starting TrimTime Autonomous Haircut Reminder Scanner ---")
    
    # 1. Login as Admin to obtain access token
    login_url = f"{API_URL.rstrip('/')}/auth/login"
    login_data = json.dumps({
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }).encode('utf-8')
    
    req = urllib.request.Request(
        login_url,
        data=login_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode())
            access_token = res_data.get("accessToken")
            if not access_token:
                print("Error: Could not retrieve Admin Access Token from login response.")
                sys.exit(1)
            print("Successfully authenticated as Administrator.")
    except Exception as e:
        print(f"Authentication failed: {e}")
        sys.exit(1)

    # 2. Trigger send-reminders endpoint
    reminders_url = f"{API_URL.rstrip('/')}/admin/send-reminders"
    trigger_req = urllib.request.Request(
        reminders_url,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(trigger_req) as response:
            res_data = json.loads(response.read().decode())
            message = res_data.get("message")
            reminders_sent = res_data.get("reminders_sent", 0)
            print(f"SUCCESS: {message}")
            print(f"Total Haircut Reminders Dispatched: {reminders_sent}")
    except Exception as e:
        print(f"Failed to scan and trigger haircut reminders: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_reminder_cron()
