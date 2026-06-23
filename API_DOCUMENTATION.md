# Landrush Backend API Documentation

**Base URL:** `https://api.landrush.com` (or configured via `EXPO_PUBLIC_API_URL`)  
**Version:** 1.0  
**Last Updated:** June 2026

---

## Table of Contents

1. [Authentication](#authentication)
2. [Listings](#listings)
3. [Conversations & Messages](#conversations--messages)
4. [Bookings & Inspections](#bookings--inspections)
5. [Notifications](#notifications)
6. [Users](#users)
7. [Error Handling](#error-handling)

---

## Authentication

### 1. Sign Up with Email/Phone

**Endpoint:** `POST /auth/signup`

**Request:**
```json
{
  "emailOrPhone": "user@example.com or +2348012345678",
  "password": "hashedPassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent to your email/phone"
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Email already registered" | "Invalid email/phone format"
}
```

---

### 2. Verify OTP

**Endpoint:** `POST /auth/verify-otp`

**Request:**
```json
{
  "emailOrPhone": "user@example.com or +2348012345678",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user_123",
    "firstName": "Kenneth",
    "lastName": "Umoekpe",
    "email": "user@example.com",
    "phone": "+2348012345678",
    "avatar": "https://...",
    "role": "seeker",
    "isVerified": true,
    "createdAt": "2026-06-23T10:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid OTP" | "OTP expired"
}
```

---

### 3. Login with Email/Phone

**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "emailOrPhone": "user@example.com or +2348012345678",
  "password": "hashedPassword123"
}
```

**Response (200 OK):**
```json
{
  "user": { /* User object (see above) */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 4. Google Sign-In

**Endpoint:** `POST /auth/oauth/google`

**Request:**
```json
{
  "accessToken": "ya29.a0AfH6SMBx..."
}
```

**Response (200 OK):**
```json
{
  "user": { /* User object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- If user doesn't exist, create account automatically
- Profile name/email/avatar from Google's `/userinfo/v2/me` endpoint
- Handle case where email is not shared by user

---

### 5. Apple Sign-In

**Endpoint:** `POST /auth/oauth/apple`

**Request:**
```json
{
  "identityToken": "eyJraWQiOiIyMjY2MjdlOWZkMjQ1MDI0Mzk0...",
  "email": "user@example.com or null",
  "fullName": {
    "givenName": "Kenneth",
    "familyName": "Umoekpe"
  }
}
```

**Response (200 OK):**
```json
{
  "user": { /* User object */ },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Notes:**
- Verify `identityToken` using Apple's public keys
- Email may be null on subsequent sign-ins (cached)
- Store the user's Apple ID (`sub` claim) to recognize returning users

---

### 6. Refresh Token

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Authorization: Bearer {old_token}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Listings

### 1. Get All Listings

**Endpoint:** `GET /listings`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Filter: 'sale', 'lease', 'distress' |
| `state` | string | Filter by state name (e.g., 'Lagos') |
| `minPrice` | number | Minimum price |
| `maxPrice` | number | Maximum price |
| `limit` | number | Results per page (default: 20) |
| `offset` | number | Pagination offset (default: 0) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "listing_1",
      "title": "Fertile Farmland for Lease",
      "description": "Rich, fertile farmland...",
      "category": "lease",
      "status": "available",
      "price": 500000,
      "priceUnit": "per year",
      "location": "Otta, Ogun State",
      "state": "Ogun",
      "lga": "Ado-Odo/Ota",
      "coordinates": {
        "latitude": 6.6833,
        "longitude": 3.2333
      },
      "size": 5,
      "sizeUnit": "acres",
      "media": [
        {
          "id": "m1",
          "uri": "https://images.unsplash.com/photo-1704230093402-c903d87735b4...",
          "type": "image"
        }
      ],
      "agent": {
        "id": "agent_1",
        "name": "Adebayo Ogunlade",
        "avatar": "https://i.pravatar.cc/150?img=11",
        "phone": "+2348012345678",
        "isVerified": true,
        "totalListings": 12,
        "rating": 4.8
      },
      "features": ["Irrigated", "Road Access", "Fenced"],
      "leaseDuration": "1-5 years",
      "createdAt": "2026-06-01T10:00:00Z",
      "updatedAt": "2026-06-15T10:00:00Z"
    }
  ],
  "total": 234,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Get Single Listing

**Endpoint:** `GET /listings/{id}`

**Response (200 OK):**
```json
{
  "data": { /* Listing object (see above) */ }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Listing not found"
}
```

---

### 3. Create Listing

**Endpoint:** `POST /listings`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "category": "lease",
  "title": "Fertile Farmland for Lease",
  "description": "Rich, fertile farmland ideal for crop cultivation...",
  "state": "Ogun",
  "location": "Otta, Ogun State",
  "size": 5,
  "sizeUnit": "acres",
  "price": 500000,
  "priceUnit": "per year",
  "leaseDuration": "1-5 years",
  "mediaUris": ["https://...", "https://..."],
  "features": ["Irrigated", "Road Access", "Fenced"]
}
```

**Response (201 Created):**
```json
{
  "data": { /* Created listing object */ }
}
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required fields: title, state, price"
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Authentication required"
}
```

---

### 4. Update Listing

**Endpoint:** `PATCH /listings/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:** (same fields as create, all optional)

**Response (200 OK):**
```json
{
  "data": { /* Updated listing object */ }
}
```

---

### 5. Delete Listing

**Endpoint:** `DELETE /listings/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204 No Content)**

---

### 6. Get My Listings

**Endpoint:** `GET /listings/mine`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:** (same as GET /listings)

**Response (200 OK):**
```json
{
  "data": [ /* Array of user's listings */ ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### 7. Save Listing

**Endpoint:** `POST /listings/saved`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "listingId": "listing_1"
}
```

**Response (200 OK):**
```json
{
  "message": "Listing saved"
}
```

---

### 8. Unsave Listing

**Endpoint:** `DELETE /listings/saved/{listingId}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (204 No Content)**

---

### 9. Get Saved Listings

**Endpoint:** `GET /listings/saved`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:** (same as GET /listings)

**Response (200 OK):**
```json
{
  "data": [ /* Array of saved listings */ ],
  "total": 12,
  "limit": 20,
  "offset": 0
}
```

---

## Conversations & Messages

### 1. Get All Conversations

**Endpoint:** `GET /conversations`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `limit` | number | Results per page (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "conv_1",
      "agentId": "agent_1",
      "agentName": "Adebayo Ogunlade",
      "agentAvatar": "https://i.pravatar.cc/150?img=11",
      "agentOnline": true,
      "listingId": "listing_1",
      "listingTitle": "Fertile Farmland for Lease",
      "listingPrice": 500000,
      "listingImageUri": "https://...",
      "lastMessage": "When can we schedule a viewing?",
      "lastMessageAt": "2026-06-23T15:30:00Z",
      "unreadCount": 2,
      "messages": [
        {
          "id": "msg_1",
          "conversationId": "conv_1",
          "senderId": "user_123",
          "text": "Hi, is this still available?",
          "createdAt": "2026-06-23T10:00:00Z",
          "status": "read",
          "type": "text"
        }
      ]
    }
  ],
  "total": 8,
  "limit": 50,
  "offset": 0
}
```

---

### 2. Get Single Conversation

**Endpoint:** `GET /conversations/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": { /* Conversation object with all messages */ }
}
```

---

### 3. Start Conversation

**Endpoint:** `POST /conversations`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "agentId": "agent_1",
  "listingId": "listing_1",
  "initialMessage": "Hi, is this property still available?"
}
```

**Response (201 Created):**
```json
{
  "data": { /* Created conversation object */ }
}
```

---

### 4. Send Message

**Endpoint:** `POST /conversations/{conversationId}/messages`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "text": "When can we schedule a viewing?"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "msg_2",
    "conversationId": "conv_1",
    "senderId": "user_123",
    "text": "When can we schedule a viewing?",
    "createdAt": "2026-06-23T15:30:00Z",
    "status": "sent",
    "type": "text"
  }
}
```

---

## Bookings & Inspections

### 1. Get All Bookings

**Endpoint:** `GET /bookings`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter: 'pending', 'confirmed', 'rescheduled', 'cancelled' |
| `limit` | number | Results per page (default: 20) |
| `offset` | number | Pagination offset (default: 0) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "booking_1",
      "listingId": "listing_1",
      "listingTitle": "Fertile Farmland for Lease",
      "listingImage": "https://...",
      "location": "Otta, Ogun State",
      "price": 500000,
      "date": "2026-07-15",
      "time": "14:00",
      "status": "confirmed",
      "agentName": "Adebayo Ogunlade",
      "agentAvatar": "https://i.pravatar.cc/150?img=11",
      "createdAt": "2026-06-23T10:00:00Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

---

### 2. Create Booking

**Endpoint:** `POST /bookings`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "listingId": "listing_1",
  "preferredDate": "2026-07-15",
  "preferredTime": "14:00",
  "message": "I would like to schedule a viewing"
}
```

**Response (201 Created):**
```json
{
  "data": { /* Created booking object */ }
}
```

---

### 3. Cancel Booking

**Endpoint:** `PATCH /bookings/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "status": "cancelled",
  "cancellationReason": "No longer interested"
}
```

**Response (200 OK):**
```json
{
  "data": { /* Updated booking object */ }
}
```

---

## Notifications

### 1. Get All Notifications

**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `unreadOnly` | boolean | Show only unread (default: false) |
| `limit` | number | Results per page (default: 50) |
| `offset` | number | Pagination offset (default: 0) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "notif_1",
      "type": "inspection",
      "title": "Inspection Confirmed",
      "subtitle": "Your inspection at Fertile Farmland is confirmed for July 15 at 2 PM",
      "time": "2026-06-23T10:00:00Z",
      "unread": true,
      "listingId": "listing_1",
      "bookingId": "booking_1"
    },
    {
      "id": "notif_2",
      "type": "message",
      "title": "New Message",
      "subtitle": "Adebayo Ogunlade sent you a message",
      "time": "2026-06-22T15:30:00Z",
      "unread": false,
      "conversationId": "conv_1"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

**Notification Types:**
- `inspection` — booking confirmed/rescheduled/cancelled
- `payment` — payment received/pending
- `message` — new message from agent
- `listing` — listing going live/flagged
- `system` — general system notifications

---

### 2. Mark Notification as Read

**Endpoint:** `PATCH /notifications/{id}/read`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": { /* Updated notification object */ }
}
```

---

### 3. Mark All as Read

**Endpoint:** `POST /notifications/read-all`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "message": "All notifications marked as read"
}
```

---

### 4. Get Unread Count

**Endpoint:** `GET /notifications/unread-count`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "unreadCount": 3
}
```

---

## Users

### 1. Get Current User

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "user_123",
    "firstName": "Kenneth",
    "lastName": "Umoekpe",
    "email": "user@example.com",
    "phone": "+2348012345678",
    "avatar": "https://i.pravatar.cc/150?img=11",
    "role": "seeker",
    "isVerified": true,
    "createdAt": "2026-06-23T10:00:00Z"
  }
}
```

---

### 2. Update Profile

**Endpoint:** `PATCH /users/me`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "firstName": "Kenneth",
  "lastName": "Umoekpe",
  "avatar": "https://..."
}
```

**Response (200 OK):**
```json
{
  "data": { /* Updated user object */ }
}
```

---

### 3. Register Push Token

**Endpoint:** `POST /users/push-token`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "pushToken": "ExponentPushToken[abc123...]"
}
```

**Response (200 OK):**
```json
{
  "message": "Push token registered"
}
```

---

## Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": 400
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 422 | Unprocessable Entity (validation error) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `AUTH_REQUIRED` | 401 | No authorization header |
| `INVALID_OTP` | 401 | Wrong or expired OTP |
| `DUPLICATE_EMAIL` | 409 | Email already registered |
| `LISTING_NOT_FOUND` | 404 | Listing doesn't exist |
| `VALIDATION_ERROR` | 422 | Invalid input data |
| `RATE_LIMIT` | 429 | Too many requests |

---

## Authentication

**All protected endpoints require:**

```
Authorization: Bearer {jwt_token}
```

**JWT Claims:**
```json
{
  "sub": "user_123",
  "email": "user@example.com",
  "role": "seeker",
  "iat": 1687521600,
  "exp": 1687608000
}
```

**Token Expiry:** 24 hours (recommend refresh before expiry)

---

## Rate Limiting

- **Limit:** 100 requests per minute per user
- **Headers:**
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1687521700
  ```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `limit` (default: 20, max: 100)
- `offset` (default: 0)

**Response includes:**
```json
{
  "data": [ /* items */ ],
  "total": 234,
  "limit": 20,
  "offset": 0
}
```

---

## CORS

**Allowed Origins:**
- `http://localhost:*` (development)
- `https://landrush.app`
- `https://*.landrush.app`

**Allowed Headers:**
- `Content-Type`
- `Authorization`

**Allowed Methods:**
- GET, POST, PATCH, DELETE, OPTIONS

---

## Implementation Notes

### For Backend Team

1. **Database Schema** — Ensure User, Listing, Conversation, Booking, Notification models match response schemas above
2. **Authentication** — Use JWT with 24-hour expiry; support Google OAuth & Apple Sign-In
3. **Validation** — Validate all input fields; return 422 with detailed error messages
4. **Timestamps** — Use ISO 8601 format (UTC)
5. **Coordinates** — Store as {latitude, longitude} with 4 decimal places
6. **Images** — Accept image URIs; store as CloudFlare/S3 URLs
7. **Soft Deletes** — Use soft deletes for listings/conversations (don't return deleted items)
8. **Transactions** — Use DB transactions for booking creation (decrement availability, create record)

### For Frontend Team

- All timestamps are in ISO 8601 UTC format
- Mock data uses same schema as real API for easy swap
- If `EXPO_PUBLIC_API_URL` is empty, app uses mock data
- Set `EXPO_PUBLIC_API_URL=https://api.landrush.com` for production
- Token stored in `useAuthStore().token` (persisted via AsyncStorage)

---

**Version History:**
- v1.0 (June 23, 2026) — Initial spec based on frontend requirements
