import os
import sys
import unittest
import json
import datetime
from bson import ObjectId

# Add backend folder to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure app to test environment BEFORE importing app modules
os.environ['SECRET_KEY'] = 'test-secret-123'
os.environ['JWT_SECRET_KEY'] = 'test-access-123'
os.environ['JWT_REFRESH_SECRET_KEY'] = 'test-refresh-123'

from config import Config
Config.DB_NAME = 'trimtime_test'

from app import create_app
from app.db import users_col, barbers_col, hairstyles_col, bookings_col, otps_col, refresh_tokens_col, payments_col

class TrimTimeBackendTests(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
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
            "password": "CustomerPass123!"
        }
        res = self.client.post('/api/auth/register', json=reg_payload)
        self.assertEqual(res.status_code, 201)
        self.assertIn("verify your email with the 6-digit OTP", res.json['message'])

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
            "password": hash_password("UserPass123!"),
            "role": "customer",
            "verified": True
        })

        # Try logging in
        login_payload = {
            "email": "user@test.com",
            "password": "UserPass123!"
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
            'password': 'BarberPass123!',
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
            "password": hash_password("AdminPass123!"),
            "role": "admin",
            "verified": True
        }).inserted_id

        # Log in Admin
        admin_login = self.client.post('/api/auth/login', json={"email": "admin@test.com", "password": "AdminPass123!"})
        admin_token = admin_login.json['accessToken']

        # 3. Approve Barber using Admin credentials
        headers = {"Authorization": f"Bearer {admin_token}"}
        approve_res = self.client.post(f"/api/admin/approve-barber/{str(barber['_id'])}", headers=headers)
        self.assertEqual(approve_res.status_code, 200)

        # Validate verified in database
        barber_updated = barbers_col.find_one({"_id": barber['_id']})
        self.assertTrue(barber_updated['verified'])

        # 4. Remove Barber using Admin credentials
        remove_res = self.client.delete(f"/api/admin/remove-barber/{str(barber['_id'])}", headers=headers)
        self.assertEqual(remove_res.status_code, 200)

        # Validate removed from database
        self.assertIsNone(barbers_col.find_one({"_id": barber['_id']}))

        # 5. Create a test customer to delete
        test_user_id = users_col.insert_one({
            "name": "Delete Me",
            "email": "deleteme@test.com",
            "phone": "7777777777",
            "role": "customer"
        }).inserted_id

        # Delete customer user via admin
        remove_user_res = self.client.delete(f"/api/admin/remove-user/{str(test_user_id)}", headers=headers)
        self.assertEqual(remove_user_res.status_code, 200)

        # Validate customer removed from database
        self.assertIsNone(users_col.find_one({"_id": test_user_id}))

        # 6. Try to delete admin itself (should fail with 403)
        remove_admin_res = self.client.delete(f"/api/admin/remove-user/{str(admin_id)}", headers=headers)
        self.assertEqual(remove_admin_res.status_code, 403)

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
        
        available_slots = [s['time'] for s in res.json if s.get('available', True)]
        
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

    def test_send_reminders(self):
        # 1. Setup admin and login
        from app.controllers.auth_controller import hash_password
        admin_id = users_col.insert_one({
            "name": "Admin Tester",
            "email": "admintestrem@test.com",
            "phone": "8888888888",
            "password": hash_password("AdminPass123!"),
            "role": "admin",
            "verified": True
        }).inserted_id

        login_res = self.client.post('/api/auth/login', json={
            "email": "admintestrem@test.com",
            "password": "AdminPass123!"
        })
        self.assertEqual(login_res.status_code, 200)
        admin_token = login_res.json['accessToken']
        headers = {"Authorization": f"Bearer {admin_token}"}

        # 2. Setup a customer and a booking that was 25 days ago
        import datetime
        today = datetime.date.today()
        booking_date_str = (today - datetime.timedelta(days=25)).strftime("%Y-%m-%d")

        customer_id = users_col.insert_one({
            "name": "Male Customer",
            "email": "malecust@test.com",
            "phone": "8777777777",
            "gender": "Male",
            "role": "customer",
            "verified": True
        }).inserted_id

        bookings_col.insert_one({
            'customer_id': customer_id,
            'date': booking_date_str,
            'status': 'confirmed'
        })

        # 3. Post to send-reminders
        remind_res = self.client.post('/api/admin/send-reminders', headers=headers)
        self.assertEqual(remind_res.status_code, 200)
        self.assertEqual(remind_res.json['reminders_sent'], 1)

    def test_booking_creation_loyalty_points_and_refund_flow(self):
        # 1. Setup customer and login
        from app.controllers.auth_controller import hash_password
        customer_id = users_col.insert_one({
            "name": "Booking Customer",
            "email": "bookingcust@test.com",
            "phone": "9999999999",
            "password": hash_password("CustPass123!"),
            "role": "customer",
            "verified": True,
            "loyalty_points": 0
        }).inserted_id

        login_res = self.client.post('/api/auth/login', json={
            "email": "bookingcust@test.com",
            "password": "CustPass123!"
        })
        self.assertEqual(login_res.status_code, 200)
        cust_token = login_res.json['accessToken']
        headers = {"Authorization": f"Bearer {cust_token}"}

        # 2. Setup verified barber
        barber_id = barbers_col.insert_one({
            'owner_name': 'Ramesh',
            'shop_name': 'Ramesh Salon',
            'email': 'ramesh@salon.com',
            'opening_time': '09:00',
            'closing_time': '20:00',
            'verified': True,
            'status': 'active',
            'platform_fee_percent': 10.0
        }).inserted_id

        # 3. Setup hairstyle service
        hairstyle_id = hairstyles_col.insert_one({
            'barber_id': barber_id,
            'name': 'Gold Facial',
            'price': 500,
            'duration': 30
        }).inserted_id

        # 4. Book the service (date is tomorrow to guarantee >= 24h cancellation window)
        tomorrow_str = (datetime.date.today() + datetime.timedelta(days=2)).strftime("%Y-%m-%d")
        
        booking_res = self.client.post('/api/booking/create', json={
            "barberId": str(barber_id),
            "hairstyleId": str(hairstyle_id),
            "staffId": "1",
            "staffName": "Master Ramesh",
            "date": tomorrow_str,
            "timeSlot": "11:00",
            "paymentMethod": "UPI",
            "transactionId": "TXN_MOCK_12345"
        }, headers=headers)
        self.assertEqual(booking_res.status_code, 201)
        booking_data = booking_res.json['booking']
        mongo_booking_id = booking_data['id']

        # 5. Verify loyalty points (10% of 500 = 50 points)
        updated_cust = users_col.find_one({'_id': customer_id})
        self.assertEqual(updated_cust.get('loyalty_points'), 50)

        # 6. Verify payment record was logged in payments_col
        payment_doc = payments_col.find_one({'booking_id': ObjectId(mongo_booking_id)})
        self.assertIsNotNone(payment_doc)
        self.assertEqual(payment_doc.get('status'), 'captured')
        self.assertEqual(payment_doc.get('amount'), 500.0) # customer pays exact service price (500)

        # 7. Cancel booking and check for refund trigger (since tomorrow > 24 hours away)
        cancel_res = self.client.post('/api/booking/cancel', json={
            "bookingId": mongo_booking_id
        }, headers=headers)
        self.assertEqual(cancel_res.status_code, 200)
        self.assertTrue(cancel_res.json['refundProcessed'])
        self.assertEqual(cancel_res.json['paymentStatus'], 'refunded')

        # 8. Verify statuses in DB
        updated_booking = bookings_col.find_one({'_id': ObjectId(mongo_booking_id)})
        self.assertEqual(updated_booking.get('status'), 'cancelled')
        self.assertEqual(updated_booking.get('payment_status'), 'refunded')

        updated_payment = payments_col.find_one({'_id': payment_doc['_id']})
        self.assertEqual(updated_payment.get('status'), 'refunded')

if __name__ == '__main__':
    unittest.main()
