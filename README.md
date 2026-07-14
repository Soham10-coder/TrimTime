# TrimTime ✂️ - Premium Barber Booking Platform

TrimTime is a full-stack startup application designed for online barber appointment scheduling. It replaces legalconnect/Advier. It features a modern, responsive user interface built in React, Vite, Tailwind CSS, and Framer Motion, backed by a production-grade Python Flask MVC REST API.

---

## Technical Stack

- **Frontend:** React.js, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Canvas Confetti.
- **Backend:** Python Flask, PyMongo (MongoDB Atlas), PyJWT (Authentication), bcrypt (Password Hashing), Flask-Limiter (Rate Limiting).
- **Database:** MongoDB Atlas (isolated database: `trimtime`).
- **Integrations:** Razorpay (Payments & Refunds), Cloudinary (Image Cloud Storage), SMTP/Brevo (OTPs & Invoices).

---

## Features

### 👨‍💼 User Roles
1. **Customer:** Browse shops, view hairstyle portfolios, check live schedules, apply coupons, pay online, verify bookings via QR code, track loyalty points, and write reviews.
2. **Barber Shop:** Set working hours, toggle holiday mode, manage hairstyles catalogue (add/edit categories, prices, durations), track revenues/earnings, and view calendar logs.
3. **Administrator:** Moderate customer accounts, verify and activate pending barber profiles (PAN/Aadhaar check), track overall platform volume metrics, and create discount vouchers.

### 📅 Smart Slot Allocation
The scheduling engine dynamically generates open slots in 30-minute intervals:
- Checks operational hours, weekly holidays, and global holiday modes.
- Avoids overlaps by checking existing confirmed/pending bookings.
- Accounts for service duration and a 10-minute cleanup buffer between bookings.
- Prevents double-bookings at the API schema validation layer.

### 🛡️ Production Security
- **JWT Session Protection:** Access tokens expire in 15 minutes.
- **Refresh Token Rotation (RTR):** Automatically rotates refresh tokens on every refresh, with database tracking to revoke all sessions if token reuse/replay attacks are detected.
- **CSRF & Rate Limiting:** REST endpoints are rate-limited to prevent credential brute-forcing.
- **Secure File Storage:** Profile pictures and shop assets are validated for type/size before uploading to Cloudinary (or falling back to server uploads).

---

## Installation & Setup

### 1. Environment Variables Configuration
Modify the `.env` file at the workspace root to add your credentials:
```env
# Flask Application Secret Keys
SECRET_KEY=your_flask_secret_key
JWT_SECRET_KEY=your_jwt_access_secret
JWT_REFRESH_SECRET_KEY=your_jwt_refresh_secret

# MongoDB Atlas URI (already configured)
MONGO_URI=mongodb+srv://...

# Gmail/SMTP Credentials for Notifications
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Razorpay Keys
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Cloudinary Storage Settings
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
*Note: If Razorpay, SMTP, or Cloudinary settings are omitted, TrimTime automatically operates in **mock mode** allowing developers to test the full front-to-back booking checkout without cloud dependencies.*

### 2. Booting the REST API Backend
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start backend server (starts on http://localhost:5000)
python app.py
```

### 3. Booting the React Frontend
```bash
cd frontend

# Install package dependencies
npm install

# Start Vite dev server (starts on http://localhost:5173)
npm run dev
```

---

## Verification & Testing

An automated unit test suite is available under the backend directory to check auth flows, approvals, slot calculations, and payment hook captures.

```bash
# Execute tests
python -m unittest backend/tests/verify_endpoints.py
```
>>>>>>> 30a50bf (Initial commit of TrimTime project with Docker & CI setup)
