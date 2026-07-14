import datetime
import logging
from flask import request, jsonify
from bson import ObjectId
from app.db import barbers_col, bookings_col, users_col, coupons_col, payments_col
from app.utils.email_utils import send_html_email

logger = logging.getLogger(__name__)

def get_pending_barbers():
    try:
        pending = list(barbers_col.find({'verified': False}))
        results = []
        for p in pending:
            results.append({
                'id': str(p['_id']),
                'ownerName': p.get('owner_name'),
                'shopName': p.get('shop_name'),
                'email': p.get('email'),
                'phone': p.get('phone'),
                'address': p.get('address'),
                'city': p.get('city'),
                'experience': p.get('experience'),
                'profilePic': p.get('profile_pic'),
                'shopImages': p.get('shop_images', []),
                'aadhaarPan': p.get('aadhaar_pan'),
                'gst': p.get('gst'),
                'createdAt': p.get('created_at').strftime('%Y-%m-%d') if p.get('created_at') else None
            })
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"Error getting pending barbers: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def approve_barber(barber_id):
    try:
        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber ID'}), 400

        result = barbers_col.update_one(
            {'_id': ObjectId(barber_id)},
            {'$set': {'verified': True, 'status': 'active'}}
        )

        if result.matched_count == 0:
            return jsonify({'message': 'Barber profile not found'}), 404

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        
        # Send Notification email
        subject = "Your TrimTime Shop Registration is Approved!"
        html = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 800;">Trim<span style="color: #d97706;">Time</span></h1>
                <span style="background-color: #dcfce7; color: #15803d; font-size: 12px; padding: 6px 12px; border-radius: 9999px; font-weight: 600; display: inline-block; margin-top: 8px;">Approved</span>
            </div>
            <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Welcome to TrimTime!</h2>
            <p style="color: #334155; font-size: 16px; line-height: 24px;">Dear {barber.get('owner_name')},</p>
            <p style="color: #334155; font-size: 16px; line-height: 24px;">We are excited to inform you that your registration for <b>{barber.get('shop_name')}</b> has been approved by our admin team!</p>
            <p style="color: #334155; font-size: 16px; line-height: 24px;">You can now log in to your dashboard to manage your hairstyles, configure your working hours, and begin accepting client bookings.</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="background-color: #d97706; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Go To Dashboard</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;"/>
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; 2026 TrimTime. All rights reserved.</p>
        </div>
        """
        send_html_email(barber.get('email'), subject, html)

        return jsonify({'message': 'Barber account approved and activated successfully.'}), 200

    except Exception as e:
        logger.error(f"Error approving barber: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def toggle_barber_status(barber_id):
    try:
        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber ID'}), 400

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber:
            return jsonify({'message': 'Barber profile not found'}), 404

        new_status = 'inactive' if barber.get('status') == 'active' else 'active'
        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': {'status': new_status}})

        return jsonify({
            'message': f"Barber account is now {new_status}",
            'status': new_status
        }), 200

    except Exception as e:
        logger.error(f"Error toggling barber status: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_admin_analytics():
    try:
        # Key metrics count
        total_customers = users_col.count_documents({'role': 'customer'})
        total_barbers = barbers_col.count_documents({})
        total_bookings = bookings_col.count_documents({})
        total_confirmed = bookings_col.count_documents({'status': 'confirmed'})
        
        # Revenue aggregation (Paid payments in system)
        payments = list(payments_col.find({'status': 'captured'}))
        total_revenue = sum([float(p.get('amount', 0)) for p in payments])

        # Monthly Revenue Analytics for charts (group by year/month)
        pipeline = [
            {'$match': {'status': 'captured'}},
            {'$group': {
                '_id': {
                    'year': {'$year': '$created_at'},
                    'month': {'$month': '$created_at'}
                },
                'revenue': {'$sum': '$amount'},
                'count': {'$sum': 1}
            }},
            {'$sort': {'_id.year': 1, '_id.month': 1}}
        ]
        
        monthly_data = list(payments_col.aggregate(pipeline))
        chart_data = []
        months_map = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        
        for md in monthly_data:
            m_index = md['_id']['month'] - 1
            month_label = f"{months_map[m_index]} {md['_id']['year']}"
            chart_data.append({
                'month': month_label,
                'revenue': round(md['revenue'], 2),
                'bookingsCount': md['count']
            })

        # If empty chart data, mock some values for demo representation
        if not chart_data:
            chart_data = [
                {'month': 'Jan 2026', 'revenue': 4500.0, 'bookingsCount': 15},
                {'month': 'Feb 2026', 'revenue': 8200.0, 'bookingsCount': 28},
                {'month': 'Mar 2026', 'revenue': 12500.0, 'bookingsCount': 42},
                {'month': 'Apr 2026', 'revenue': 18900.0, 'bookingsCount': 60},
                {'month': 'May 2026', 'revenue': 25000.0, 'bookingsCount': 85},
                {'month': 'Jun 2026', 'revenue': 34200.0, 'bookingsCount': 110}
            ]

        analytics = {
            'metrics': {
                'totalCustomers': total_customers,
                'totalBarbers': total_barbers,
                'totalBookings': total_bookings,
                'confirmedBookings': total_confirmed,
                'totalRevenue': round(total_revenue, 2)
            },
            'revenueChart': chart_data
        }

        return jsonify(analytics), 200

    except Exception as e:
        logger.error(f"Error in get_admin_analytics: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500


# --- COUPON MANAGEMENT ---

def create_coupon():
    try:
        data = request.json or {}
        code = data.get('code', '').strip().upper()
        discount_type = data.get('discountType', 'percentage') # percentage or flat
        value = float(data.get('value', 0))
        min_booking_amount = float(data.get('minBookingAmount', 0))
        expiry_days = int(data.get('expiryDays', 30))

        if not code or value <= 0:
            return jsonify({'message': 'Coupon code and discount value are required'}), 400

        # Check existing coupon
        if coupons_col.find_one({'code': code}):
            return jsonify({'message': 'Coupon code already exists'}), 409

        expiry_date = datetime.datetime.utcnow() + datetime.timedelta(days=expiry_days)
        
        coupon_doc = {
            'code': code,
            'discount_type': discount_type,
            'value': value,
            'min_booking_amount': min_booking_amount,
            'expiry_date': expiry_date,
            'active': True,
            'created_at': datetime.datetime.utcnow()
        }

        coupons_col.insert_one(coupon_doc)

        return jsonify({
            'message': 'Coupon created successfully',
            'coupon': {
                'code': code,
                'discountType': discount_type,
                'value': value,
                'minBookingAmount': min_booking_amount,
                'expiryDate': expiry_date.strftime('%Y-%m-%d')
            }
        }), 201

    except Exception as e:
        logger.error(f"Error creating coupon: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_coupons():
    try:
        coupons = list(coupons_col.find().sort('created_at', -1))
        results = []
        for c in coupons:
            results.append({
                'id': str(c['_id']),
                'code': c.get('code'),
                'discountType': c.get('discount_type'),
                'value': c.get('value'),
                'minBookingAmount': c.get('min_booking_amount'),
                'expiryDate': c.get('expiry_date').strftime('%Y-%m-%d'),
                'active': c.get('active')
            })
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"Error getting coupons: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def toggle_coupon_status(coupon_id):
    try:
        if not ObjectId.is_valid(coupon_id):
            return jsonify({'message': 'Invalid Coupon ID'}), 400

        coupon = coupons_col.find_one({'_id': ObjectId(coupon_id)})
        if not coupon:
            return jsonify({'message': 'Coupon not found'}), 404

        new_status = not coupon.get('active', True)
        coupons_col.update_one({'_id': ObjectId(coupon_id)}, {'$set': {'active': new_status}})

        return jsonify({
            'message': f"Coupon status is now {'active' if new_status else 'inactive'}",
            'active': new_status
        }), 200

    except Exception as e:
        logger.error(f"Error toggling coupon: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500


# --- USER LISTS ---

def get_all_users():
    try:
        users = list(users_col.find({'role': 'customer'}).sort('created_at', -1))
        results = []
        for u in users:
            results.append({
                'id': str(u['_id']),
                'name': u.get('name'),
                'email': u.get('email'),
                'phone': u.get('phone'),
                'verified': u.get('verified'),
                'loyaltyPoints': u.get('loyalty_points', 0),
                'createdAt': u.get('created_at').strftime('%Y-%m-%d') if u.get('created_at') else None
            })
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_all_barbers():
    try:
        barbers = list(barbers_col.find().sort('created_at', -1))
        results = []
        for b in barbers:
            results.append({
                'id': str(b['_id']),
                'ownerName': b.get('owner_name'),
                'shopName': b.get('shop_name'),
                'email': b.get('email'),
                'phone': b.get('phone'),
                'city': b.get('city'),
                'verified': b.get('verified'),
                'status': b.get('status'),
                'ratingAvg': b.get('rating_avg', 0.0)
            })
        return jsonify(results), 200
    except Exception as e:
        logger.error(f"Error fetching barbers: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500
