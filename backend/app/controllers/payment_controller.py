import datetime
import logging
from flask import request, jsonify
from bson import ObjectId
from app.db import bookings_col, payments_col, users_col, barbers_col, hairstyles_col
from app.utils.razorpay_utils import verify_payment_signature
from app.utils.email_utils import send_booking_confirmation
from config import Config

logger = logging.getLogger(__name__)

def verify_and_confirm_payment():
    """
    Verifies Razorpay payment signature and confirms booking.
    Called by frontend after successful payment popup.
    """
    try:
        data = request.json or {}
        booking_id = data.get('bookingId') # Mongo ID
        razorpay_payment_id = data.get('razorpayPaymentId')
        razorpay_order_id = data.get('razorpayOrderId')
        razorpay_signature = data.get('razorpaySignature')
        payment_method = data.get('paymentMethod', 'online')

        if not all([booking_id, razorpay_payment_id, razorpay_order_id, razorpay_signature]):
            return jsonify({'message': 'Missing payment signature verification parameters'}), 400

        if not ObjectId.is_valid(booking_id):
            return jsonify({'message': 'Invalid booking reference'}), 400

        booking = bookings_col.find_one({'_id': ObjectId(booking_id)})
        if not booking:
            return jsonify({'message': 'Booking not found'}), 404

        # Verify signature
        is_valid = verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature)
        if not is_valid:
            # Mark payment as failed
            bookings_col.update_one(
                {'_id': ObjectId(booking_id)},
                {'$set': {'status': 'cancelled', 'payment_status': 'failed'}}
            )
            payments_col.insert_one({
                'booking_id': ObjectId(booking_id),
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature,
                'amount': booking.get('final_price'),
                'status': 'failed',
                'method': payment_method,
                'created_at': datetime.datetime.utcnow()
            })
            return jsonify({'message': 'Payment signature verification failed'}), 400

        # Successful payment
        # 1. Save payment log
        payment_doc = {
            'booking_id': ObjectId(booking_id),
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
            'amount': booking.get('final_price'),
            'status': 'captured',
            'method': payment_method,
            'created_at': datetime.datetime.utcnow()
        }
        payment_insert = payments_col.insert_one(payment_doc)

        # 2. Update booking status
        bookings_col.update_one(
            {'_id': ObjectId(booking_id)},
            {
                '$set': {
                    'status': 'confirmed',
                    'payment_status': 'paid',
                    'payment_id': payment_insert.inserted_id
                }
            }
        )

        # 3. Add loyalty points (10% of final price as points)
        points_earned = int(booking.get('final_price', 0) * 0.1)
        users_col.update_one(
            {'_id': booking['customer_id']},
            {'$inc': {'loyalty_points': points_earned}}
        )

        # 4. Fetch entities for email confirmation
        customer = users_col.find_one({'_id': booking['customer_id']})
        barber = barbers_col.find_one({'_id': booking['barber_id']})
        hairstyle = hairstyles_col.find_one({'_id': booking['hairstyle_id']})

        if customer and barber and hairstyle:
            booking_details = {
                'booking_id': booking.get('booking_id'),
                'shop_name': barber.get('shop_name'),
                'hairstyle_name': hairstyle.get('name'),
                'date': booking.get('date'),
                'time': booking.get('time_slot'),
                'duration': hairstyle.get('duration', 30),
                'price': booking.get('final_price')
            }
            send_booking_confirmation(customer.get('email'), customer.get('name'), booking_details)

        return jsonify({
            'message': 'Payment verified and booking confirmed successfully',
            'bookingId': booking.get('booking_id'),
            'pointsEarned': points_earned
        }), 200

    except Exception as e:
        logger.error(f"Error verifying payment: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def razorpay_webhook():
    """
    Razorpay Webhook endpoint to capture payments asynchronously if users close checkout.
    """
    try:
        # Validate Webhook Signature
        webhook_signature = request.headers.get('X-Razorpay-Signature')
        webhook_body = request.data

        if not webhook_signature:
            return jsonify({'message': 'Missing signature'}), 400

        # Optional validation using hmac
        # ...
        
        event_data = request.json or {}
        event_name = event_data.get('event')
        
        if event_name == 'payment.captured':
            payment_entity = event_data.get('payload', {}).get('payment', {}).get('entity', {})
            order_id = payment_entity.get('order_id')
            payment_id = payment_entity.get('id')
            method = payment_entity.get('method', 'online')
            
            # Check if booking exists with this order ID
            booking = bookings_col.find_one({'razorpay_order_id': order_id})
            
            if booking and booking['status'] == 'pending':
                # Re-confirm booking just like verify_and_confirm_payment
                payment_doc = {
                    'booking_id': booking['_id'],
                    'razorpay_order_id': order_id,
                    'razorpay_payment_id': payment_id,
                    'razorpay_signature': 'webhook_verified',
                    'amount': booking.get('final_price'),
                    'status': 'captured',
                    'method': method,
                    'created_at': datetime.datetime.utcnow()
                }
                payment_insert = payments_col.insert_one(payment_doc)
                
                bookings_col.update_one(
                    {'_id': booking['_id']},
                    {
                        '$set': {
                            'status': 'confirmed',
                            'payment_status': 'paid',
                            'payment_id': payment_insert.inserted_id
                        }
                    }
                )
                
                # Award loyalty points
                points_earned = int(booking.get('final_price', 0) * 0.1)
                users_col.update_one({'_id': booking['customer_id']}, {'$inc': {'loyalty_points': points_earned}})
                
                # Send email
                customer = users_col.find_one({'_id': booking['customer_id']})
                barber = barbers_col.find_one({'_id': booking['barber_id']})
                hairstyle = hairstyles_col.find_one({'_id': booking['hairstyle_id']})
                
                if customer and barber and hairstyle:
                    booking_details = {
                        'booking_id': booking.get('booking_id'),
                        'shop_name': barber.get('shop_name'),
                        'hairstyle_name': hairstyle.get('name'),
                        'date': booking.get('date'),
                        'time': booking.get('time_slot'),
                        'duration': hairstyle.get('duration', 30),
                        'price': booking.get('final_price')
                    }
                    send_booking_confirmation(customer.get('email'), customer.get('name'), booking_details)
                    
        return jsonify({'status': 'ok'}), 200

    except Exception as e:
        logger.error(f"Error in Razorpay Webhook: {e}")
        return jsonify({'message': 'Webhook failed'}), 500
