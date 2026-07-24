# Landrush Backend API

Complete email verification and authentication system for Landrush mobile marketplace.

## Features

✅ **Email Verification** - 6-digit OTP verification system
✅ **User Authentication** - JWT-based authentication
✅ **Password Management** - Secure password reset via email
✅ **User Roles** - Support for agent, company, individual, buyer
✅ **Email Templates** - Professional HTML email templates
✅ **Security** - Password hashing, token expiration, rate limiting

## Quick Start

### 1. Prerequisites

- **Node.js** v16 or higher
- **PostgreSQL** 12 or higher
- **npm** or **yarn**
- Email account (Gmail recommended)

### 2. Installation

```bash
# Clone the repository
cd landrush-mobile-source/backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your environment variables
nano .env
```

### 3. Database Setup

The database will be initialized automatically on first server start. Make sure PostgreSQL is running and your `.env` has correct database credentials.

**Tables created automatically:**
- `users` - User account information
- `email_verifications` - OTP codes for email verification
- `password_resets` - Password reset tokens

### 4. Email Configuration

**Using Gmail:**

1. Enable 2-Step Verification in Google Account
2. Generate App Password (16 characters)
3. In `.env`:
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

**Using other services:**
- Change `EMAIL_SERVICE` to: outlook, yahoo, etc.
- Update credentials accordingly

### 5. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server runs on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # Database connection
│   │   ├── email.js     # Email setup
│   │   └── initDb.js    # Database initialization
│   ├── controllers/      # Request handlers
│   │   └── authController.js
│   ├── routes/          # API routes
│   │   └── authRoutes.js
│   ├── services/        # Business logic
│   │   └── emailService.js
│   ├── middleware/      # Express middleware
│   │   └── auth.js
│   ├── utils/          # Utility functions
│   │   └── helpers.js
│   └── index.js        # Server entry point
├── package.json
├── .env.example
├── API_DOCS.md         # API documentation
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/login` | Login to account |
| POST | `/api/auth/verify-otp` | Verify email with OTP |
| POST | `/api/auth/resend-otp` | Resend OTP code |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

See [API_DOCS.md](./API_DOCS.md) for detailed endpoints and examples.

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=landrush
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRE=7d

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@landrush.com

# Frontend
FRONTEND_URL=http://localhost:8081
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) DEFAULT 'buyer',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Email Verifications Table
```sql
CREATE TABLE email_verifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Resets Table
```sql
CREATE TABLE password_resets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

### Test with cURL

**Signup:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"TestPass123!",
    "role":"buyer"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"john@example.com",
    "password":"TestPass123!"
  }'
```

### Test with Postman

1. Import endpoints to Postman
2. Set base URL: `http://localhost:5000/api`
3. Create requests for each endpoint
4. Test full signup → verify → login flow

## Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify `.env` database credentials
- Ensure database name exists

### Email Not Sending
- Check `.env` email credentials
- Enable "Less secure apps" (if using Gmail)
- Check firewall/antivirus blocking SMTP
- Verify `EMAIL_USER` has correct format

### Port Already in Use
```bash
# Kill process on port 5000
lsof -i :5000  # Find process
kill -9 <PID>  # Kill it
```

## Security Checklist

- [ ] Change JWT_SECRET to strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Add rate limiting middleware
- [ ] Validate all input on backend
- [ ] Use strong password requirements
- [ ] Regular database backups
- [ ] Monitor error logs
- [ ] Update dependencies regularly

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong, unique `JWT_SECRET`
3. Set up HTTPS/SSL certificates
4. Use production email service
5. Enable rate limiting
6. Set up database backups
7. Monitor logs and errors
8. Use process manager (PM2, Forever)

## Support & Documentation

- [API Documentation](./API_DOCS.md)
- [Frontend Integration Guide](../FRONTEND_INTEGRATION.md)
- [Environment Setup](./ENV_SETUP.md)

## License

MIT
