from app import create_app
from app.controllers.barber_controller import register_barber
import traceback

app = create_app()

with app.test_request_context('/api/auth/barber/register', method='POST', data={
    'email': 'sohambagade1001@gmail.com',
    'password': 'Password@123',
    'ownerName': 'SohamBagade',
    'shopName': 'SP Salon',
    'phone': '7721936700',
    'city': 'Kolhapur',
    'salonType': "Men's Salon",
    'identityProofType': 'Aadhaar Card',
    'businessProofType': 'Shop License'
}):
    try:
        res = register_barber()
        print('Status Code:', res[1])
        print('Response JSON:', res[0].get_json())
    except Exception as e:
        traceback.print_exc()
