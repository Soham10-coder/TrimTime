import datetime
from bson import ObjectId
from app import create_app
from app.db import barbers_col, hairstyles_col, users_col
from app.controllers.auth_controller import hash_password

app = create_app()
with app.app_context():
    print("Seeding premium demo salons...")

    # 1. Update/Ensure SB Salon has full details
    sb_id = ObjectId('6a683936c6fcf2a651cf960d')
    barbers_col.update_one(
        {'_id': sb_id},
        {
            '$set': {
                'shop_name': 'SB Salon & Spa',
                'owner_name': 'Swayam Patil',
                'email': 'sohambagade1001@gmail.com',
                'phone': '9876543210',
                'address': 'near CPR Hospital, Station Road',
                'city': 'Kolhapur',
                'lat': 16.7050,
                'lng': 74.2433,
                'openingTime': '09:00',
                'closingTime': '21:00',
                'salon_type': "Unisex Salon",
                'status': 'active',
                'verified': True,
                'verification_status': 'APPROVED',
                'rating_avg': 4.9,
                'rating_count': 24,
                'experience': 7,
                'profilePic': 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600&auto=format&fit=crop',
                'shopImages': [
                    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop'
                ],
                'staff': [
                    {
                        'id': 'st_sb_1',
                        'name': 'Sunil Kamble',
                        'role': 'Master Stylist & Beard Specialist',
                        'experience': 6,
                        'shift_start': '09:00 AM',
                        'shift_end': '09:00 PM',
                        'break_start': '01:00 PM',
                        'break_end': '02:00 PM',
                        'status': 'ACTIVE',
                        'photoUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop'
                    },
                    {
                        'id': 'st_sb_2',
                        'name': 'Pooja Patil',
                        'role': 'Senior Hair & Skin Therapist',
                        'experience': 5,
                        'shift_start': '10:00 AM',
                        'shift_end': '08:00 PM',
                        'break_start': '02:00 PM',
                        'break_end': '03:00 PM',
                        'status': 'ACTIVE',
                        'photoUrl': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop'
                    }
                ]
            }
        },
        upsert=True
    )

    # 2. Add Luxe Cut Studio - Pune
    pune_id = ObjectId('6a683936c6fcf2a651cf960e')
    barbers_col.update_one(
        {'_id': pune_id},
        {
            '$set': {
                'shop_name': 'Luxe Cut Studio',
                'owner_name': 'Vikram Singh',
                'email': 'luxecut.pune@trimtime.in',
                'phone': '9812345678',
                'address': 'Koregaon Park, Lane 7',
                'city': 'Pune',
                'lat': 18.5362,
                'lng': 73.8940,
                'openingTime': '09:00',
                'closingTime': '22:00',
                'salon_type': "Men's Salon",
                'status': 'active',
                'verified': True,
                'verification_status': 'APPROVED',
                'rating_avg': 4.9,
                'rating_count': 38,
                'experience': 8,
                'profilePic': 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=600&auto=format&fit=crop',
                'shopImages': [
                    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=800&auto=format&fit=crop'
                ],
                'staff': [
                    {
                        'id': 'st_pn_1',
                        'name': 'Rahul Sharma',
                        'role': 'Fade Specialist',
                        'experience': 8,
                        'shift_start': '09:00 AM',
                        'shift_end': '09:00 PM',
                        'break_start': '01:30 PM',
                        'break_end': '02:30 PM',
                        'status': 'ACTIVE',
                        'photoUrl': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop'
                    }
                ]
            }
        },
        upsert=True
    )

    # 3. Add Velvet Glam Lounge - Mumbai
    mumbai_id = ObjectId('6a683936c6fcf2a651cf960f')
    barbers_col.update_one(
        {'_id': mumbai_id},
        {
            '$set': {
                'shop_name': 'Velvet Glam Lounge',
                'owner_name': 'Ananya Mehta',
                'email': 'velvetglam.mumbai@trimtime.in',
                'phone': '9898989898',
                'address': 'Juhu Tara Road, Bandra West',
                'city': 'Mumbai',
                'lat': 19.0988,
                'lng': 72.8264,
                'openingTime': '10:00',
                'closingTime': '21:00',
                'salon_type': "Women's Salon",
                'status': 'active',
                'verified': True,
                'verification_status': 'APPROVED',
                'rating_avg': 4.8,
                'rating_count': 45,
                'experience': 10,
                'profilePic': 'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop',
                'shopImages': [
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=800&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop'
                ],
                'staff': [
                    {
                        'id': 'st_mb_1',
                        'name': 'Sneha Rao',
                        'role': 'Senior Hair Colorist',
                        'experience': 7,
                        'shift_start': '10:00 AM',
                        'shift_end': '08:00 PM',
                        'break_start': '02:00 PM',
                        'break_end': '03:00 PM',
                        'status': 'ACTIVE',
                        'photoUrl': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop'
                    }
                ]
            }
        },
        upsert=True
    )

    # 4. Seed Hairstyle Catalog across all categories for these salons
    sample_services = [
        # SB Salon (Kolhapur)
        {'barber_id': str(sb_id), 'name': 'Classic Haircut & Wash', 'category': "Men's Hair Services", 'price': 150, 'duration': 30, 'description': 'Precision scissor cut with refreshing shampoo wash'},
        {'barber_id': str(sb_id), 'name': 'Beard Styling & Hot Towel Shave', 'category': "Men Grooming", 'price': 100, 'duration': 25, 'description': 'Beard shaping with hot towel steam treatment'},
        {'barber_id': str(sb_id), 'name': 'Gold Facial & Skin Glow', 'category': "Skin & Facial", 'price': 350, 'duration': 45, 'description': 'Deep cleansing herbal gold facial for radiant skin'},
        {'barber_id': str(sb_id), 'name': 'Women Layered Haircut & Blowdry', 'category': "Women's Hair Services", 'price': 300, 'duration': 40, 'description': 'Customized layer cut with professional blowdry'},
        {'barber_id': str(sb_id), 'name': 'Head Massage & Herbal Spa', 'category': "Spa", 'price': 250, 'duration': 30, 'description': 'Relaxing hot oil head massage and steam spa'},

        # Luxe Cut Studio (Pune)
        {'barber_id': str(pune_id), 'name': 'Skin Fade & Precision Trim', 'category': "Men's Hair Services", 'price': 250, 'duration': 35, 'description': 'Ultra-clean skin fade with razor line lineup'},
        {'barber_id': str(pune_id), 'name': 'Beard Trim & Charcoal Detox', 'category': "Men Grooming", 'price': 180, 'duration': 30, 'description': 'Beard shaping with deep charcoal face scrub'},
        {'barber_id': str(pune_id), 'name': 'Global Hair Color & Highlights', 'category': "Hair Color", 'price': 550, 'duration': 60, 'description': 'Ammonia-free global color with custom highlights'},

        # Velvet Glam Lounge (Mumbai)
        {'barber_id': str(mumbai_id), 'name': 'Bridal Makeup & Hair Styling', 'category': "Bridal", 'price': 999, 'duration': 90, 'description': 'Full HD bridal makeup and hair styling'},
        {'barber_id': str(mumbai_id), 'name': 'Gel Nails & Manicure Spa', 'category': "Nails", 'price': 400, 'duration': 45, 'description': 'Nail shaping, cuticle care, and gel polish'},
        {'barber_id': str(mumbai_id), 'name': 'Keratin Hair Treatment', 'category': "Women's Hair Services", 'price': 800, 'duration': 60, 'description': 'Smoothing keratin therapy for soft silky hair'}
    ]

    for service in sample_services:
        hairstyles_col.update_one(
            {'barber_id': service['barber_id'], 'name': service['name']},
            {'$set': service},
            upsert=True
        )

    print("Successfully seeded demo salons and service catalogs!")
