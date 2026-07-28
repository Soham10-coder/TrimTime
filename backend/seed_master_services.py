import os
import sys
from pymongo import MongoClient

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import master_services_col

SERVICES = [
    # 1. Men's Hair Services
    {
        "name": "Men's Classic Haircut", 
        "category": "Men's Hair Services", 
        "default_duration": 20, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Men's Fade / Styling Haircut", 
        "category": "Men's Hair Services", 
        "default_duration": 40, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Men's Buzz Cut / Clipper Cut", 
        "category": "Men's Hair Services", 
        "default_duration": 15, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
    },

    # 2. Women's Hair Services
    {
        "name": "Women's Classic Haircut", 
        "category": "Women's Hair Services", 
        "default_duration": 45, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Women's Layer / Styling Haircut", 
        "category": "Women's Hair Services", 
        "default_duration": 60, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Wash & Blow Dry", 
        "category": "Women's Hair Services", 
        "default_duration": 30, 
        "icon": "Wind", 
        "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Styling", 
        "category": "Women's Hair Services", 
        "default_duration": 45, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Colour", 
        "category": "Women's Hair Services", 
        "default_duration": 150, 
        "icon": "Palette", 
        "cover_image": "https://images.unsplash.com/photo-1605497746444-052d5b3834ec?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Highlights", 
        "category": "Women's Hair Services", 
        "default_duration": 240, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Balayage", 
        "category": "Women's Hair Services", 
        "default_duration": 300, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1620331789556-99222c954593?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Spa", 
        "category": "Women's Hair Services", 
        "default_duration": 60, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Smoothening", 
        "category": "Women's Hair Services", 
        "default_duration": 240, 
        "icon": "Flame", 
        "cover_image": "https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Straightening", 
        "category": "Women's Hair Services", 
        "default_duration": 240, 
        "icon": "Flame", 
        "cover_image": "https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Rebonding", 
        "category": "Women's Hair Services", 
        "default_duration": 300, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Keratin Treatment", 
        "category": "Women's Hair Services", 
        "default_duration": 240, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Botox", 
        "category": "Women's Hair Services", 
        "default_duration": 180, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Scalp Treatment", 
        "category": "Women's Hair Services", 
        "default_duration": 60, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Extensions", 
        "category": "Women's Hair Services", 
        "default_duration": 180, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=600&auto=format&fit=crop&q=80"
    },

    # 3. Kids Hair Services
    {
        "name": "Children's Classic Haircut", 
        "category": "Kids Hair Services", 
        "default_duration": 20, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Kids Hair Styling", 
        "category": "Kids Hair Services", 
        "default_duration": 15, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Kids Hair Wash", 
        "category": "Kids Hair Services", 
        "default_duration": 15, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },

    # 4. Skin & Facial
    {
        "name": "Basic Facial", 
        "category": "Skin & Facial", 
        "default_duration": 45, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Fruit Facial", 
        "category": "Skin & Facial", 
        "default_duration": 45, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Gold Facial", 
        "category": "Skin & Facial", 
        "default_duration": 60, 
        "icon": "Award", 
        "cover_image": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Diamond Facial", 
        "category": "Skin & Facial", 
        "default_duration": 60, 
        "icon": "Award", 
        "cover_image": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hydra Facial", 
        "category": "Skin & Facial", 
        "default_duration": 75, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Clean-up", 
        "category": "Skin & Facial", 
        "default_duration": 30, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Skin Polishing", 
        "category": "Skin & Facial", 
        "default_duration": 60, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "De-tan Treatment", 
        "category": "Skin & Facial", 
        "default_duration": 45, 
        "icon": "Sun", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Bleach", 
        "category": "Skin & Facial", 
        "default_duration": 20, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Anti-Ageing Facial", 
        "category": "Skin & Facial", 
        "default_duration": 60, 
        "icon": "TrendingUp", 
        "cover_image": "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Acne Treatment", 
        "category": "Skin & Facial", 
        "default_duration": 60, 
        "icon": "Shield", 
        "cover_image": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&auto=format&fit=crop&q=80"
    },

    # 5. Makeup
    {
        "name": "Party Makeup", 
        "category": "Makeup", 
        "default_duration": 90, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Bridal Makeup", 
        "category": "Makeup", 
        "default_duration": 240, 
        "icon": "Heart", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Engagement Makeup", 
        "category": "Makeup", 
        "default_duration": 180, 
        "icon": "Heart", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Reception Makeup", 
        "category": "Makeup", 
        "default_duration": 180, 
        "icon": "Heart", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "HD Makeup", 
        "category": "Makeup", 
        "default_duration": 180, 
        "icon": "Camera", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Airbrush Makeup", 
        "category": "Makeup", 
        "default_duration": 240, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Groom Makeup", 
        "category": "Makeup", 
        "default_duration": 90, 
        "icon": "User", 
        "cover_image": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
    },

    # 6. Nails
    {
        "name": "Manicure", 
        "category": "Nails", 
        "default_duration": 45, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Pedicure", 
        "category": "Nails", 
        "default_duration": 60, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Gel Polish", 
        "category": "Nails", 
        "default_duration": 60, 
        "icon": "Paintbrush", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Nail Art", 
        "category": "Nails", 
        "default_duration": 90, 
        "icon": "Palette", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Acrylic Nails", 
        "category": "Nails", 
        "default_duration": 120, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Gel Nail Extensions", 
        "category": "Nails", 
        "default_duration": 150, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Nail Repair", 
        "category": "Nails", 
        "default_duration": 30, 
        "icon": "Activity", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Nail Removal", 
        "category": "Nails", 
        "default_duration": 20, 
        "icon": "Trash", 
        "cover_image": "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80"
    },

    # 7. Hair Removal
    {
        "name": "Waxing", 
        "category": "Hair Removal", 
        "default_duration": 30, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Threading", 
        "category": "Hair Removal", 
        "default_duration": 10, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Face Waxing", 
        "category": "Hair Removal", 
        "default_duration": 20, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Body Waxing", 
        "category": "Hair Removal", 
        "default_duration": 90, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Laser Hair Removal", 
        "category": "Hair Removal", 
        "default_duration": 120, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },

    # 8. Men Grooming
    {
        "name": "Beard Trim", 
        "category": "Men Grooming", 
        "default_duration": 20, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Beard Styling", 
        "category": "Men Grooming", 
        "default_duration": 25, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Shaving", 
        "category": "Men Grooming", 
        "default_duration": 20, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Colour (Men)", 
        "category": "Men Grooming", 
        "default_duration": 90, 
        "icon": "Palette", 
        "cover_image": "https://images.unsplash.com/photo-1605497746444-052d5b3834ec?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Facial (Men)", 
        "category": "Men Grooming", 
        "default_duration": 45, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Head Massage (Men)", 
        "category": "Men Grooming", 
        "default_duration": 30, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
    },

    # 9. Spa
    {
        "name": "Head Massage", 
        "category": "Spa", 
        "default_duration": 30, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Foot Spa", 
        "category": "Spa", 
        "default_duration": 45, 
        "icon": "Droplet", 
        "cover_image": "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Body Massage", 
        "category": "Spa", 
        "default_duration": 90, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Body Polish", 
        "category": "Spa", 
        "default_duration": 90, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Body Scrub", 
        "category": "Spa", 
        "default_duration": 60, 
        "icon": "Activity", 
        "cover_image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80"
    },

    # 10. Eyebrows & Eyelashes
    {
        "name": "Eyebrow Threading", 
        "category": "Eyebrows & Eyelashes", 
        "default_duration": 10, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Eyebrow Tinting", 
        "category": "Eyebrows & Eyelashes", 
        "default_duration": 20, 
        "icon": "Palette", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Eyelash Extensions", 
        "category": "Eyebrows & Eyelashes", 
        "default_duration": 120, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Lash Lift", 
        "category": "Eyebrows & Eyelashes", 
        "default_duration": 60, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Brow Lamination", 
        "category": "Eyebrows & Eyelashes", 
        "default_duration": 60, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },

    # 11. Bridal
    {
        "name": "Bridal Package", 
        "category": "Bridal", 
        "default_duration": 300, 
        "icon": "Heart", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Groom Package", 
        "category": "Bridal", 
        "default_duration": 180, 
        "icon": "User", 
        "cover_image": "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Pre-Bridal Care", 
        "category": "Bridal", 
        "default_duration": 240, 
        "icon": "Heart", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Saree Draping", 
        "category": "Bridal", 
        "default_duration": 30, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hairstyling (Bridal)", 
        "category": "Bridal", 
        "default_duration": 60, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Mehendi", 
        "category": "Bridal", 
        "default_duration": 180, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1488866022504-f2584929ca5f?w=600&auto=format&fit=crop&q=80"
    },

    # 12. Other
    {
        "name": "Ear Piercing", 
        "category": "Other", 
        "default_duration": 20, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Nose Piercing", 
        "category": "Other", 
        "default_duration": 20, 
        "icon": "Sparkles", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Tattoo Consultation", 
        "category": "Other", 
        "default_duration": 30, 
        "icon": "Camera", 
        "cover_image": "https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Hair Consultation", 
        "category": "Other", 
        "default_duration": 30, 
        "icon": "Scissors", 
        "cover_image": "https://images.unsplash.com/photo-1599351431247-f9fd212fef01?w=600&auto=format&fit=crop&q=80"
    },
    {
        "name": "Skin Consultation", 
        "category": "Other", 
        "default_duration": 30, 
        "icon": "Smile", 
        "cover_image": "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&auto=format&fit=crop&q=80"
    }
]

def seed():
    print("Flushing existing master services catalog...")
    master_services_col.delete_many({})
    
    print(f"Seeding {len(SERVICES)} master services with split categories...")
    result = master_services_col.insert_many(SERVICES)
    print(f"Successfully seeded {len(result.inserted_ids)} master services into database!")

if __name__ == '__main__':
    seed()
