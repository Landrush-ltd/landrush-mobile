# Landrush API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### 1. Sign Up
**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "phone": "+234 801 234 5678",
  "role": "agent" // or "company", "individual", "buyer"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signup successful! Check your email for verification code.",
  "data": {
    "userId": "uuid-here",
    "email": "john@example.com",
    "firstName": "John",
    "emailVerified": false,
    "token": "jwt-token-here"
  }
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /auth/verify-otp`

**Request Body:**
```json
{
  "userId": "uuid-here",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully!",
  "data": {
    "userId": "uuid-here",
    "emailVerified": true
  }
}
```

---

### 3. Resend OTP
**Endpoint:** `POST /auth/resend-otp`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {}
}
```

---

### 4. Login
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "userId": "uuid-here",
    "email": "john@example.com",
    "firstName": "John",
    "token": "jwt-token-here"
  }
}
```

---

### 5. Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "If account exists, reset link will be sent",
  "data": {}
}
```

---

### 6. Reset Password
**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully",
  "data": {}
}
```

---

## Error Responses

### Bad Request (400)
```json
{
  "success": false,
  "message": "Email already registered",
  "statusCode": 400
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Invalid credentials",
  "statusCode": 401
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Please verify your email first",
  "statusCode": 403
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error",
  "statusCode": 500
}
```

---

## Setup Instructions

### Prerequisites
- Node.js v16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env
```

3. **Configure `.env`:**
```
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=landrush
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:8081
```

4. **Start the server:**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

---

## Testing with cURL

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "role": "buyer"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

---

## Security Notes

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong JWT secret** - Change in production
3. **HTTPS only** - Use in production
4. **Rate limiting** - Consider adding in production
5. **Password requirements** - Enforce strong passwords
6. **Email verification** - Always verify emails before granting access
