import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.db import users_col, otps_col
from app.controllers.auth_controller import hash_password, check_password

class TestForgotPassword(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    def test_forgot_password_flow(self):
        email = "testresetuser@example.com"
        users_col.delete_many({"email": email})
        otps_col.delete_many({"email": email})

        # 1. Create test user
        hashed = hash_password("OldPassword123!")
        users_col.insert_one({
            "name": "Test Reset User",
            "email": email,
            "phone": "9876543210",
            "password": hashed,
            "role": "customer",
            "verified": True
        })

        # 2. Request Forgot Password
        res_forgot = self.client.post('/api/auth/forgot-password', json={"email": email})
        self.assertEqual(res_forgot.status_code, 200)
        data_forgot = res_forgot.get_json()
        self.assertIn('message', data_forgot)

        # Fetch OTP from DB
        otp_record = otps_col.find_one({"email": email, "type": "reset"})
        self.assertIsNotNone(otp_record)
        otp_code = otp_record["otp"]

        # 3. Verify OTP
        res_verify = self.client.post('/api/auth/verify-otp', json={"email": email, "otp": otp_code, "type": "reset"})
        self.assertEqual(res_verify.status_code, 200)

        # 4. Reset Password
        new_pass = "NewPassword123!"
        res_reset = self.client.post('/api/auth/reset-password', json={"email": email, "otp": otp_code, "newPassword": new_pass})
        self.assertEqual(res_reset.status_code, 200)

        # 5. Verify user password updated in DB
        updated_user = users_col.find_one({"email": email})
        self.assertTrue(check_password(new_pass, updated_user["password"]))

        # Clean up
        users_col.delete_many({"email": email})
        otps_col.delete_many({"email": email})
        print("\nFORGOT PASSWORD FLOW TEST PASSED PERFECTLY!")

if __name__ == '__main__':
    unittest.main()
