import datetime
import logging
import uuid
import random
import qrcode
import io
import base64
from flask import request, jsonify, g, current_app
from bson import ObjectId
from app.db import bookings_col, barbers_col, hairstyles_col, users_col, coupons_col, payments_col
from app.utils.email_utils import send_booking_confirmation, send_booking_cancellation
from app.utils.razorpay_utils import create_razorpay_order
from config import Config

logger = logging.getLogger(__name__)

BUFFER_TIME_MINS = 10
SLOT_INTERVAL_MINS = 60

def time_to_minutes(time_str):
    try:
        time_str = time_str.strip()
        if 'am' in time_str.lower() or 'pm' in time_str.lower():
            is_pm = 'pm' in time_str.lower()
            clean_str = time_str.lower().replace('am', '').replace('pm', '').strip()
            parts = clean_str.split(':')
            hours = int(parts[0])
            minutes = int(parts[1])
            if is_pm and hours < 12:
                hours += 12
            if not is_pm and hours == 12:
                hours = 0
            return hours * 60 + minutes
        else:
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

    # Check custom closed dates
    closed_dates = barber_doc.get('closed_dates', [])
    if date_str in closed_dates:
        return []

    # Check weekly holiday list
    weekly_holidays = barber_doc.get('weekly_holidays', [])
    if not weekly_holidays and barber_doc.get('weekly_holiday') is not None:
        weekly_holidays = [barber_doc.get('weekly_holiday')]
    if target_date.weekday() in weekly_holidays:
        return []

    weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    current_weekday_name = weekday_names[target_date.weekday()]

    # Get all active bookings for this date and barber
    query = {
        'barber_id': barber_doc['_id'],
        'date': date_str,
        'status': {'$in': ['confirmed', 'pending', 'completed']}
    }
    all_bookings = list(bookings_col.find(query))

    # Helper to calculate booked intervals
    def get_booked_intervals_for_bookings(bookings):
        intervals = []
        for b in bookings:
            start_m = time_to_minutes(b['time_slot'])
            services_list = b.get('services', [])
            if services_list:
                duration = sum([int(s.get('duration', 30)) for s in services_list])
            else:
                duration = 30
                hs = hairstyles_col.find_one({'_id': b.get('hairstyle_id')})
                if hs:
                    duration = hs.get('duration', 30)
            end_m = start_m + duration + BUFFER_TIME_MINS
            intervals.append((start_m, end_m))
        return intervals

    current_time = datetime.datetime.utcnow() + datetime.timedelta(hours=5, minutes=30)
    is_today = target_date == current_time.date()
    current_mins_today = current_time.hour * 60 + current_time.minute + 15

    available_slots = []

    # Resolve active staff
    staff_list = barber_doc.get('staff', [])
    active_staff = [s for s in staff_list if s.get('status', 'ACTIVE') == 'ACTIVE']

    if staff_id and active_staff:
        # 1) Specific stylist is selected
        staff_member = next((s for s in active_staff if str(s.get('id')) == str(staff_id) or s.get('name') == staff_id), None)
        if not staff_member:
            return []
        
        # Check staff holiday
        if staff_member.get('holiday') and staff_member.get('holiday').strip().lower() == current_weekday_name.lower():
            return []

        # Get bookings for this stylist
        stylist_bookings = [b for b in all_bookings if str(b.get('staff_id')) == str(staff_member.get('id')) or b.get('staff_name') == staff_member.get('name')]
        booked_intervals = get_booked_intervals_for_bookings(stylist_bookings)

        # Get shifts for this stylist
        shifts = staff_member.get('shifts', [])
        if not shifts:
            shifts = [{'start': staff_member.get('shift', '09:00 AM - 08:00 PM').split('-')[0].strip(), 'end': staff_member.get('shift', '09:00 AM - 08:00 PM').split('-')[1].strip()}] if '-' in staff_member.get('shift', '') else []
        if not shifts:
            shifts = [{'start': '09:00', 'end': '20:00'}]

        for sh in shifts:
            open_mins = time_to_minutes(sh.get('start', '09:00'))
            close_mins = time_to_minutes(sh.get('end', '20:00'))

            for slot_start in range(open_mins, close_mins, SLOT_INTERVAL_MINS):
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

                available_slots.append({
                    'time': slot_time_str,
                    'displayTime': display_time,
                    'available': not collides
                })

    else:
        # 2) "Any Stylist" (or no stylist specified)
        if not active_staff:
            # Fallback if no staff list exists at all (owner is the only stylist)
            booked_intervals = get_booked_intervals_for_bookings(all_bookings)
            shifts = barber_doc.get('shifts', [])
            if not shifts:
                shifts = [{'start': barber_doc.get('opening_time', '09:00'), 'end': barber_doc.get('closing_time', '20:00')}]

            for sh in shifts:
                open_mins = time_to_minutes(sh.get('start', '09:00'))
                close_mins = time_to_minutes(sh.get('end', '20:00'))

                for slot_start in range(open_mins, close_mins, SLOT_INTERVAL_MINS):
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

                    available_slots.append({
                        'time': slot_time_str,
                        'displayTime': display_time,
                        'available': not collides
                    })
        else:
            # Multi-stylist salon check:
            # We determine availability of a slot if at least one stylist has a shift covering it and is free!
            # Generate the union of all active stylists shifts to determine possible slot starting times
            all_possible_starts = set()
            stylist_schedules = []

            for stylist in active_staff:
                # Skip holiday
                if stylist.get('holiday') and stylist.get('holiday').strip().lower() == current_weekday_name.lower():
                    continue

                # Get shifts
                st_shifts = stylist.get('shifts', [])
                if not st_shifts:
                    st_shifts = [{'start': stylist.get('shift', '09:00 AM - 08:00 PM').split('-')[0].strip(), 'end': stylist.get('shift', '09:00 AM - 08:00 PM').split('-')[1].strip()}] if '-' in stylist.get('shift', '') else []
                if not st_shifts:
                    st_shifts = [{'start': '09:00', 'end': '20:00'}]

                # Get bookings for this stylist
                st_bookings = [b for b in all_bookings if str(b.get('staff_id')) == str(stylist.get('id')) or b.get('staff_name') == stylist.get('name')]
                st_booked_intervals = get_booked_intervals_for_bookings(st_bookings)

                stylist_schedules.append({
                    'stylist': stylist,
                    'shifts': st_shifts,
                    'booked_intervals': st_booked_intervals
                })

                for sh in st_shifts:
                    open_mins = time_to_minutes(sh.get('start', '09:00'))
                    close_mins = time_to_minutes(sh.get('end', '20:00'))
                    for start in range(open_mins, close_mins, SLOT_INTERVAL_MINS):
                        if is_today and start < current_mins_today:
                            continue
                        all_possible_starts.add(start)

            # Check availability for each slot starting time
            for start in sorted(all_possible_starts):
                is_available = False
                
                # Check if at least one stylist is free for this slot
                for sched in stylist_schedules:
                    # Check if stylist shifts cover this slot
                    covers = False
                    for sh in sched['shifts']:
                        sh_start = time_to_minutes(sh.get('start', '09:00'))
                        sh_end = time_to_minutes(sh.get('end', '20:00'))
                        if start >= sh_start and (start + duration_mins) <= sh_end:
                            covers = True
                            break

                    if not covers:
                        continue

                    # Check collision
                    collides = False
                    new_interval_start = start
                    new_interval_end = start + duration_mins + BUFFER_TIME_MINS

                    for booked_start, booked_end in sched['booked_intervals']:
                        if (new_interval_start < booked_end) and (new_interval_end > booked_start):
                            collides = True
                            break

                    if not collides:
                        is_available = True
                        break

                slot_time_str = minutes_to_time(start)
                time_obj = datetime.datetime.strptime(slot_time_str, "%H:%M")
                display_time = time_obj.strftime("%I:%M %p")

                available_slots.append({
                    'time': slot_time_str,
                    'displayTime': display_time,
                    'available': is_available
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

        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber ID format'}), 400

        # Support multiple comma-separated hairstyle IDs
        hairstyle_ids = [i.strip() for i in hairstyle_id.split(',') if i.strip()]
        for h_id in hairstyle_ids:
            if not ObjectId.is_valid(h_id):
                return jsonify({'message': 'Invalid hairstyle ID format'}), 400

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber:
            return jsonify({'message': 'Barber shop not found'}), 404

        # Retrieve all hairstyles and calculate total duration
        hairstyles = list(hairstyles_col.find({'_id': {'$in': [ObjectId(h_id) for h_id in hairstyle_ids]}}))
        if not hairstyles:
            return jsonify({'message': 'No hairstyle services found'}), 404

        total_duration = sum([h.get('duration', 30) for h in hairstyles])

        slots = generate_slots_for_barber(barber, date_str, total_duration, staff_id)
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

def calculate_booking_loyalty_points(booking):
    service_ids = []
    if 'services' in booking:
        service_ids = [ObjectId(s['id']) for s in booking['services'] if ObjectId.is_valid(s.get('id', ''))]
    elif 'hairstyle_id' in booking:
        service_ids = [ObjectId(booking['hairstyle_id'])]

    points = 0
    if service_ids:
        from app.db import hairstyles_col
        hairstyles = list(hairstyles_col.find({'_id': {'$in': service_ids}}))
        hs_map = {str(h['_id']): h for h in hairstyles}
        
        for s_id in service_ids:
            h = hs_map.get(str(s_id))
            if h and h.get('loyalty_points') is not None:
                points += int(h.get('loyalty_points'))
            else:
                price = 0
                if h:
                    price = float(h.get('price', 0))
                elif 'services' in booking:
                    s_dict = next((s for s in booking['services'] if s.get('id') == str(s_id)), None)
                    if s_dict:
                        price = float(s_dict.get('price', 0))
                points += int(price * 0.1)
    else:
        price = booking.get('service_final_price', booking.get('price', 0))
        points = int(price * 0.1)

    return max(0, points)

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

        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber parameters format'}), 400

        # Support multiple comma-separated hairstyle IDs
        hairstyle_ids = [i.strip() for i in hairstyle_id.split(',') if i.strip()]
        for h_id in hairstyle_ids:
            if not ObjectId.is_valid(h_id):
                return jsonify({'message': 'Invalid service parameters format'}), 400

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber or not barber.get('verified', False) or barber.get('status') != 'active':
            return jsonify({'message': 'Barber shop is currently unavailable'}), 404

        # Retrieve all hairstyles
        hairstyles = list(hairstyles_col.find({'_id': {'$in': [ObjectId(h_id) for h_id in hairstyle_ids]}}))
        if not hairstyles:
            return jsonify({'message': 'Selected services not found'}), 404

        total_duration = sum([h.get('duration', 30) for h in hairstyles])
        original_price = sum([float(h.get('price', 0)) for h in hairstyles])
        service_names = ", ".join([h.get('name') for h in hairstyles])

        # Validate Slot Availability using total duration of all selected services
        available_slots = generate_slots_for_barber(barber, date_str, total_duration, staff_id)
        slot_is_free = any(slot['time'] == time_slot and slot.get('available', True) for slot in available_slots)
        if not slot_is_free:
            return jsonify({'message': 'The requested time slot is no longer available'}), 409

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

        # (e) Calculate 10% - 15% Platform Convenience Charge (deducted from total service price)
        platform_fee_rate = barber.get('platform_fee_percent', 10.0) # 10% default
        platform_fee = round(service_final_price * (platform_fee_rate / 100.0), 2)
        net_amount = round(service_final_price - platform_fee, 2)
        total_amount = round(service_final_price, 2)

        # (f) Generate 6-digit Check-In OTP for in-person salon arrival validation
        check_in_otp = str(random.randint(100000, 999999))
        booking_short_id = f"TT-{str(uuid.uuid4().int)[:6]}"
        
        qr_data = f"TrimTime Booking:{booking_short_id}|OTP:{check_in_otp}|Barber:{barber.get('shop_name')}|Services:{service_names}"
        qr_base64 = generate_qr_code_base64(qr_data)

        # Check if Razorpay is configured (disable live payment in unit tests)
        import sys
        is_live_payment = Config.is_razorpay_configured() and 'unittest' not in sys.modules

        booking_doc = {
            'booking_id': booking_short_id,
            'check_in_otp': check_in_otp,
            'customer_id': ObjectId(customer_id),
            'customer_name': customer_name,
            'customer_email': customer_email,
            'barber_id': ObjectId(barber_id),
            'hairstyle_id': ObjectId(hairstyle_ids[0]), # first service for backward compatibility
            'services': [
                {
                    'id': str(h['_id']),
                    'name': h.get('name'),
                    'price': float(h.get('price', 0)),
                    'duration': h.get('duration', 30)
                } for h in hairstyles
            ],
            'staff_id': staff_id,
            'staff_name': staff_name,
            'date': date_str,
            'time_slot': time_slot,
            'price': original_price,
            'discount': discount,
            'service_final_price': service_final_price,
            'coupon_code': coupon_code,
            'platform_fee_percent': platform_fee_rate,
            'platform_fee': platform_fee,
            'net_amount': net_amount,
            'total_amount': total_amount,
            'status': 'pending' if is_live_payment else 'confirmed',
            'payment_status': 'unpaid' if is_live_payment else 'paid',
            'qr_code': qr_base64,
            'created_at': datetime.datetime.utcnow()
        }

        razorpay_order_id = None
        if is_live_payment:
            order_res = create_razorpay_order(total_amount, booking_short_id)
            if order_res.get('success'):
                razorpay_order_id = order_res.get('order_id')
                booking_doc['razorpay_order_id'] = razorpay_order_id

        result = bookings_col.insert_one(booking_doc)

        if not is_live_payment:
            # Create a payment log inside payments_col so that refunds/history work properly
            payment_doc = {
                'booking_id': result.inserted_id,
                'razorpay_order_id': f"order_mock_{str(uuid.uuid4().int)[:10]}",
                'razorpay_payment_id': f"pay_mock_{str(uuid.uuid4().int)[:10]}",
                'razorpay_signature': 'simulated_payment_on_booking_creation',
                'amount': total_amount,
                'status': 'captured',
                'method': data.get('paymentMethod', 'online'),
                'created_at': datetime.datetime.utcnow()
            }
            payment_insert = payments_col.insert_one(payment_doc)

            # Link payment log to booking
            bookings_col.update_one(
                {'_id': result.inserted_id},
                {'$set': {'payment_id': payment_insert.inserted_id}}
            )

            # Deactivate used coupon
            if coupon_code:
                coupons_col.update_one({'code': coupon_code}, {'$set': {'active': False}})

            # Award loyalty points
            points_earned = calculate_booking_loyalty_points(booking_doc)
            users_col.update_one(
                {'_id': ObjectId(customer_id)},
                {'$inc': {'loyalty_points': points_earned}}
            )

            # Send booking confirmation email
            try:
                booking_details = {
                    'booking_id': booking_short_id,
                    'shop_name': barber.get('shop_name', 'TrimTime'),
                    'hairstyle_name': service_names,
                    'date': date_str,
                    'time': time_slot,
                    'duration': total_duration,
                    'price': service_final_price
                }
                send_booking_confirmation(customer_email, customer_name, booking_details)
            except Exception as mail_err:
                logger.error(f"Failed to send booking confirmation email: {mail_err}")

        return jsonify({
            'message': 'Booking initialized' if is_live_payment else 'Booking confirmed successfully. Tell your 6-digit Check-In OTP to the salon upon arrival.',
            'isLivePayment': is_live_payment,
            'razorpayKeyId': Config.RAZORPAY_KEY_ID if is_live_payment else None,
            'razorpayOrderId': razorpay_order_id,
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
            
            services_list = b.get('services', [])
            if services_list:
                hairstyle_name = ", ".join([s.get('name', 'Service') for s in services_list])
                hairstyle_duration = sum([int(s.get('duration', 30)) for s in services_list])
            else:
                hairstyle = hairstyles_col.find_one({'_id': b['hairstyle_id']}, {'name': 1, 'duration': 1})
                hairstyle_name = hairstyle.get('name') if hairstyle else 'Service'
                hairstyle_duration = hairstyle.get('duration', 30) if hairstyle else 30

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
                    'name': hairstyle_name,
                    'duration': hairstyle_duration
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
            
            services_list = b.get('services', [])
            if services_list:
                hairstyle_name = ", ".join([s.get('name', 'Service') for s in services_list])
                hairstyle_duration = sum([int(s.get('duration', 30)) for s in services_list])
            else:
                hairstyle = hairstyles_col.find_one({'_id': b['hairstyle_id']}, {'name': 1, 'duration': 1})
                hairstyle_name = hairstyle.get('name') if hairstyle else 'Service'
                hairstyle_duration = hairstyle.get('duration', 30) if hairstyle else 30

            results.append({
                'id': str(b['_id']),
                'bookingId': b.get('booking_id'),
                'checkInOtp': b.get('check_in_otp'),
                'staffName': b.get('staff_name', 'Senior Stylist'),
                'date': b.get('date'),
                'timeSlot': b.get('time_slot'),
                'price': b.get('service_final_price', b.get('price')),
                'platformFee': b.get('platform_fee', 0.0),
                'netAmount': b.get('net_amount', round(b.get('service_final_price', b.get('price', 0)) * 0.9, 2)),
                'totalAmount': b.get('total_amount', b.get('price')),
                'status': b.get('status'),
                'paymentStatus': b.get('payment_status'),
                'customer': {
                    'name': customer.get('name') if customer else b.get('customer_name', 'Guest'),
                    'phone': customer.get('phone') if customer else '',
                    'email': customer.get('email') if customer else ''
                },
                'hairstyle': {
                    'name': hairstyle_name,
                    'duration': hairstyle_duration
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

def apply_coupon():
    try:
        data = request.json or {}
        coupon_code = data.get('couponCode', '').strip().upper()
        booking_amount = float(data.get('bookingAmount', 0))

        if not coupon_code:
            return jsonify({'message': 'Coupon code is required'}), 400

        coupon = coupons_col.find_one({'code': coupon_code, 'active': True})
        if not coupon:
            return jsonify({'message': 'Invalid or inactive coupon code'}), 404

        if coupon.get('expiry_date') and coupon.get('expiry_date') < datetime.datetime.utcnow():
            return jsonify({'message': 'Coupon code has expired'}), 400

        min_amount = float(coupon.get('min_booking_amount', 0))
        if booking_amount < min_amount:
            return jsonify({'message': f'Minimum booking amount to use this coupon is ₹{min_amount}'}), 400

        return jsonify({
            'message': 'Coupon applied successfully',
            'coupon': {
                'code': coupon.get('code'),
                'discount_type': coupon.get('discount_type'),
                'value': float(coupon.get('value', 0)),
                'min_booking_amount': min_amount
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in apply_coupon: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def redeem_loyalty_points():
    try:
        customer_id = g.current_user_id
        customer = users_col.find_one({'_id': ObjectId(customer_id)})
        if not customer:
            return jsonify({'message': 'Customer profile not found'}), 404

        data = request.json or {}
        tier = data.get('tier', 'silver').lower().strip()

        if tier == 'bronze':
            points_cost = 50
            discount_value = 10.0
            min_booking = 300.0
            prefix = "LOYAL10"
        elif tier == 'gold':
            points_cost = 150
            discount_value = 30.0
            min_booking = 800.0
            prefix = "LOYAL30"
        else: # silver
            points_cost = 100
            discount_value = 20.0
            min_booking = 500.0
            prefix = "LOYAL20"

        points = int(customer.get('loyalty_points', 0))
        if points < points_cost:
            return jsonify({'message': f'Insufficient loyalty points. {points_cost} points required for this reward.'}), 400

        # Deduct points from user profile
        users_col.update_one({'_id': ObjectId(customer_id)}, {'$inc': {'loyalty_points': -points_cost}})

        # Create unique discount coupon
        code = f"{prefix}-{str(uuid.uuid4().int)[:6]}"
        coupon_doc = {
            'code': code,
            'discount_type': 'percentage',
            'value': discount_value,
            'min_booking_amount': min_booking,
            'expiry_date': datetime.datetime.utcnow() + datetime.timedelta(days=30),
            'active': True,
            'created_at': datetime.datetime.utcnow()
        }
        coupons_col.insert_one(coupon_doc)

        return jsonify({
            'message': f'Points redeemed successfully! Here is your {int(discount_value)}% discount coupon code.',
            'couponCode': code,
            'pointsRemaining': points - points_cost
        }), 200

    except Exception as e:
        logger.error(f"Error in redeem_loyalty_points: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
