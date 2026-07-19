import datetime
import logging
from flask import request, jsonify, g
from bson import ObjectId
from app.db import barbers_col
from app.utils.cloudinary_utils import upload_image

logger = logging.getLogger(__name__)

def get_wizard_progress():
    try:
        barber_id = g.current_user_id
        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber:
            return jsonify({'message': 'Barber not found'}), 404

        progress = {
            'step': barber.get('wizard_step', 1),
            'completed': barber.get('wizard_completed', False),
            'shopName': barber.get('shop_name', ''),
            'ownerName': barber.get('owner_name', ''),
            'city': barber.get('city', ''),
            'address': barber.get('address', ''),
            'lat': barber.get('lat', 18.5204),
            'lng': barber.get('lng', 73.8567),
            'openingTime': barber.get('opening_time', '09:00'),
            'closingTime': barber.get('closing_time', '20:00'),
            'weeklyHoliday': barber.get('weekly_holiday'),
            'seats': barber.get('seats', 3),
            'staffCount': barber.get('staff_count', 2),
            'services': barber.get('services_list', []),
            'paymentMethods': barber.get('payment_methods', ['Cash', 'UPI']),
            'amenities': barber.get('amenities', ['Air Conditioning', 'WiFi'])
        }

        return jsonify({'data': progress}), 200

    except Exception as e:
        logger.error(f"Error in get_wizard_progress: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_1():
    try:
        barber_id = g.current_user_id
        data = request.json or {}
        
        update = {
            'shop_name': data.get('shopName', '').strip(),
            'address': data.get('address', '').strip(),
            'city': data.get('city', '').strip(),
            'lat': float(data.get('lat', 18.5204)),
            'lng': float(data.get('lng', 73.8567)),
            'wizard_step': 2
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Step 1 saved successfully', 'nextStep': 2}), 200

    except Exception as e:
        logger.error(f"Error in save_step_1: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_2():
    try:
        barber_id = g.current_user_id
        data = request.json or {}
        
        update = {
            'opening_time': data.get('openingTime', '09:00'),
            'closing_time': data.get('closingTime', '20:00'),
            'weekly_holiday': data.get('weeklyHoliday'),
            'wizard_step': 3
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Step 2 saved successfully', 'nextStep': 3}), 200

    except Exception as e:
        logger.error(f"Error in save_step_2: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_3():
    try:
        barber_id = g.current_user_id
        shop_images_files = request.files.getlist('shopImages')

        shop_images = []
        for file in shop_images_files:
            if file and file.filename != '':
                raw_url = upload_image(file, 'shop_images')
                full_url = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url
                shop_images.append(full_url)

        update = {'wizard_step': 4}
        if shop_images:
            update['shop_images'] = shop_images

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update, '$addToSet': {'shop_images': {'$each': shop_images}}})
        return jsonify({'message': 'Step 3 saved successfully', 'nextStep': 4}), 200

    except Exception as e:
        logger.error(f"Error in save_step_3: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_4():
    try:
        barber_id = g.current_user_id
        data = request.json or {}

        update = {
            'seats': int(data.get('seats', 3)),
            'staff_count': int(data.get('staffCount', 2)),
            'wizard_step': 5
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Step 4 saved successfully', 'nextStep': 5}), 200

    except Exception as e:
        logger.error(f"Error in save_step_4: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_5():
    try:
        barber_id = g.current_user_id
        data = request.json or {}

        services = data.get('services', [])
        update = {
            'services_list': services,
            'wizard_step': 6
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Step 5 saved successfully', 'nextStep': 6}), 200

    except Exception as e:
        logger.error(f"Error in save_step_5: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_6():
    try:
        barber_id = g.current_user_id
        data = request.json or {}

        update = {
            'payment_methods': data.get('paymentMethods', ['Cash', 'UPI']),
            'wizard_step': 7
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Step 6 saved successfully', 'nextStep': 7}), 200

    except Exception as e:
        logger.error(f"Error in save_step_6: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_7():
    try:
        barber_id = g.current_user_id
        data = request.json or {}

        update = {
            'amenities': data.get('amenities', []),
            'wizard_step': 8
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Step 7 saved successfully', 'nextStep': 8}), 200

    except Exception as e:
        logger.error(f"Error in save_step_7: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def save_step_8():
    try:
        barber_id = g.current_user_id

        update = {
            'wizard_completed': True,
            'wizard_step': 8,
            'wizard_submitted_at': datetime.datetime.utcnow()
        }

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update})
        return jsonify({'message': 'Salon setup completed successfully! Your shop is configured.', 'wizardCompleted': True}), 200

    except Exception as e:
        logger.error(f"Error in save_step_8: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
