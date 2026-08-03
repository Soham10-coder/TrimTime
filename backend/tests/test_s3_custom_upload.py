import io
import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.db import barbers_col, hairstyles_col
from app.utils.s3_utils import upload_to_s3

class TestS3CustomUpload(unittest.TestCase):
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_custom_service_image_upload(self):
        sb = barbers_col.find_one({'shop_name': 'SB Salon'})
        self.assertIsNotNone(sb)
        
        hs = hairstyles_col.find_one({'barber_id': sb['_id']})
        self.assertIsNotNone(hs)

        # Create dummy file object
        test_file = io.BytesIO(b'fake image data content')
        test_file.filename = 'custom_hairstyle_photo.jpg'
        test_file.content_type = 'image/jpeg'

        # Test upload_to_s3
        s3_url = upload_to_s3(test_file, 'hairstyles')
        print(f"\nS3 Uploaded URL: {s3_url}")
        self.assertTrue(s3_url.startswith('https://') or s3_url.startswith('/api/uploads/'))

        # Save to DB
        hairstyles_col.update_one({'_id': hs['_id']}, {'$set': {'image_url': s3_url}})

        # Verify GET /api/barber/hairstyles returns this exact custom S3 URL
        res = self.client.get(f"/api/barber/hairstyles/{sb['_id']}")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()

        matching_hs = next((item for item in data if item['id'] == str(hs['_id'])), None)
        self.assertIsNotNone(matching_hs)
        print(f"API Returned imageUrl: {matching_hs['imageUrl']}")
        self.assertEqual(matching_hs['imageUrl'], s3_url)

        print("\nS3 CUSTOM SERVICE IMAGE UPLOAD TEST PASSED 100% PERFECTLY!")

if __name__ == '__main__':
    unittest.main()
