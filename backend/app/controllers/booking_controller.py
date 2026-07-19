import datetime
import logging
import uuid
import random
import qrcode
import io
import base64
from flask import request, jsonify, g
from bson import ObjectId
from app.db import bookings_col, barbers_col, hairstyles_col, users_col, coupons_col, payments_col
from app.utils.email_utils import send_booking_confirmation, send_booking_cancellation
from app.utils.razorpay_utils import create_razorpay_order

logger = logging.getLogger(__name__)

BUFFER_TIME_MINS = 10

def time_to_minutes(time_str):
    try:
        parts = time_str.split(':')
        return int(parts[0]) * 60 + int(parts[1])
    except Exception as e:
        logger.error(f"Error parsing time format {time_str}: {e}")
        return 0

def minutes_to_time(minutes):
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

def generate_slots_for_barber(barber_doc, date_str, duration_mins, staff_id=None):
    if barber_doc.get('holiday_mode', False):
        return []

    try:
        target_date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return []

    # Check weekly holiday
    if barber_doc.get('weekly_holiday') is not None:
        if target_date.weekday() == barber_doc.get('weekly_holiday'):
            return []

    # (c) Check independent staff member holiday if staff_id is selected
    if staff_id and barber_doc.get('staff'):
        staff_member = next((s for s in barber_doc['staff'] if str(s.get('id')) == str(staff_id) or s.get('name') == staff_id), None)
        if staff_member and staff_member.get('holiday'):
            weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            current_weekday_name = weekday_names[target_date.weekday()]
            if staff_member.get('holiday').strip().lower() == current_weekday_name.lower():
                return []

    open_mins = time_to_minutes(barber_doc.get('opening_time', '09:00'))
    close_mins = time_to_minutes(barber_doc.get('closing_time', '20:00'))

    query = {
        'barber_id': barber_doc['_id'],
        'date': date_str,
        'status': {'$in': ['confirmed', 'pending', 'completed']}
    }
    if staff_id:
        query['staff_id'] = staff_id

    existing_bookings = list(bookings_col.find(query))

    booked_intervals = []
    for b in existing_bookings:
        start_m = time_to_minutes(b['time_slot'])
        duration = 30
        hs = hairstyles_col.find_one({'_id': b.get('hairstyle_id')})
        if hs:
            duration = hs.get('duration', 30)
            
        end_m = start_m + duration + BUFFER_TIME_MINS
        booked_intervals.append((start_m, end_m))

    available_slots = []
    current_time = datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)
    is_today = target_date == current_time.date()
    current_mins_today = current_time.hour * 60 + current_time.minute + 15

    for slot_start in range(open_mins, close_mins, 30):
        slot_end = slot_start + duration_mins
        
        if slot_end > close_mins:
            continue

        if is_today and slot_start < current_mins_today:
            continue

        collides = False
        new_interval_start = slot_start
        new_interval_end = slot_start + duration_mins + BUFFER_TIME_MINS

        for booked_start, booked_end in booked_intervals:
            if (new_interval_start < booked_end) and (new_interval_end > booked_start):
                collides = True
                break

        slot_time_str = minutes_to_time(slot_start)
        time_obj = datetime.datetime.strptime(slot_time_str, "%H:%M")
        display_time = time_obj.strftime("%I:%M %p")

        if not collides:
            available_slots.append({
                'time': slot_time_str,
                'displayTime': display_time,
                'available': True
            })

    return available_slots

def get_available_slots():
    try:
        barber_id = request.args.get('barberId')
        date_str = request.args.get('date')
        hairstyle_id = request.args.get('hairstyleId')
        staff_id = request.args.get('staffId')

        if not barber_id or not date_str or not hairstyle_id:
            return jsonify({'message': 'BarberId, date (YYYY-MM-DD), and hairstyleId are required'}), 400

        if not ObjectId.is_valid(barber_id) or not ObjectId.is_valid(hairstyle_id):
            return jsonify({'message': 'Invalid ID formats'}), 400

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber:
            return jsonify({'message': 'Barber shop not found'}), 404

        hairstyle = hairstyles_col.find_one({'_id': ObjectId(hairstyle_id)})
        if not hairstyle:
            return jsonify({'message': 'Hairstyle service not found'}), 404

        slots = generate_slots_for_barber(barber, date_str, hairstyle.get('duration', 30), staff_id)
        return jsonify(slots), 200

    except Exception as e:
        logger.error(f"Error fetching slots: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def generate_qr_code_base64(data_str):
    try:
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(data_str)
        qr.make(fit=True)
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode('utf-8')
    except Exception as e:
        logger.error(f"Failed to generate QR code: {e}")
        return ""

def create_booking():
    """
    (e) 10%-15% platform online convenience fee applied on customer online booking.
    (f) 6-digit In-Person Check-In OTP generated for validation at salon.
    (a) Selected barber staff member attached.
    """
    try:
        customer_id = g.current_user_id
        customer_email = g.current_user_email
        customer_name = g.current_user.get('name', 'Customer')
        data = request.json or {}
        
        barber_id = data.get('barberId')
        hairstyle_id = data.get('hairstyleId')
        staff_id = data.get('staffId')
        staff_name = data.get('staffName', 'Senior Stylist')
        date_str = data.get('date')
        time_slot = data.get('timeSlot')
        coupon_code = data.get('couponCode', '').strip().upper()

        if not all([barber_id, hairstyle_id, date_str, time_slot]):
            return jsonify({'message': 'Required booking inputs are missing'}), 400

        if not ObjectId.is_valid(barber_id) or not ObjectId.is_valid(hairstyle_id):
            return jsonify({'message': 'Invalid parameters format'}), 400

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber or not barber.get('verified', False) or barber.get('status') != 'active':
            return jsonify({'message': 'Barber shop is currently unavailable'}), 404

        hairstyle = hairstyles_col.find_one({'_id': ObjectId(hairstyle_id)})
        if not hairstyle:
            return jsonify({'message': 'Selected service not found'}), 404

        # Validate Slot Availability
        available_slots = generate_slots_for_barber(barber, date_str, hairstyle.get('duration', 30), staff_id)
        slot_is_free = any(slot['time'] == time_slot for slot in available_slots)
        if not slot_is_free:
            return jsonify({'message': 'The requested time slot is no longer available'}), 409

        original_price = float(hairstyle.get('price', 0))
        discount = 0.0
        service_final_price = original_price

        if coupon_code:
            coupon = coupons_col.find_one({'code': coupon_code, 'active': True})
            if coupon and coupon.get('expiry_date') > datetime.datetime.utcnow():
                if original_price >= coupon.get('min_booking_amount', 0):
                    if coupon.get('discount_type') == 'percentage':
                        discount = round((coupon.get('value', 0) / 100.0) * original_price, 2)
                    else:
                        discount = float(coupon.get('value', 0))
                    discount = min(discount, original_price)
                    service_final_price = original_price - discount

        # (e) Calculate 10% - 15% Platform Convenience Charge
        platform_fee_rate = barber.get('platform_fee_percent', 10.0) # 10% default
        platform_fee = round(service_final_price * (platform_fee_rate / 100.0), 2)
        total_amount = round(service_final_price + platform_fee, 2)

        # (f) Generate 6-digit Check-In OTP for in-person salon arrival validation
        check_in_otp = str(random.randint(100000, 999999))
        booking_short_id = f"TT-{str(uuid.uuid4().int)[:6]}"
        
        qr_data = f"TrimTime Booking:{booking_short_id}|OTP:{check_in_otp}|Barber:{barber.get('shop_name')}|Service:{hairstyle.get('name')}"
        qr_base64 = generate_qr_code_base64(qr_data)

        booking_doc = {
            'booking_id': booking_short_id,
            'check_in_otp': check_in_otp,
            'customer_id': ObjectId(customer_id),
            'customer_name': customer_name,
            'customer_email': customer_email,
            'barber_id': ObjectId(barber_id),
            'hairstyle_id': ObjectId(hairstyle_id),
            'staff_id': staff_id,
            'staff_name': staff_name,
            'date': date_str,
            'time_slot': time_slot,
            'price': original_price,
            'discount': discount,
            'service_final_price': service_final_price,
            'platform_fee_percent': platform_fee_rate,
            'platform_fee': platform_fee,
            'total_amount': total_amount,
            'status': 'confirmed',
            'payment_status': 'paid',
            'qr_code': qr_base64,
            'created_at': datetime.datetime.utcnow()
        }

        order_res = create_razorpay_order(total_amount, booking_short_id)
        if order_res.get('success'):
            booking_doc['razorpay_order_id'] = order_res.get('order_id')
        
        result = bookings_col.insert_one(booking_doc)

        return jsonify({
            'message': 'Booking confirmed successfully. Tell your 6-digit Check-In OTP to the salon upon arrival.',
            'booking': {
                'id': str(result.inserted_id),
                'bookingId': booking_short_id,
                'checkInOtp': check_in_otp,
                'staffName': staff_name,
                'price': service_final_price,
                'platformFee': platform_fee,
                'totalAmount': total_amount,
                'date': date_str,
                'timeSlot': time_slot,
                'qrCode': qr_base64
            }
        }), 201

    except Exception as e:
        logger.error(f"Error creating booking: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_customer_bookings():
    try:
        customer_id = g.current_user_id
        bookings = list(bookings_col.find({'customer_id': ObjectId(customer_id)}).sort('created_at', -1))
        
        results = []
        for b in bookings:
            barber = barbers_col.find_one({'_id': b['barber_id']}, {'shop_name': 1, 'profile_pic': 1, 'address': 1, 'lat': 1, 'lng': 1})
            hairstyle = hairstyles_col.find_one({'_id': b['hairstyle_id']}, {'name': 1, 'duration': 1})

            results.append({
                'id': str(b['_id']),
                'bookingId': b.get('booking_id'),
                'checkInOtp': b.get('check_in_otp'),
                'staffName': b.get('staff_name', 'Senior Stylist'),
                'date': b.get('date'),
                'timeSlot': b.get('time_slot'),
                'price': b.get('service_final_price', b.get('price')),
                'platformFee': b.get('platform_fee', 0.0),
                'totalAmount': b.get('total_amount', b.get('price')),
                'status': b.get('status'),
                'paymentStatus': b.get('payment_status'),
                'qrCode': b.get('qr_code'),
                'barber': {
                    'shopName': barber.get('shop_name') if barber else 'Unknown Barber',
                    'profilePic': barber.get('profile_pic') if barber else '',
                    'address': barber.get('address') if barber else '',
                    'googleMapsUrl': f"https://www.google.com/maps/search/?api=1&query={barber.get('lat', 18.5204)},{barber.get('lng', 73.8567)}" if barber else ''
                },
                'hairstyle': {
                    'name': hairstyle.get('name') if hairstyle else 'Service',
                    'duration': hairstyle.get('duration', 30) if hairstyle else 30
                }
            })

        return jsonify(results), 200

    except Exception as e:
        logger.error(f"Error fetching customer bookings: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_barber_bookings():
    try:
        barber_id = g.current_user_id
        date_filter = request.args.get('date')
        
        query = {'barber_id': ObjectId(barber_id)}
        if date_filter:
            query['date'] = date_filter

        bookings = list(bookings_col.find(query).sort([('date', -1), ('time_slot', 1)]))
        
        results = []
        for b in bookings:
            customer = users_col.find_one({'_id': b['customer_id']}, {'name': 1, 'phone': 1, 'email': 1})
            hairstyle = hairstyles_col.find_one({'_id': b['hairstyle_id']}, {'name': 1, 'duration': 1})

            results.append({
                'id': str(b['_id']),
                'bookingId': b.get('booking_id'),
                'checkInOtp': b.get('check_in_otp'),
                'staffName': b.get('staff_name', 'Senior Stylist'),
                'date': b.get('date'),
                'timeSlot': b.get('time_slot'),
                'price': b.get('service_final_price', b.get('price')),
                'platformFee': b.get('platform_fee', 0.0),
                'totalAmount': b.get('total_amount', b.get('price')),
                'status': b.get('status'),
                'paymentStatus': b.get('payment_status'),
                'customer': {
                    'name': customer.get('name') if customer else b.get('customer_name', 'Guest'),
                    'phone': customer.get('phone') if customer else '',
                    'email': customer.get('email') if customer else ''
                },
                'hairstyle': {
                    'name': hairstyle.get('name') if hairstyle else 'Service',
                    'duration': hairstyle.get('duration', 30) if hairstyle else 30
                }
            })

        return jsonify(results), 200

    except Exception as e:
        logger.error(f"Error fetching barber bookings: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def cancel_booking():
    try:
        user_id = g.current_user_id
        role = g.current_user_role
        data = request.json or {}
        booking_id = data.get('bookingId')

        if not booking_id:
            return jsonify({'message': 'Booking ID is required'}), 400

        if not ObjectId.is_valid(booking_id):
            return jsonify({'message': 'Invalid Booking ID format'}), 400

        booking = bookings_col.find_one({'_id': ObjectId(booking_id)})
        if not booking:
            return jsonify({'message': 'Booking record not found'}), 404

        if role == 'customer' and str(booking['customer_id']) != user_id:
            return jsonify({'message': 'Unauthorized to cancel this booking'}), 403
        elif role == 'barber' and str(booking['barber_id']) != user_id:
            return jsonify({'message': 'Unauthorized to cancel this booking'}), 403

        if booking['status'] == 'cancelled':
            return jsonify({'message': 'Booking is already cancelled'}), 400

        appointment_datetime = datetime.datetime.strptime(f"{booking['date']} {booking['time_slot']}", "%Y-%m-%d %H:%M")
        time_diff = appointment_datetime - datetime.datetime.utcnow()
        hours_before = time_diff.total_seconds() / 3600.0

        refund_processed = False
        payment_status = booking.get('payment_status')

        if payment_status == 'paid' and hours_before >= 24:
            payment = payments_col.find_one({'booking_id': ObjectId(booking_id), 'status': 'captured'})
            if payment and payment.get('razorpay_payment_id'):
                from app.utils.razorpay_utils import refund_razorpay_payment
                refund_ok = refund_razorpay_payment(
                    payment.get('razorpay_payment_id'), 
                    booking.get('total_amount', booking.get('price'))
                )
                if refund_ok:
                    refund_processed = True
                    payment_status = 'refunded'
                    payments_col.update_one({'_id': payment['_id']}, {'$set': {'status': 'refunded'}})

        bookings_col.update_one(
            {'_id': ObjectId(booking_id)},
            {'$set': {'status': 'cancelled', 'payment_status': payment_status}}
        )

        customer = users_col.find_one({'_id': booking['customer_id']})
        if customer:
            send_booking_cancellation(
                customer.get('email'), 
                customer.get('name'), 
                booking.get('booking_id'), 
                refund_processed
            )

        return jsonify({
            'message': 'Booking cancelled successfully',
            'refundProcessed': refund_processed,
            'paymentStatus': payment_status
        }), 200

    except Exception as e:
        logger.error(f"Error in cancel_booking: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
