from app import create_app
from app.db import master_services_col

app = create_app()

print("Updating master catalog categories and attaching high-res cover image URLs...")

category_mapping = {
    "Men's Hair Services": "Men's Hair Services",
    "Women's Hair Services": "Women's Hair Services",
    "Kids Hair Services": "Kids Hair Services",
    "Men Grooming": "Men's Grooming & Shaving",
    "Skin & Facial": "Skin & Facials",
    "Makeup": "Makeup & Styling",
    "Nails": "Nails & Manicure",
    "Hair Removal": "Waxing & Hair Removal",
    "Spa": "Spa & Head Massages",
    "Eyebrows & Eyelashes": "Eyebrows & Eyelashes",
    "Bridal": "Bridal Packages",
    "Other": "Men's Hair Services"
}

# Image pools per category
category_images = {
    "Men's Hair Services": [
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517832606589-7a598bab60af?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80'
    ],
    "Women's Hair Services": [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=600&auto=format&fit=crop&q=80'
    ],
    "Kids Hair Services": [
        'https://images.unsplash.com/photo-1519452635265-7b1fbfd1e4e0?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595454181283-0551061986c7?w=600&auto=format&fit=crop&q=80'
    ],
    "Men's Grooming & Shaving": [
        'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600&auto=format&fit=crop&q=80'
    ],
    "Skin & Facials": [
        'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=80'
    ],
    "Makeup & Styling": [
        'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
    ],
    "Nails & Manicure": [
        'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=600&auto=format&fit=crop&q=80'
    ],
    "Waxing & Hair Removal": [
        'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&auto=format&fit=crop&q=80'
    ],
    "Spa & Head Massages": [
        'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&auto=format&fit=crop&q=80'
    ],
    "Eyebrows & Eyelashes": [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80'
    ],
    "Bridal Packages": [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80'
    ]
}

services = list(master_services_col.find())
updated_count = 0

for idx, s in enumerate(services):
    curr_cat = s.get('category', 'Others')
    new_cat = category_mapping.get(curr_cat, curr_cat)
    
    img_list = category_images.get(new_cat, category_images["Men's Hair Services"])
    cover_img = img_list[idx % len(img_list)]
    
    master_services_col.update_one(
        {'_id': s['_id']},
        {'$set': {'category': new_cat, 'cover_image': cover_img}}
    )
    updated_count += 1

print(f"Updated {updated_count} master services with normalized categories and cover images!")
print("New categories in DB:", master_services_col.distinct('category'))
