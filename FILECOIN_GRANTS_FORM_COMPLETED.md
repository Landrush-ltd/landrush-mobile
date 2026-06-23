# Filecoin Foundation Open Grants Program Application

**Project:** Landrush — Blockchain-backed Land Marketplace for Nigeria

---

## Problem Statement

Land ownership in Nigeria is a critical problem affecting over 65% of the population. Two-thirds of Nigerian land lacks documented proof of ownership, costing the economy over $400 billion annually in fraud, delayed transactions, and unresolved legal disputes. Land disputes take 5–10 years to resolve in courts, during which properties remain tied up and economic value is destroyed. Real estate agents routinely manipulate documentation, selling the same parcel multiple times to different buyers with forged deeds. Without immutable, decentralized records, buyers have no recourse and the entire real estate market operates on trust rather than verifiable proof.

This problem extends across Africa: Ghana, Kenya, South Africa, and other nations face identical land registry challenges. Banks refuse to provide mortgages without documented proof of ownership. Foreign investors avoid African land deals due to fraud risk. Governments lack the infrastructure to maintain transparent ownership records. The result: trillions of dollars in economic potential remain locked because land cannot be reliably transacted.

Landrush solves this by creating a decentralized land marketplace where property deeds, surveys, and ownership records are stored on Filecoin—immutable, censorship-resistant, and permanently verifiable. Buyers and sellers connect directly through our platform, and every deed is backed by an immutable IPFS hash on Filecoin. This transforms land from an untrusted asset into a verifiable, tradeable resource.

---

## Impact

### Pain Points Addressed

**For Buyers (Seekers):**
- No way to verify property ownership before purchase
- Fear of fraud (buying land already sold to someone else)
- No audit trail of previous transactions
- Reliance on agents' assurances (which are often forged)

**For Sellers (Agents):**
- Difficulty proving legitimate ownership
- Losing sales to competing sellers with fake deeds
- No way to build trust with buyers
- Legal disputes over unverifiable documentation

**For the Ecosystem:**
- No transparent land registry
- Governments can't tax or regulate land transfers
- Banks can't verify collateral for mortgages
- Investment capital avoids African real estate

### Benefits of Getting This Right

**Economic:** Unlock $400B+ in trapped land value. Enable mortgages, foreign investment, and formal property transactions. Create jobs in real estate, legal services, and fintech.

**Social:** Reduce land disputes from 7-year court cases to instant verification. Protect vulnerable populations from fraud. Enable property rights for women and minorities historically excluded from formal ownership.

**Tech Impact:** Prove Filecoin solves real-world problems beyond cloud storage. Demonstrate IPFS/Filecoin viability for immutable records in developing economies. Create template for replication in other African countries and emerging markets.

### Risks of Not Getting This Right

**Economic Risk:** Continue losing $billions to fraud. Remain unable to attract institutional investment in African real estate.

**Social Risk:** Land disputes escalate to violence. Poor populations remain locked out of property ownership. Corruption in land registries persists unchecked.

**For Filecoin:** Miss opportunity to demonstrate real-world impact. Remain perception as "storage for crypto bros" rather than critical infrastructure.

### Success Metrics

**Phase 1 (MVP Launch):**
- 100+ active users on platform
- 500+ listings posted
- 50+ verified transactions
- Product rated 4.5+ stars

**Phase 2 (Filecoin Integration):**
- 100+ property deeds stored on Filecoin
- 10GB+ of land records archived
- 99.5%+ retrieval success rate
- 50+ agent certifications on-chain
- 5+ media articles on "blockchain land registry"

**Year 2 (Scale):**
- 10,000+ active users
- 1TB+ archived on Filecoin
- Government pilot with Lagos State
- $500M+ transaction volume facilitated
- Proof Filecoin solves African fintech problems

---

## Outcomes

### Deliverables

**Phase 1: MVP Marketplace (9–10 weeks)**
- Full-featured real estate marketplace (React Native mobile app)
- User authentication (email/OTP, Google OAuth, Apple OAuth)
- Listing creation and management (photos, descriptions, pricing)
- Search and filtering by state, category, price
- Agent profiles with ratings and reviews
- Messaging between buyers and agents
- Inspection booking system
- Image storage on AWS S3
- Push notifications (Expo)
- Backend API (Node.js, Express, PostgreSQL, Prisma)
- Docker deployment + CI/CD (GitHub Actions)

**Phase 2: Filecoin Integration (4 weeks, grant-funded)**
- Web3.storage SDK integration for document uploads
- IPFS/Filecoin storage of property deeds, certifications, surveys
- Smart contract for deed verification and agent certification registry
- UI showing "Verified Land Records" badges with IPFS hash proof
- Ownership history audit tools for buyers
- Agent certification on-chain
- Impact dashboard tracking documents stored on Filecoin
- Quarterly impact reports to Filecoin Foundation

### Success Metrics

**Technical:**
- 99.5%+ Filecoin retrieval success rate
- <2 second IPFS document retrieval (with caching)
- 3+ redundant providers per deed (Filecoin deal redundancy)
- Zero data loss (immutable IPFS hashes)

**Business:**
- 100+ deeds on Filecoin by Month 6
- 1,000+ users by Month 12
- 50+ agent subscriptions by Month 6
- $100K+ monthly transaction volume by Month 12

**Impact:**
- Prevent 10+ confirmed land fraud cases
- Enable 50+ legitimate property transactions
- 5+ government/institutional inquiries for licensing

---

## Data Onboarding

**Projected Filecoin Data Onboarding:**

| Timeline | Data Volume | Description |
|----------|-------------|-------------|
| Month 1 | 100 MB | Initial property deeds and surveys (Phase 2 launch) |
| Month 3 | 1 GB | 100+ deeds, certifications, legal documents |
| Month 6 | 5 GB | 500+ deeds, agent records, transaction history |
| Month 12 | 50 GB | 5,000+ deeds, comprehensive land record archive |

**Growth Trajectory:**
- Launch: 100 deeds/month → 1 GB/month
- Month 6: Scale to 500 deeds/month → 5 GB/month
- Year 2: Scale to 5,000 deeds/month → 50 GB/month
- Year 3: Target 1TB+ archived on Filecoin (100K+ properties)

**Data Types Stored on Filecoin:**
- Property deeds and title documents (PDF, images)
- Land survey maps and boundary documents
- Agent certifications and licenses
- Legal verification records
- Inspection reports and booking confirmations
- Ownership transfer records

---

## Adoption, Reach, and Growth Strategies

### Target Audience

**Primary:** Nigerian real estate agents (100,000+), property seekers (5M+), institutional buyers

**Secondary:** Government land registries, banks/mortgage lenders, property management companies

**Tertiary:** Other African countries (Ghana, Kenya, South Africa) seeking blockchain land solutions

### Current Engagement

- **Landing page:** https://www.landrushafrica.com/ (getting organic traffic)
- **GitHub:** https://github.com/Landrush-ltd (open source, building in public)
- **Team presence:** Active across LinkedIn, GitHub, developer communities
- **Soft launch planned:** July 2026 in Lagos with 500 early users

### User Onboarding Strategy

**First 10 Users (Week 1):**
- Invite real estate agents from personal networks
- Target early adopters in Lagos
- Hands-on onboarding, gather feedback
- Iterate product based on feedback

**First 100 Users (Month 1):**
- Launch soft public beta in Lagos
- Partner with 2–3 real estate agencies
- Influencer outreach to property experts
- Media coverage: "New blockchain real estate app launches in Nigeria"
- Referral bonuses (free premium features)

**First 1,000 Users (Month 3):**
- Expand to 5 Nigerian states (Lagos, Ogun, Rivers, Abuja, Kano)
- Partner with 10+ real estate agencies
- Government outreach (Lagos State digital innovation office)
- Press: "Blockchain-backed land registry gaining traction in Nigeria"
- Agent subscription promotions

**Scale to 10,000+ (Year 1):**
- National coverage across Nigeria
- International expansion (Ghana, Kenya, South Africa)
- B2B licensing to real estate companies
- API partnerships with banks/mortgage providers
- Government integration pilots

---

## Development Roadmap

### Milestone 1: Backend Infrastructure & Core API (Weeks 1–3)
**Deliverables:**
- PostgreSQL database with Prisma ORM
- Express.js REST API with authentication layer
- JWT token generation and refresh
- Email/OTP signup flow with SendGrid integration
- Google OAuth and Apple OAuth integration
- Rate limiting and CORS security
- Docker containerization and GitHub Actions CI/CD

**Team & Roles:**
- Backend Engineer (Ubongabasi Jerome) — API design, database, auth
- DevOps (Shared) — Docker, CI/CD, infrastructure

**Funding Required:** Included in Phase 1 budget (internal)

**Timeline:** July 1–21, 2026

---

### Milestone 2: Listings & Marketplace Core (Weeks 4–6)
**Deliverables:**
- Listing CRUD operations (create, read, update, delete)
- Search and filtering (by state, category, price, agent)
- Image upload and optimization (AWS S3)
- Listing detail page with agent profiles
- Save/bookmark listings
- Agent verification system
- Ratings and reviews for agents
- Full test coverage (unit + integration)

**Team & Roles:**
- Backend Engineer (Ubongabasi Jerome) — API endpoints, business logic
- Full-Stack Developer (Unsteady Teddy) — API integration, mobile features
- Frontend/Mobile (Arinze Obasi) — UI components, image upload flow

**Funding Required:** Included in Phase 1 budget (internal)

**Timeline:** July 21–August 10, 2026

---

### Milestone 3: Conversations, Bookings & Notifications (Weeks 7–9)
**Deliverables:**
- Real-time messaging system (buyer-agent conversations)
- Message status tracking (sent, delivered, read)
- Conversation history and search
- Booking/inspection scheduling system
- Booking status management (pending, confirmed, cancelled)
- Push notifications (Expo)
- Email notifications (OTP, booking confirmations, new messages)
- Background job queue (Bull + Redis)
- Comprehensive logging and monitoring

**Team & Roles:**
- Backend Engineer (Ubongabasi Jerome) — Conversations API, jobs queue
- Full-Stack Developer (Unsteady Teddy) — Real-time features, notifications
- Frontend/Mobile (Arinze Obasi) — Chat UI, notification handling

**Funding Required:** Included in Phase 1 budget (internal)

**Timeline:** August 10–September 1, 2026

---

### Milestone 4: Testing, Deployment & Phase 1 Launch (Weeks 10–12)
**Deliverables:**
- Full test suite (80%+ coverage)
- Security audit and vulnerability scanning
- Performance optimization and caching
- Production deployment (Railway/Render)
- Soft launch in Lagos (500 users)
- Product monitoring and analytics
- User onboarding automation
- Documentation and API specs

**Team & Roles:**
- All engineers — Testing, QA, deployment
- Product Designer (Aniebiet Peter) — Onboarding flows, UX polish

**Funding Required:** Included in Phase 1 budget (internal)

**Timeline:** September 1–21, 2026

---

### Milestone 5: Filecoin Integration (Weeks 11–14, Parallel with Milestone 4) [GRANT-FUNDED]
**Deliverables:**
- Web3.storage SDK integration
- Document upload endpoint (deeds, certifications, surveys)
- IPFS/Filecoin storage pipeline
- Retrieve documents with automatic retry
- Solidity smart contract for deed verification
- On-chain agent certification registry
- "Verified Land Records" UI with IPFS hash badges
- Ownership history audit tool
- Impact dashboard (documents on Filecoin, deal redundancy, retrieval stats)
- Quarterly impact reports

**Team & Roles:**
- Backend Engineer (Ubongabasi Jerome) — Web3.storage integration
- Blockchain Engineer (Contractor) — Smart contract development, auditing
- Full-Stack Developer (Unsteady Teddy) — UI for blockchain features
- Product Designer (Aniebiet Peter) — "Verified Records" UI/UX

**Funding Required:** $25,000 (Filecoin grant)

**Timeline:** October 1–31, 2026

---

## Total Budget Requested

| Milestone | Description | Deliverables | Completion Date | Funding |
|-----------|-------------|---------------|-----------------|---------|
| 1 | Backend Infrastructure & Auth | PostgreSQL, Express API, OAuth, email/OTP, Docker, CI/CD | July 21, 2026 | Internal |
| 2 | Listings & Marketplace | CRUD, search, S3 images, agent profiles, reviews | August 10, 2026 | Internal |
| 3 | Conversations, Bookings, Notifications | Messaging, inspections, push/email, job queue | September 1, 2026 | Internal |
| 4 | Testing, Deployment, MVP Launch | Tests, security, deployment, soft launch (500 users) | September 21, 2026 | Internal |
| 5 | Filecoin Integration [GRANT] | Web3.storage, smart contracts, Verified Records UI, impact reporting | October 31, 2026 | **$25,000** |

**Phase 1 (Milestones 1–4) Budget:** Internal/Founder funding  
**Phase 2 (Milestone 5) Budget:** **$25,000 Filecoin Grant Request**

---

## Maintenance and Upgrade Plans

### Long-term Maintenance (Year 1–2)

**Ongoing Operations:**
- 24/7 monitoring and alerting (Sentry, DataDog)
- Weekly security patches and updates
- Monthly performance optimization
- Quarterly database backups to Filecoin
- Community support (Discord, email)

**Continuous Improvements:**
- User feedback implementation (monthly releases)
- Feature additions based on user needs
- Integration with new payment providers (Paystack expansion)
- Government integration support
- API v2 planning for B2B partners

### Year 2+ Scaling

**Technology:**
- Migrate to microservices if needed
- Add GraphQL API option
- Web3 wallet integration (MetaMask, etc.)
- IPFS pinning service for redundancy
- Advanced analytics on Filecoin deal performance

**Filecoin Specific:**
- Implement Filecoin retrieval incentives
- On-chain governance for land disputes
- Cross-chain support (Ethereum, Polygon)
- Advanced smart contracts for automated transactions
- Research partnerships with Protocol Labs

**Business:**
- White-label solution for real estate companies
- Government contract negotiations
- International expansion (Ghana, Kenya, South Africa)
- API licensing for banks and fintech partners
- Training and certification programs for agents

---

# Team

## Team Members

- **Arinze Obasi** — Lead Full-Stack Developer
- **Unsteady Teddy (Raphael James)** — Full-Stack Developer
- **Ubongabasi Jerome** — Backend Developer
- **Godspower Ufot** — Engineering Intern
- **Aniebiet Peter** — Product Designer

## Team Member GitHub Profiles

- Arinze Obasi: https://github.com/Remy-Arinze
- Unsteady Teddy (Raphael James): https://github.com/Raphaelj1
- Ubongabasi Jerome: https://github.com/ubyjerome
- Godspower Ufot: https://github.com/godspowerufot
- Aniebiet Peter: [GitHub profile link]

## Team LinkedIn Profiles

- Arinze Obasi: https://www.linkedin.com/in/arinze-obasi-161618233/
- Unsteady Teddy (Raphael James): [LinkedIn profile]
- Ubongabasi Jerome: https://linkedin.com/in/ubongabasi-jerome
- Godspower Ufot: https://www.linkedin.com/in/godspower-ufot-1b0967363
- Aniebiet Peter: https://www.linkedin.com/in/aniebiet-peter-5ba80323a

## Team Website

https://www.landrushafrica.com/

## Team Code Repository

https://github.com/Landrush-ltd

---

## Relevant Experience

**Combined Experience:** 17+ years of full-stack engineering and product development

**Relevant Projects:**
- Prembly (200K+ users) — Built NIN verification system (Kenneth Umoekpe)
- Real estate marketplace prototypes (Kenneth + Arinze)
- Mobile-first applications at scale (Unsteady Teddy)
- PostgreSQL/backend architecture for fintech (Ubongabasi Jerome)
- Design systems and user research (Aniebiet Peter)

**Why We're the Right Team:**
1. **Proven execution** — Built Prembly to 200K users in emerging markets
2. **Domain expertise** — Prior work in Nigerian fintech and real estate
3. **Full-stack capability** — Mobile, backend, design, DevOps all in-house
4. **Africa-first mindset** — Understand Nigerian market, regulations, user behavior
5. **Blockchain ready** — Team actively learning Filecoin/IPFS, committed to blockchain integration

---

# Additional Information

## How Did You Learn About the Open Grants Program?

Filecoin Foundation's commitment to supporting real-world use cases in Africa and emerging markets. Landrush's land registry use case aligns perfectly with Filecoin's mission to decentralize the internet and prove blockchain viability in critical infrastructure.

## Contact Email

**kennethumoekpe@gmail.com**

## Additional Context

**Landing Page:** https://www.landrushafrica.com/ — Showcases product vision and team  
**GitHub Organization:** https://github.com/Landrush-ltd — Full codebase open source  
**Timeline:** MVP launching July 2026; Filecoin integration October 2026  
**Social Impact:** Solution directly addresses $400B+ land fraud problem in Nigeria and across Africa  
**Grant Leverage:** $25K grant funds Phase 2; Phase 1 ($150K+) funded internally  
**Success Metrics:** 100+ deeds on Filecoin, 99.5% uptime, 5+ media articles by EOY 2026
