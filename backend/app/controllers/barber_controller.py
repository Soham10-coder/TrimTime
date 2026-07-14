import datetime
import logging
from flask import request, jsonify, g
from bson import ObjectId
from app.db import barbers_col, hairstyles_col, reviews_col
from app.controllers.auth_controller import hash_password
from app.utils.cloudinary_utils import upload_image

logger = logging.getLogger(__name__)

def register_barber():
    try:
        # Form Data parsing for multipart uploads
        data = request.form
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        owner_name = data.get('ownerName', '').strip()
        shop_name = data.get('shopName', '').strip()
        phone = data.get('phone', '').strip()
        address = data.get('address', '').strip()
        city = data.get('city', '').strip()
        opening_time = data.get('openingTime', '09:00').strip() # e.g. "09:00"
        closing_time = data.get('closingTime', '20:00').strip() # e.g. "20:00"
        
        # Weekly Holiday (0-6 representing Monday-Sunday, or "None")
        weekly_holiday = data.get('weeklyHoliday', '')
        try:
            weekly_holiday = int(weekly_holiday) if weekly_holiday.isdigit() else None
        except:
            weekly_holiday = None
            
        experience = int(data.get('experience', 0))
        description = data.get('description', '').strip()
        gst = data.get('gst', '').strip()

        if not email or not password or not owner_name or not shop_name:
            return jsonify({'message': 'Required fields are missing: Owner Name, Shop Name, Email, Password'}), 400

        # Check duplicate
        if barbers_col.find_one({'email': email}):
            return jsonify({'message': 'Email is already registered as a Barber'}), 409

        # Handle file uploads
        profile_pic_file = request.files.get('profilePic')
        aadhaar_pan_file = request.files.get('aadhaarPan')
        shop_images_files = request.files.getlist('shopImages')

        # Upload images
        profile_pic_url = ""
        if profile_pic_file:
            # Map request url for local fallback paths
            raw_url = upload_image(profile_pic_file, 'profile_pics')
            profile_pic_url = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url

        aadhaar_pan_url = ""
        if aadhaar_pan_file:
            raw_url = upload_image(aadhaar_pan_file, 'documents')
            aadhaar_pan_url = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url

        shop_images = []
        for file in shop_images_files:
            if file and file.filename != '':
                raw_url = upload_image(file, 'shop_images')
                full_url = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url
                shop_images.append(full_url)

        hashed_pass = hash_password(password)
        barber_doc = {
            'owner_name': owner_name,
            'shop_name': shop_name,
            'email': email,
            'phone': phone,
            'password': hashed_pass,
            'role': 'barber',
            'address': address,
            'city': city,
            'opening_time': opening_time,
            'closing_time': closing_time,
            'weekly_holiday': weekly_holiday,
            'experience': experience,
            'description': description,
            'shop_images': shop_images,
            'profile_pic': profile_pic_url,
            'aadhaar_pan': aadhaar_pan_url,
            'gst': gst,
            'verified': False, # Pending admin verification
            'status': 'active',
            'rating_avg': 0.0,
            'rating_count': 0,
            'holiday_mode': False,
            'created_at': datetime.datetime.utcnow()
        }

        barbers_col.insert_one(barber_doc)

        return jsonify({
            'message': 'Barber registration submitted successfully. Admin review is required before activation.',
            'email': email
        }), 201

    except Exception as e:
        logger.error(f"Error in register_barber: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_barbers():
    try:
        # Query parameters
        city = request.args.get('city', '').strip()
        search = request.args.get('search', '').strip() # For shop name
        category = request.args.get('category', '').strip() # Hairstyle category filter
        min_rating = request.args.get('minRating')
        max_price = request.args.get('maxPrice')
        
        # Build query
        # Only active and admin-verified barbers
        query = {'verified': True, 'status': 'active'}
        
        if city:
            query['city'] = {'$regex': f"^{city}$", '$options': 'i'}
            
        if search:
            query['shop_name'] = {'$regex': search, '$options': 'i'}
            
        if min_rating:
            try:
                query['rating_avg'] = {'$gte': float(min_rating)}
            except ValueError:
                pass

        # Filter by service category or max price
        # Needs to join/check hairstyles collection
        matching_barber_ids = []
        has_hairstyle_filter = False
        hs_query = {}
        
        if category:
            hs_query['category'] = {'$regex': category, '$options': 'i'}
            has_hairstyle_filter = True
            
        if max_price:
            try:
                hs_query['price'] = {'$lte': float(max_price)}
                has_hairstyle_filter = True
            except ValueError:
                pass
                
        if has_hairstyle_filter:
            hairstyles = hairstyles_col.find(hs_query, {'barber_id': 1})
            matching_barber_ids = list(set([hs['barber_id'] for hs in hairstyles]))
            # If no hairstyles match the category/price, return empty list early
            if not matching_barber_ids:
                return jsonify([]), 200
            query['_id'] = {'$in': matching_barber_ids}

        # Query databases
        barbers = list(barbers_col.find(query))
        
        # Format results
        results = []
        for b in barbers:
            results.append({
                'id': str(b['_id']),
                'shopName': b.get('shop_name'),
                'ownerName': b.get('owner_name'),
                'city': b.get('city'),
                'address': b.get('address'),
                'profilePic': b.get('profile_pic'),
                'shopImages': b.get('shop_images', []),
                'experience': b.get('experience'),
                'description': b.get('description'),
                'ratingAvg': b.get('rating_avg', 0.0),
                'ratingCount': b.get('rating_count', 0),
                'openingTime': b.get('opening_time'),
                'closingTime': b.get('closing_time'),
                'weeklyHoliday': b.get('weekly_holiday'),
                'holidayMode': b.get('holiday_mode', False)
            })

        return jsonify(results), 200

    except Exception as e:
        logger.error(f"Error in get_barbers: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_barber_profile(barber_id):
    try:
        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber ID'}), 400

        barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        if not barber:
            return jsonify({'message': 'Barber not found'}), 404

        # Fetch reviews
        reviews = list(reviews_col.find({'barber_id': ObjectId(barber_id)}).sort('created_at', -1).limit(10))
        formatted_reviews = []
        for r in reviews:
            formatted_reviews.append({
                'id': str(r['_id']),
                'customerName': r.get('customer_name'),
                'rating': r.get('rating'),
                'comment': r.get('comment'),
                'date': r.get('created_at').strftime('%Y-%m-%d')
            })

        profile = {
            'id': str(barber['_id']),
            'shopName': barber.get('shop_name'),
            'ownerName': barber.get('owner_name'),
            'email': barber.get('email'),
            'phone': barber.get('phone'),
            'address': barber.get('address'),
            'city': barber.get('city'),
            'openingTime': barber.get('opening_time'),
            'closingTime': barber.get('closing_time'),
            'weeklyHoliday': barber.get('weekly_holiday'),
            'experience': barber.get('experience'),
            'description': barber.get('description'),
            'profilePic': barber.get('profile_pic'),
            'shopImages': barber.get('shop_images', []),
            'ratingAvg': barber.get('rating_avg', 0.0),
            'ratingCount': barber.get('rating_count', 0),
            'holidayMode': barber.get('holiday_mode', False),
            'reviews': formatted_reviews
        }

        return jsonify(profile), 200

    except Exception as e:
        logger.error(f"Error in get_barber_profile: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def update_barber_profile():
    try:
        barber_id = g.current_user_id
        data = request.form if request.form else request.json or {}

        # Fields that can be modified directly
        update_fields = {}
        if 'shopName' in data: update_fields['shop_name'] = data.get('shopName').strip()
        if 'phone' in data: update_fields['phone'] = data.get('phone').strip()
        if 'address' in data: update_fields['address'] = data.get('address').strip()
        if 'city' in data: update_fields['city'] = data.get('city').strip()
        if 'openingTime' in data: update_fields['opening_time'] = data.get('openingTime').strip()
        if 'closingTime' in data: update_fields['closing_time'] = data.get('closingTime').strip()
        if 'weeklyHoliday' in data:
            val = data.get('weeklyHoliday')
            update_fields['weekly_holiday'] = int(val) if str(val).isdigit() else None
        if 'experience' in data:
            update_fields['experience'] = int(data.get('experience', 0))
        if 'description' in data: update_fields['description'] = data.get('description').strip()
        if 'holidayMode' in data:
            val = data.get('holidayMode')
            update_fields['holiday_mode'] = val in (True, 'true', '1')

        # Handle updates to profile image
        if 'profilePic' in request.files:
            file = request.files['profilePic']
            if file and file.filename != '':
                raw_url = upload_image(file, 'profile_pics')
                update_fields['profile_pic'] = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url

        if not update_fields:
            return jsonify({'message': 'No changes submitted'}), 400

        barbers_col.update_one({'_id': ObjectId(barber_id)}, {'$set': update_fields})
        
        updated_barber = barbers_col.find_one({'_id': ObjectId(barber_id)})
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': barber_id,
                'name': updated_barber.get('owner_name'),
                'email': updated_barber.get('email'),
                'role': 'barber',
                'shopName': updated_barber.get('shop_name'),
                'profilePic': updated_barber.get('profile_pic')
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in update_barber_profile: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500


# --- HAIRSTYLE MANAGEMENT ---

def add_hairstyle():
    try:
        barber_id = g.current_user_id
        data = request.form
        name = data.get('name', '').strip()
        category = data.get('category', 'Fade Cut').strip() # Categories: Fade Cut, Buzz Cut, Beard, etc.
        description = data.get('description', '').strip()
        price = float(data.get('price', 0))
        duration = int(data.get('duration', 30)) # in minutes

        if not name or price <= 0:
            return jsonify({'message': 'Name and price must be specified'}), 400

        image_file = request.files.get('image')
        image_url = ""
        if image_file:
            raw_url = upload_image(image_file, 'hairstyles')
            image_url = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url

        hairstyle_doc = {
            'barber_id': ObjectId(barber_id),
            'name': name,
            'category': category,
            'description': description,
            'price': price,
            'duration': duration,
            'image_url': image_url,
            'created_at': datetime.datetime.utcnow()
        }

        result = hairstyles_col.insert_one(hairstyle_doc)

        return jsonify({
            'message': 'Hairstyle added successfully',
            'hairstyle': {
                'id': str(result.inserted_id),
                'name': name,
                'category': category,
                'description': description,
                'price': price,
                'duration': duration,
                'imageUrl': image_url
            }
        }), 201

    except Exception as e:
        logger.error(f"Error adding hairstyle: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def get_barber_hairstyles(barber_id):
    try:
        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber ID'}), 400

        hairstyles = list(hairstyles_col.find({'barber_id': ObjectId(barber_id)}))
        results = []
        for hs in hairstyles:
            results.append({
                'id': str(hs['_id']),
                'name': hs.get('name'),
                'category': hs.get('category'),
                'description': hs.get('description'),
                'price': hs.get('price'),
                'duration': hs.get('duration'),
                'imageUrl': hs.get('image_url')
            })

        return jsonify(results), 200

    except Exception as e:
        logger.error(f"Error fetching hairstyles: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def update_hairstyle(hairstyle_id):
    try:
        barber_id = g.current_user_id
        if not ObjectId.is_valid(hairstyle_id):
            return jsonify({'message': 'Invalid hairstyle ID'}), 400

        # Check ownership
        hairstyle = hairstyles_col.find_one({'_id': ObjectId(hairstyle_id), 'barber_id': ObjectId(barber_id)})
        if not hairstyle:
            return jsonify({'message': 'Hairstyle not found or unauthorized'}), 404

        data = request.form if request.form else request.json or {}
        update_fields = {}
        
        if 'name' in data: update_fields['name'] = data.get('name').strip()
        if 'category' in data: update_fields['category'] = data.get('category').strip()
        if 'description' in data: update_fields['description'] = data.get('description').strip()
        if 'price' in data: update_fields['price'] = float(data.get('price'))
        if 'duration' in data: update_fields['duration'] = int(data.get('duration'))

        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and image_file.filename != '':
                raw_url = upload_image(image_file, 'hairstyles')
                update_fields['image_url'] = f"{request.host_url.rstrip('/')}{raw_url}" if raw_url.startswith('/') else raw_url

        if not update_fields:
            return jsonify({'message': 'No modifications received'}), 400

        hairstyles_col.update_one({'_id': ObjectId(hairstyle_id)}, {'$set': update_fields})
        return jsonify({'message': 'Hairstyle service updated successfully'}), 200

    except Exception as e:
        logger.error(f"Error updating hairstyle: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def delete_hairstyle(hairstyle_id):
    try:
        barber_id = g.current_user_id
        if not ObjectId.is_valid(hairstyle_id):
            return jsonify({'message': 'Invalid hairstyle ID'}), 400

        result = hairstyles_col.delete_one({'_id': ObjectId(hairstyle_id), 'barber_id': ObjectId(barber_id)})
        if result.deleted_count == 0:
            return jsonify({'message': 'Hairstyle service not found or unauthorized'}), 404

        return jsonify({'message': 'Hairstyle service deleted successfully'}), 200

    except Exception as e:
        logger.error(f"Error deleting hairstyle: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

def rate_barber():
    try:
        customer_id = g.current_user_id
        customer_name = g.current_user['name']
        data = request.json or {}
        
        barber_id = data.get('barberId')
        rating = data.get('rating')
        comment = data.get('comment', '').strip()

        if not barber_id or not rating:
            return jsonify({'message': 'Barber ID and rating are required'}), 400

        if not ObjectId.is_valid(barber_id):
            return jsonify({'message': 'Invalid barber ID format'}), 400

        try:
            rating_value = int(rating)
            if rating_value < 1 or rating_value > 5:
                return jsonify({'message': 'Rating must be between 1 and 5'}), 400
        except ValueError:
            return jsonify({'message': 'Invalid rating score'}), 400

        # Check if booking exists and is completed/confirmed for this customer at this barber
        # This prevents review spamming
        booking_exists = bookings_col.find_one({
            'customer_id': ObjectId(customer_id),
            'barber_id': ObjectId(barber_id),
            'status': {'$in': ['confirmed', 'completed']}
        })
        if not booking_exists:
            return jsonify({'message': 'You must book and attend an appointment before rating this barber'}), 403

        # Check if already reviewed
        existing_review = reviews_col.find_one({
            'customer_id': ObjectId(customer_id),
            'barber_id': ObjectId(barber_id)
        })
        
        review_doc = {
            'barber_id': ObjectId(barber_id),
            'customer_id': ObjectId(customer_id),
            'customer_name': customer_name,
            'rating': rating_value,
            'comment': comment,
            'created_at': datetime.datetime.utcnow()
        }

        if existing_review:
            reviews_col.update_one({'_id': existing_review['_id']}, {'$set': review_doc})
        else:
            reviews_col.insert_one(review_doc)

        # Update average rating of barber
        all_reviews = list(reviews_col.find({'barber_id': ObjectId(barber_id)}))
        count = len(all_reviews)
        avg = sum([r['rating'] for r in all_reviews]) / count if count > 0 else 0.0

        barbers_col.update_one(
            {'_id': ObjectId(barber_id)},
            {
                '$set': {
                    'rating_avg': round(avg, 1),
                    'rating_count': count
                }
            }
        )

        return jsonify({
            'message': 'Review submitted successfully',
            'ratingAvg': round(avg, 1),
            'ratingCount': count
        }), 200

    except Exception as e:
        logger.error(f"Error rating barber: {e}")
        return jsonify({'message': 'Internal Server Error'}), 500

