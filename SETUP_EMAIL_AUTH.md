# Complete Email Verification & Authentication Setup

Complete guide to set up and run the full-stack email verification system.

## 📋 What's Included

✅ **Backend (Node.js/Express)**
- Email verification with 6-digit OTP
- User signup with role-based system
- JWT authentication
- Password reset via email
- Professional HTML email templates

✅ **Frontend (React Native)**
- Signup screen with validation
- OTP verification screen
- Login screen
- Password reset flow
- Integration examples

✅ **Database (PostgreSQL)**
- Users table with roles
- Email verification tracking
- Password reset tokens
- Automatic schema initialization

---

## 🚀 Quick Start (5 minutes)

### Phase 1: Backend Setup

**1. Install PostgreSQL** (if not already installed)
- Download from https://www.postgresql.org/download/
- Create a database named `landrush`

**2. Configure Backend**
```bash
cd backend
cp .env.example .env
nano .env  # Edit with your settings
```

Update these values:
```env
DB_PASSWORD=your_postgres_password
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

**3. Install & Start Backend**
```bash
npm install
npm run dev
```

You should see:
```
🚀 Landrush API server running on http://localhost:5000
📧 Email verification system ready
🔐 JWT authentication enabled
```

### Phase 2: Frontend Integration

**1. Install API package**
```bash
npm install axios
```

**2. Copy API service file**
- Create: `src/services/api.ts`
- Copy code from [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

**3. Update auth screens** following examples in [FRONTEND_INTEGRATION.md](./FRONTEND_INTEGRATION.md)

---

## 📝 Configuration Guide

### Email Setup (Gmail)

**Step 1: Enable 2-Step Verification**
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the prompts

**Step 2: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google generates a 16-character password
4. Copy it to your `.env` file

**Step 3: In `.env`**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### Database Setup

PostgreSQL will create tables automatically on first server start. Make sure:
- PostgreSQL is running
- Database `landrush` exists (or change DB_NAME in .env)
- Credentials in `.env` are correct

To manually create database:
```bash
# Open PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE landrush;
```

### Frontend API URL

Update based on your setup:

```typescript
// Development (local)
const API_URL = 'http://localhost:5000/api';

// Production
const API_URL = 'https://api.landrush.com';

// Expo (use your machine's IP)
const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
```

---

## 🧪 Testing

### Test Backend with cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "role": "buyer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "returned-from-signup",
    "code": "123456"
  }'
```

### Test Frontend

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run web` (in root folder)
3. Navigate to signup screen
4. Enter test email (use a real email or Mailtrap)
5. Check email for OTP code
6. Enter code and verify
7. Login with credentials

### Use Mailtrap for Testing

1. Sign up at https://mailtrap.io
2. Create new inbox
3. Get SMTP credentials
4. Update `.env`:
```env
EMAIL_SERVICE=ethereal  # or use SMTP directly
EMAIL_USER=mailtrap_user
EMAIL_PASSWORD=mailtrap_pass
```

---

## 📂 File Structure

```
landrush-mobile-source/
├── backend/                          # Node.js/Express API
│   ├── src/
│   │   ├── config/                  # Configuration
│   │   │   ├── database.js
│   │   │   ├── email.js
│   │   │   └── initDb.js
│   │   ├── controllers/             # Business logic
│   │   │   └── authController.js
│   │   ├── routes/                  # API routes
│   │   │   └── authRoutes.js
│   │   ├── services/                # Services
│   │   │   └── emailService.js
│   │   ├── middleware/              # Express middleware
│   │   │   └── auth.js
│   │   ├── utils/                   # Helpers
│   │   │   └── helpers.js
│   │   └── index.js                 # Server entry
│   ├── package.json
│   ├── .env.example
│   ├── README.md
│   └── API_DOCS.md
├── app/
│   └── (auth)/                      # Auth screens
│       ├── signup.tsx
│       ├── login.tsx
│       ├── verify-otp.tsx           # NEW: OTP verification
│       └── forgot-password.tsx      # NEW: Password reset
├── src/
│   └── services/
│       └── api.ts                   # NEW: API client
├── FRONTEND_INTEGRATION.md
└── SETUP_EMAIL_AUTH.md              # This file
```

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET` to random 32+ character string
- [ ] Enable HTTPS/SSL certificates
- [ ] Use production email service (SendGrid, Mailgun, etc.)
- [ ] Add rate limiting to prevent brute force
- [ ] Add CORS restrictions
- [ ] Enable database backups
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Use environment-specific configs
- [ ] Implement refresh tokens
- [ ] Add request validation (Joi schemas)
- [ ] Monitor failed login attempts
- [ ] Implement password strength requirements

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "Database connection failed"**
```
Fix: Check PostgreSQL is running and credentials in .env are correct
```

**Error: "Email service error"**
```
Fix: Verify EMAIL_USER and EMAIL_PASSWORD are correct
For Gmail: Use app password, not your regular password
```

**Error: "Port 5000 already in use"**
```
Fix: Change PORT in .env or kill process using port
```

### Frontend can't connect to backend

**Can't reach http://localhost:5000**
```
Fix: Make sure backend is running
For Expo on phone: Use your machine's local IP instead
```

**CORS errors**
```
Fix: Backend already has CORS enabled for all origins
Check if API_URL is correct in frontend
```

### Email not being sent

**No email received**
1. Check spam/junk folder
2. Verify EMAIL_USER and EMAIL_PASSWORD
3. Check email service logs
4. Try Mailtrap for testing

---

## 📚 Documentation

- **[Backend README](./backend/README.md)** - Backend setup and structure
- **[API Documentation](./backend/API_DOCS.md)** - Complete API reference
- **[Frontend Integration](./FRONTEND_INTEGRATION.md)** - Frontend code examples
- **[This Setup Guide](./SETUP_EMAIL_AUTH.md)** - Complete setup instructions

---

## 💡 Next Steps

After setup:

1. **Test the complete flow** - Signup → Verify → Login
2. **Update auth screens** - Implement the examples from FRONTEND_INTEGRATION.md
3. **Add password reset** - Wire up forgot password screen
4. **Style the screens** - Match Landrush design system
5. **Add validation** - Email/password format checks
6. **Test on mobile** - Use real device to test
7. **Deploy backend** - Use Heroku, Railway, or DigitalOcean
8. **Update frontend** - Change API_URL to production endpoint

---

## 🆘 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the relevant documentation file
3. Check backend logs for API errors
4. Check frontend console for network errors
5. Verify all environment variables are set correctly

---

## ✨ Features Overview

### Email Verification Flow
```
User Signs Up
  ↓ [Backend sends OTP email]
  ↓
User Receives Email with Code
  ↓ [User enters code]
  ↓
Backend Verifies Code
  ↓ [Email marked as verified]
  ↓
User Can Now Login
```

### Password Reset Flow
```
User Clicks "Forgot Password"
  ↓ [Enters email]
  ↓
Backend Sends Reset Link
  ↓
User Clicks Link in Email
  ↓
Frontend Shows Password Reset Form
  ↓ [User enters new password]
  ↓
Backend Updates Password
  ↓
User Can Login with New Password
```

### User Roles
- **Agent** - Real estate professional
- **Company** - Real estate company/broker
- **Individual** - Land owner/farmer
- **Buyer** - Property searcher

---

## 🎉 You're All Set!

Your complete email verification and authentication system is now ready. Start with the quick start section and follow the integration guide to connect it to your frontend.

Good luck! 🚀
