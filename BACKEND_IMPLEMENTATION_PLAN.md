# Landrush Backend Implementation Plan

## 1. Technology Stack

### Core Framework
- **Runtime:** Node.js 20+ LTS
- **Framework:** Express.js 4.x (lightweight, flexible, widely adopted)
- **Language:** TypeScript (type safety, better IDE support, easier refactoring)
- **Linting:** ESLint + Prettier (code quality & formatting)

### Database
- **Primary:** PostgreSQL 15+ (relational, ACID, strong JSON support)
- **ORM:** Prisma (type-safe, migrations, seed scripts)
- **Connection Pool:** Built into Prisma (scalable, auto-reconnect)

### Authentication & Security
- **JWT:** jsonwebtoken (token generation & validation)
- **Password Hashing:** bcryptjs (strong hashing, salt rounds)
- **OAuth:** googleapis & apple-signin-auth (external auth providers)
- **Rate Limiting:** express-rate-limit (prevent abuse)
- **CORS:** cors middleware (safe cross-origin requests)

### File Storage
- **Service:** Cloudflare R2 or AWS S3 (image uploads, documents)
- **Middleware:** multer (file parsing), sharp (image optimization)

### Notifications
- **Push:** Expo Notifications API (already integrated on frontend)
- **Email:** SendGrid or Mailgun (OTP, verification emails)
- **Queue:** Bull (background jobs for notifications, image processing)
- **Cache:** Redis (session store, rate limit counters, notifications queue)

### Validation & Utilities
- **Validation:** zod (runtime type validation)
- **HTTP Client:** axios (Google OAuth, email services)
- **Utilities:** lodash, date-fns (common operations)
- **Error Handling:** Custom error classes with proper HTTP codes

### Testing & Quality
- **Unit Tests:** Jest + ts-jest
- **Integration Tests:** Supertest (HTTP testing)
- **DB Testing:** Docker Compose (spin up test PostgreSQL)
- **Coverage:** >80% target for critical paths

### DevOps & Deployment
- **Container:** Docker + Docker Compose (local dev & production)
- **CI/CD:** GitHub Actions (automated testing on PR)
- **Deployment:** Railway, Render, or Heroku (PaaS, simple scaling)
- **Monitoring:** Sentry (error tracking), DataDog or New Relic (optional)
- **Logging:** Winston (structured logging)

---

## 2. Project Structure

```
landrush-backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma setup
│   │   ├── env.ts              # Environment variables (validation)
│   │   └── constants.ts        # App constants
│   │
│   ├── middleware/
│   │   ├── auth.ts             # JWT verification
│   │   ├── errorHandler.ts     # Error handling
│   │   ├── validation.ts       # Request validation (zod)
│   │   ├── rateLimit.ts        # Rate limiting
│   │   └── cors.ts             # CORS policy
│   │
│   ├── routes/
│   │   ├── auth.ts             # /auth/* routes
│   │   ├── listings.ts         # /listings/* routes
│   │   ├── conversations.ts    # /conversations/* routes
│   │   ├── bookings.ts         # /bookings/* routes
│   │   ├── notifications.ts    # /notifications/* routes
│   │   ├── users.ts            # /users/* routes
│   │   └── agents.ts           # /agents/* routes
│   │
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── listingsController.ts
│   │   ├── conversationsController.ts
│   │   ├── bookingsController.ts
│   │   ├── notificationsController.ts
│   │   ├── usersController.ts
│   │   └── agentsController.ts
│   │
│   ├── services/
│   │   ├── authService.ts      # Auth business logic
│   │   ├── listingsService.ts
│   │   ├── conversationsService.ts
│   │   ├── bookingsService.ts
│   │   ├── notificationsService.ts
│   │   ├── usersService.ts
│   │   ├── agentsService.ts
│   │   ├── emailService.ts     # SendGrid/Mailgun integration
│   │   ├── fileService.ts      # S3/R2 uploads
│   │   └── oauthService.ts     # Google/Apple OAuth
│   │
│   ├── jobs/
│   │   ├── sendNotification.ts # Background jobs
│   │   ├── processImage.ts     # Image optimization
│   │   └── cleanupExpiredOtp.ts
│   │
│   ├── utils/
│   │   ├── logger.ts           # Winston setup
│   │   ├── errors.ts           # Custom error classes
│   │   ├── jwt.ts              # Token utilities
│   │   ├── validation.ts       # Zod schemas
│   │   └── helpers.ts          # Common helpers
│   │
│   ├── types/
│   │   └── index.ts            # Global types
│   │
│   ├── db/
│   │   └── seed.ts             # Seed script
│   │
│   └── app.ts                  # Express app setup
│
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Auto-generated migrations
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/               # Mock data
│
├── docker-compose.yml          # Local dev environment
├── Dockerfile                  # Production image
├── .env.example                # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 3. Database Schema (Prisma)

### Core Models

#### User
```prisma
model User {
  id            String    @id @default(cuid())
  firstName     String
  lastName      String
  email         String    @unique
  phone         String?   @unique
  passwordHash  String?   // null for OAuth-only users
  avatar        String?
  role          Role      @default(SEEKER) // SEEKER | AGENT | ADMIN
  isVerified    Boolean   @default(false)
  
  // Relations
  conversations Conversation[]
  messages      ChatMessage[]
  bookings      Booking[]
  savedListings Listing[]  @relation("SavedListings")
  reviews       Review[]
  notifications Notification[]
  payouts       Payout[]
  
  // Timestamps
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // soft delete
}

model Agent {
  id              String    @id @default(cuid())
  userId          String    @unique
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  bio             String?
  certifications  String[]  // ["NAREB", "NLA"]
  specializations String[]  // ["Farmland", "Commercial"]
  bankAccount     BankAccount?
  
  // Stats (denormalized for performance)
  totalListings   Int       @default(0)
  activeListings  Int       @default(0)
  rating          Float     @default(0)
  reviewCount     Int       @default(0)
  
  // Relations
  listings        Listing[]
  conversations   Conversation[]
  reviews         Review[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model BankAccount {
  id            String    @id @default(cuid())
  agentId       String    @unique
  agent         Agent     @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  accountNumber String
  bankCode      String
  accountName   String
  
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
}
```

#### Listing
```prisma
model Listing {
  id            String      @id @default(cuid())
  agentId       String
  agent         Agent       @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  title         String
  description   String      @db.Text
  category      ListingCategory // SALE | LEASE | DISTRESS
  status        ListingStatus   // AVAILABLE | TAKEN | CLOSED
  
  price         BigInt      // stored in kobo (₦1 = 100 kobo)
  priceUnit     String      // "per year" | "per plot" | ""
  
  location      String
  state         String      // "Lagos", "Ogun", etc
  lga           String?     // Local Government Area
  coordinates   Coordinates?
  
  size          Float
  sizeUnit      String      // "plots" | "acres" | "hectares" | "sqm"
  leaseDuration String?     // "1-5 years"
  
  features      String[]    // ["Irrigated", "Road Access"]
  media         ListingMedia[]
  
  savedBy       User[]      @relation("SavedListings")
  conversations Conversation[]
  bookings      Booking[]
  
  viewCount     Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deletedAt     DateTime?
}

model ListingMedia {
  id          String    @id @default(cuid())
  listingId   String
  listing     Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  uri         String    // S3/R2 URL
  type        MediaType // IMAGE | VIDEO | DOCUMENT
  displayOrder Int
  
  uploadedAt  DateTime  @default(now())
}

model Coordinates {
  id        String    @id @default(cuid())
  listingId String    @unique
  listing   Listing   @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  latitude  Float
  longitude Float
}
```

#### Conversation & Messages
```prisma
model Conversation {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  agentId     String
  agent       Agent         @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  listingId   String
  listing     Listing       @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  messages    ChatMessage[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@unique([userId, agentId, listingId])
}

model ChatMessage {
  id              String        @id @default(cuid())
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  senderId        String
  sender          User          @relation(fields: [senderId], references: [id], onDelete: Cascade)
  
  text            String        @db.Text
  type            MessageType   // TEXT | IMAGE
  imageUri        String?
  
  status          MessageStatus // SENT | DELIVERED | READ
  readAt          DateTime?
  
  createdAt       DateTime      @default(now())
}
```

#### Booking & Inspection
```prisma
model Booking {
  id              String          @id @default(cuid())
  userId          String
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  listingId       String
  listing         Listing         @relation(fields: [listingId], references: [id], onDelete: Cascade)
  
  agentId         String          // denormalized for easy access
  
  preferredDate   DateTime
  preferredTime   String          // "14:00"
  message         String?         @db.Text
  
  status          BookingStatus   // PENDING | CONFIRMED | RESCHEDULED | CANCELLED
  cancelledReason String?
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}
```

#### Notifications
```prisma
model Notification {
  id              String            @id @default(cuid())
  userId          String
  user            User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type            NotificationType  // INSPECTION | PAYMENT | MESSAGE | LISTING | SYSTEM
  title           String
  subtitle        String            @db.Text
  
  listingId       String?
  bookingId       String?
  conversationId  String?
  
  unread          Boolean           @default(true)
  readAt          DateTime?
  
  createdAt       DateTime          @default(now())
}
```

#### Reviews & Ratings
```prisma
model Review {
  id        String    @id @default(cuid())
  agentId   String
  agent     Agent     @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  buyerId   String
  buyer     User      @relation(fields: [buyerId], references: [id], onDelete: Cascade)
  
  listingId String?
  
  rating    Int       // 1-5
  title     String
  comment   String    @db.Text
  
  createdAt DateTime  @default(now())
}
```

#### Payouts
```prisma
model Payout {
  id          String        @id @default(cuid())
  agentId     String
  agent       User          @relation(fields: [agentId], references: [id], onDelete: Cascade)
  
  amount      BigInt        // in kobo
  status      PayoutStatus  // PENDING | PROCESSING | COMPLETED | FAILED
  reason      String?
  
  bankAccount String?       // snapshot of account number
  reference   String?       // payment provider reference
  
  requestedAt DateTime      @default(now())
  completedAt DateTime?
}
```

### Enums
```prisma
enum Role {
  SEEKER
  AGENT
  ADMIN
}

enum ListingCategory {
  SALE
  LEASE
  DISTRESS
}

enum ListingStatus {
  AVAILABLE
  TAKEN
  CLOSED
}

enum MediaType {
  IMAGE
  VIDEO
  DOCUMENT
}

enum MessageType {
  TEXT
  IMAGE
}

enum MessageStatus {
  SENT
  DELIVERED
  READ
}

enum BookingStatus {
  PENDING
  CONFIRMED
  RESCHEDULED
  CANCELLED
}

enum NotificationType {
  INSPECTION
  PAYMENT
  MESSAGE
  LISTING
  SYSTEM
}

enum PayoutStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

---

## 4. Implementation Phases

### Phase 1: Setup & Core Infrastructure (1-2 weeks)
- [ ] Project setup (TypeScript, Express, Prisma)
- [ ] PostgreSQL database setup
- [ ] Environment configuration
- [ ] Error handling & logging
- [ ] Database migrations
- [ ] Basic middleware (CORS, rate limiting, validation)

### Phase 2: Authentication (1 week)
- [ ] Email/phone signup with OTP
- [ ] Login
- [ ] JWT token generation & refresh
- [ ] Google OAuth integration
- [ ] Apple OAuth integration
- [ ] Password hashing & security
- [ ] Token validation middleware

### Phase 3: Listings (1.5 weeks)
- [ ] CRUD operations
- [ ] Search & filtering
- [ ] Save/unsave listings
- [ ] Image uploads (S3/R2)
- [ ] View count tracking
- [ ] Soft deletes

### Phase 4: Conversations & Messaging (1 week)
- [ ] Start conversation
- [ ] Send/receive messages
- [ ] Message status (sent/delivered/read)
- [ ] Conversation list with pagination
- [ ] Message history

### Phase 5: Bookings (1 week)
- [ ] Create booking
- [ ] Confirm/cancel booking
- [ ] Booking history
- [ ] Agent booking list

### Phase 6: Agent Profiles (1 week)
- [ ] Agent profile CRUD
- [ ] Reviews & ratings
- [ ] Agent discovery
- [ ] Statistics aggregation
- [ ] Payout management

### Phase 7: Notifications (1 week)
- [ ] Push notification integration
- [ ] Email notifications (OTP, verification)
- [ ] Notification preferences
- [ ] Mark read / mark all read
- [ ] Background job queue (Bull + Redis)

### Phase 8: Testing & Deployment (1.5 weeks)
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] Docker setup
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deployment to staging
- [ ] Performance optimization

---

## 5. API Implementation Strategy

### Folder Structure per Route
Each route folder follows this pattern:

```typescript
// routes/listings.ts
router.get('/listings', validateQuery(listingQuerySchema), listingsController.getAll);
router.post('/listings', authenticate, validateBody(createListingSchema), listingsController.create);

// controllers/listingsController.ts
export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const listings = await listingsService.getAll(req.query);
    res.json({ data: listings });
  } catch (error) {
    next(error);
  }
}

// services/listingsService.ts
export async function getAll(filters: ListingFilters) {
  return prisma.listing.findMany({
    where: buildFilters(filters),
    include: { agent: true, media: true },
    take: filters.limit || 20,
    skip: filters.offset || 0,
  });
}
```

### Validation Strategy
- Use **Zod** for runtime validation of requests
- Create reusable schemas for each endpoint
- Middleware validates all incoming requests
- Type-safe request/response through TypeScript

### Error Handling
```typescript
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

// Global error handler catches all errors
app.use((err: Error, req: Request, res: Response) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## 6. Key Features & Workflows

### Authentication Flow
1. User signs up with email → OTP sent via email
2. OTP verification → User account created → JWT token returned
3. Login → credentials checked → JWT token returned
4. OAuth (Google/Apple) → user profile fetched → account auto-created if new

### Listing Workflow
1. Agent posts listing with images
2. Images uploaded to S3/R2, optimized with Sharp
3. Listing indexed in database with search fields
4. Seekers browse, filter, search
5. Seekers save listings (bookmark)
6. Seekers view listing details

### Booking Workflow
1. Seeker books inspection appointment
2. Notification sent to agent
3. Agent confirms or declines
4. Notification sent to seeker
5. History tracked for both parties

### Payment Workflow (Future)
1. Seeker initiates payment for inspection fee
2. Paystack/Flutterwave integration
3. Payment webhook updates booking status
4. Notification sent on success/failure

---

## 7. Security Considerations

### Authentication
- JWT tokens with 24-hour expiry
- Refresh token endpoint for long-lived sessions
- Password hashing with bcryptjs (12 salt rounds)
- OAuth provider validation

### Data Protection
- HTTPS enforced in production
- CORS whitelist for frontend origins
- SQL injection prevention (Prisma ORM)
- Input validation on all endpoints
- Rate limiting to prevent brute force

### File Uploads
- Validate file type & size
- Scan for malware (optional: ClamAV)
- Store separately from code (S3/R2)
- Generate signed URLs for access

---

## 8. Deployment Strategy

### Development
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: landrush
  
  redis:
    image: redis:7
  
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis
```

### Staging & Production
- Deploy via Railway, Render, or Heroku
- PostgreSQL managed database
- Redis for caching & job queue
- GitHub Actions CI/CD:
  - Run tests on PR
  - Build Docker image
  - Deploy to staging on merge to develop
  - Manual deploy to production

---

## 9. Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/landrush
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h
JWT_REFRESH_EXPIRY=7d

# OAuth
GOOGLE_CLIENT_SECRET=...
APPLE_TEAM_ID=...
APPLE_KEY_ID=...
APPLE_PRIVATE_KEY=...

# File Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=landrush-files

# Email
SENDGRID_API_KEY=...
SENDER_EMAIL=noreply@landrush.com

# Notifications
EXPO_ACCESS_TOKEN=...

# Monitoring (optional)
SENTRY_DSN=...
```

---

## 10. Development Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| Setup & Infrastructure | 1-2w | Project, DB, middleware |
| Authentication | 1w | Email, OAuth, JWT |
| Listings | 1.5w | CRUD, search, uploads |
| Conversations | 1w | Messaging, history |
| Bookings | 1w | Create, manage, status |
| Agent Profiles | 1w | Profiles, reviews, payouts |
| Notifications | 1w | Push, email, queue |
| Testing & Deploy | 1.5w | Tests, Docker, CI/CD |
| **Total** | **~9-10 weeks** | **Full backend ready** |

---

## 11. Testing Strategy

### Unit Tests (Services)
- Auth: password hashing, token generation
- Listings: filtering, search logic
- Bookings: status transitions
- Agents: rating calculations

### Integration Tests (API Routes)
- Auth: signup, login, OAuth
- Listings: CRUD, search
- Conversations: start, message
- Bookings: create, cancel
- Notifications: fetch, mark read

### Test Database
- Use Docker Compose to spin up PostgreSQL
- Run migrations before each test
- Seed with fixtures
- Cleanup after tests

---

## 12. Next Steps

1. **Finalize tech stack** — confirm Node.js + Express + Prisma + PostgreSQL
2. **Create Prisma schema** — refine the database design above
3. **Set up repository** — `landrush-backend` separate from mobile
4. **Bootstrap project** — install dependencies, setup Express
5. **Implement Phase 1** — infrastructure, middleware, error handling

---

## Questions for You

1. **Database:** PostgreSQL confirmed? Or prefer MongoDB?
2. **File storage:** S3 (AWS) or Cloudflare R2 (cheaper)?
3. **Email service:** SendGrid, Mailgun, or Resend?
4. **Hosting:** Railway, Render, or Heroku preference?
5. **Payment:** Implement Paystack now or phase it in later?
6. **Timeline:** Can we do 9-10 weeks, or need to accelerate?

