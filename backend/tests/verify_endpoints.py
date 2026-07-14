import os
import sys
import unittest
import json
import datetime
from bson import ObjectId

# Add backend folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.db import users_col, barbers_col, hairstyles_col, bookings_col, otps_col, refresh_tokens_col, payments_col

class TrimTimeBackendTests(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        # Configure app to test environment
        os.environ['SECRET_KEY'] = 'test-secret-123'
        os.environ['JWT_SECRET_KEY'] = 'test-access-123'
        os.environ['JWT_REFRESH_SECRET_KEY'] = 'test-refresh-123'
        
        # Override DB Name to test database
        from config import Config
        Config.DB_NAME = 'trimtime_test'
        
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def setUp(self):
        # Clear collections before each test to guarantee test isolation
        users_col.delete_many({})
        barbers_col.delete_many({})
        hairstyles_col.delete_many({})
        bookings_col.delete_many({})
        otps_col.delete_many({})
        refresh_tokens_col.delete_many({})
        payments_col.delete_many({})

    def test_customer_registration_and_otp_flow(self):
        # 1. Register Customer
        reg_payload = {
            "name": "Test Customer",
            "email": "customer@test.com",
            "phone": "9999999999",
            "password": "customerpass123"
        }
        res = self.client.post('/api/auth/register', json=reg_payload)
        self.assertEqual(res.status_code, 201)
        self.assertIn("verify email with OTP", res.json['message'])

        # Verify OTP record created
        otp_record = otps_col.find_one({"email": "customer@test.com"})
        self.assertIsNotNone(otp_record)
        otp_code = otp_record['otp']

        # 2. Verify OTP code
        verify_payload = {
            "email": "customer@test.com",
            "otp": otp_code,
            "type": "signup"
        }
        verify_res = self.client.post('/api/auth/verify-otp', json=verify_payload)
        self.assertEqual(verify_res.status_code, 200)

        # 3. Check customer verified in Database
        user = users_col.find_one({"email": "customer@test.com"})
        self.assertTrue(user['verified'])

    def test_login_and_jwt_tokens(self):
        # Register and verify customer first
        from app.controllers.auth_controller import hash_password
        users_col.insert_one({
            "name": "Verified User",
            "email": "user@test.com",
            "phone": "9999999999",
            "password": hash_password("userpass123"),
            "role": "customer",
            "verified": True
        })

        # Try logging in
        login_payload = {
            "email": "user@test.com",
            "password": "userpass123"
        }
        res = self.client.post('/api/auth/login', json=login_payload)
        self.assertEqual(res.status_code, 200)
        self.assertIn("accessToken", res.json)
        self.assertEqual(res.json['user']['role'], 'customer')

        # Check refresh token cookie is set
        cookie_header = res.headers.get('Set-Cookie')
        self.assertIn('refreshToken', cookie_header)

    def test_barber_registration_and_admin_approval(self):
        # 1. Register Barber Profile (Multipart data simulation)
        from io import BytesIO
        data = {
            'email': 'barber@test.com',
            'password': 'barberpass123',
            'ownerName': 'Test Owner',
            'shopName': 'Classic Shaves',
            'phone': '8888888888',
            'address': 'MG Road',
            'city': 'Pune',
            'openingTime': '09:00',
            'closingTime': '20:00',
            'weeklyHoliday': '6',
            'experience': '6',
            'description': 'Classic style shaves',
            'profilePic': (BytesIO(b"dummy pic"), 'profile.jpg'),
            'aadhaarPan': (BytesIO(b"dummy document"), 'doc.pdf')
        }
        res = self.client.post('/api/barber/register', data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 201)

        # Confirm verified flag is false initially
        barber = barbers_col.find_one({"email": "barber@test.com"})
        self.assertIsNotNone(barber)
        self.assertFalse(barber['verified'])

        # 2. Register Admin to approve the Barber
        from app.controllers.auth_controller import hash_password
        admin_id = users_col.insert_one({
            "name": "Super Admin",
            "email": "admin@test.com",
            "password": hash_password("adminpass123"),
            "role": "admin",
            "verified": True
        }).inserted_id

        # Log in Admin
        admin_login = self.client.post('/api/auth/login', json={"email": "admin@test.com", "password": "adminpass123"})
        admin_token = admin_login.json['accessToken']

        # 3. Approve Barber using Admin credentials
        headers = {"Authorization": f"Bearer {admin_token}"}
        approve_res = self.client.post(f"/api/admin/approve-barber/{str(barber['_id'])}", headers=headers)
        self.assertEqual(approve_res.status_code, 200)

        # Validate verified in database
        barber_updated = barbers_col.find_one({"_id": barber['_id']})
        self.assertTrue(barber_updated['verified'])

    def test_dynamic_slots_allocation(self):
        # 1. Setup verified barber
        barber_id = barbers_col.insert_one({
            'owner_name': 'Vikram',
            'shop_name': 'Classic Cuts',
            'email': 'vikram@cuts.com',
            'opening_time': '09:00',
            'closing_time': '12:00', # 3 hours shift (09:00, 09:30, 10:00, 10:30, 11:00, 11:30 slots)
            'weekly_holiday': 6, # Sunday
            'verified': True,
            'status': 'active'
        }).inserted_id

        # 2. Add hairstyle service (45 mins duration)
        hairstyle_id = hairstyles_col.insert_one({
            'barber_id': barber_id,
            'name': 'Fade Cut',
            'price': 300,
            'duration': 45
        }).inserted_id

        # 3. Add existing booking at 10:00 AM (ends at 10:45 + 10 mins buffer = 10:55)
        bookings_col.insert_one({
            'booking_id': 'TT-1002',
            'customer_id': ObjectId(),
            'barber_id': barber_id,
            'hairstyle_id': hairstyle_id,
            'date': '2026-07-20', # Assuming a Monday
            'time_slot': '10:00',
            'status': 'confirmed',
            'created_at': datetime.datetime.utcnow()
        })

        # 4. Fetch available slots
        res = self.client.get(f'/api/booking/slots?barberId={str(barber_id)}&date=2026-07-20&hairstyleId={str(hairstyle_id)}')
        self.assertEqual(res.status_code, 200)
        
        # Check slot availability
        available_slots = [s['time'] for s in res.json]
        
        # Expected:
        # 09:00 -> ends 09:45 + 10 buffer = 09:55. Doesn't overlap with 10:00. AVAILABLE.
        # 09:30 -> ends 10:15 + 10 buffer = 10:25. Collides with 10:00. UNAVAILABLE.
        # 10:00 -> collides with booking 10:00. UNAVAILABLE.
        # 10:30 -> ends 11:15. Booking 10:00 ends at 10:55 (including buffer). Collides (10:30 < 10:55). UNAVAILABLE.
        # 11:00 -> ends 11:45. Booking ends at 10:55. AVAILABLE (11:00 >= 10:55).
        self.assertIn('09:00', available_slots)
        self.assertNotIn('09:30', available_slots)
        self.assertNotIn('10:00', available_slots)
        self.assertNotIn('10:30', available_slots)
        self.assertIn('11:00', available_slots)

if __name__ == '__main__':
    unittest.main()
