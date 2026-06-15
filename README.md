# Shortify — URL Shortener

A full-stack URL shortener with link analytics, QR codes, custom aliases, expiry dates, and a modern dark-mode dashboard.

---

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Assumptions Made](#assumptions-made)
- [AI Planning Document](#ai-planning-document)
- [Architecture Diagram](#architecture-diagram)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Security Features](#security-features)
- [Deployment Guide](#deployment-guide)
- [Sample Output](#sample-output)
- [Demo Video](#demo-video)

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (or local MongoDB >= 6)
- Git

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd url-shortener
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

**Backend** — copy `server/.env.example` to `server/.env` and fill in values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/urlshortener
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
BASE_URL=http://localhost:5000
```

**Frontend** — copy `client/.env.example` to `client/.env`:

```env
VITE_API_URL=http://localhost:5000
VITE_BASE_URL=http://localhost:5000
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend (from server/)
npm run dev

# Terminal 2 — Frontend (from client/)
npm run dev
```

Visit: **http://localhost:5173**

### 5. Build for Production

```bash
# Frontend production build
cd client
npm run build
```

---

## Assumptions Made

1. **Authentication is required** — all URL management and analytics features are behind JWT-authenticated routes. Public users can only follow short links.

2. **MongoDB Atlas** is the assumed database host. A local MongoDB instance also works by pointing `MONGO_URI` to `mongodb://localhost:27017/urlshortener`.

3. **Short codes are globally unique** — generated via `nanoid` (7 characters, URL-safe alphabet). Collision probability is negligible at typical scale.

4. **Custom aliases are optional** — if not provided, a random short code is generated. Custom aliases must be unique across all users.

5. **Link expiry is date-based** — expiry is checked at redirect time. No background cron job cleans up expired links; they simply stop redirecting.

6. **Analytics are best-effort** — visitor metadata (browser, OS, device, country) is parsed from `User-Agent` and `CF-IPCountry` headers. Missing headers result in `"Unknown"` values, not errors.

7. **Single-user ownership** — each URL belongs to the user who created it. There is no sharing, teams, or admin role in the current scope.

8. **No email verification** — registration is immediate. Email uniqueness is enforced at the database level.

9. **QR codes are generated client-side** — using the `qrcode` npm package in the browser, requiring no server-side image generation.

10. **CORS is restricted** — the backend only accepts requests from the origin set in `CLIENT_URL`. This must be updated when deploying to production.

---

## AI Planning Document

### Problem Statement

Build a production-ready URL shortener that allows authenticated users to create, manage, and analyse short links with features comparable to services like Bitly.

### Feature Planning

| Priority | Feature                        | Approach                                              |
|----------|--------------------------------|-------------------------------------------------------|
| P0       | URL shortening                 | nanoid short code, stored in MongoDB                  |
| P0       | User authentication            | JWT (register / login / protected routes)             |
| P0       | Redirect with analytics        | Express catch-all route, Visit document per hit       |
| P1       | Dashboard (CRUD)               | React table with copy, QR, edit, delete actions       |
| P1       | Custom aliases                 | Optional field, unique sparse index                   |
| P1       | Link expiry                    | Optional date field, checked at redirect time         |
| P1       | QR code generation             | Client-side `qrcode` canvas → PNG download            |
| P2       | Analytics page                 | Recharts: daily clicks line, browser/device/country   |
| P2       | Link enable / disable toggle   | `status` field: `active` / `disabled`                 |

### Technical Decisions

- **React + Vite + TypeScript** for fast frontend dev with type safety.
- **Tailwind CSS** for utility-first dark-mode UI without a component library dependency.
- **Express.js** chosen over NestJS to keep the server lightweight and straightforward for a hackathon scope.
- **Mongoose** for schema validation and indexing rather than raw MongoDB driver.
- **JWT in Authorization header** (Bearer) rather than cookies to simplify CORS and mobile/API client usage.
- **nanoid v3** (CommonJS-compatible) used instead of v4+ (ESM-only) to avoid transpile complexity in the Node.js CommonJS server.
- **Recharts** for analytics charts — composable and React-native, no D3 boilerplate.
- **ua-parser-js** for server-side User-Agent parsing to capture browser/OS/device metadata per visit.

### Development Phases

**Phase 1 — Core Backend**
- Express app scaffolding with Helmet, CORS, Morgan, rate limiter
- MongoDB models: User, Url, Visit
- Auth routes: register, login, /me
- URL CRUD routes with JWT protection
- Redirect controller with Visit logging

**Phase 2 — Core Frontend**
- Vite + React + TypeScript + Tailwind setup
- AuthContext with JWT persistence in localStorage
- Login / Register pages
- Dashboard with UrlForm and UrlTable
- Axios service layer with interceptors

**Phase 3 — Advanced Features**
- Custom alias support
- Link expiry and enable/disable toggle
- QR code modal with canvas download
- Edit URL modal
- Toast notification system

**Phase 4 — Analytics**
- Analytics aggregation in MongoDB (groupBy date, browser, device, country)
- Analytics page with Recharts line, pie, and bar charts
- Skeleton loaders and error states

**Phase 5 — Polish & Security**
- Input validation with express-validator on all endpoints
- Centralised error handler (no stack traces in production)
- Responsive dark-mode UI
- ErrorPage for not-found / disabled / expired link states

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Browser (User)                                │
└───────────────────────────────┬──────────────────────────────────────┘
                                │ HTTPS
          ┌─────────────────────▼──────────────────────┐
          │          React + Vite (Client)              │
          │                                             │
          │  ┌──────────┐  ┌───────────┐  ┌─────────┐  │
          │  │  Login / │  │ Dashboard │  │Analytics│  │
          │  │ Register │  │  (CRUD)   │  │  Page   │  │
          │  └──────────┘  └───────────┘  └─────────┘  │
          │         │            │              │        │
          │         └────────────┼──────────────┘        │
          │                      │                        │
          │            ┌─────────▼──────────┐            │
          │            │   Axios API Layer   │            │
          │            │  (services/api.ts)  │            │
          │            └─────────┬──────────┘            │
          │                      │ Bearer JWT             │
          └──────────────────────┼────────────────────────┘
                                 │ REST / HTTP
          ┌──────────────────────▼────────────────────────┐
          │              Express.js (Server)               │
          │                                                │
          │  ┌─────────┐ ┌──────────┐ ┌────────────────┐  │
          │  │ Helmet  │ │   CORS   │ │  Rate Limiter  │  │
          │  └─────────┘ └──────────┘ └────────────────┘  │
          │                                                │
          │  ┌──────────────────────────────────────────┐  │
          │  │              Routes                       │  │
          │  │  /api/auth  →  authController             │  │
          │  │  /api/urls  →  urlController              │  │
          │  │  /api/analytics → analyticsController     │  │
          │  │  /:shortCode  →  redirectController       │  │
          │  └──────────────────────────────────────────┘  │
          │                                                │
          │  ┌──────────────────────────────────────────┐  │
          │  │           Middleware Stack                │  │
          │  │   JWT Auth · Validate · ErrorHandler      │  │
          │  └──────────────────────────────────────────┘  │
          │                                                │
          │  ┌──────────────────────────────────────────┐  │
          │  │             Services                      │  │
          │  │  shortCodeService · analyticsService      │  │
          │  └──────────────────────────────────────────┘  │
          └──────────────────────┬────────────────────────┘
                                 │ Mongoose ODM
          ┌──────────────────────▼────────────────────────┐
          │                 MongoDB Atlas                   │
          │                                                │
          │   ┌──────────┐  ┌──────────┐  ┌───────────┐   │
          │   │  Users   │  │   Urls   │  │  Visits   │   │
          │   └──────────┘  └──────────┘  └───────────┘   │
          └────────────────────────────────────────────────┘
```

### Request Flow — Short Link Redirect

```
User clicks short link
        │
        ▼
GET /:shortCode  (Express)
        │
        ▼
redirectController
  ├── Find Url by shortCode
  ├── Check: exists?      → No  → redirect /not-found
  ├── Check: status?      → disabled → redirect /link-disabled
  ├── Check: expiryDate?  → expired  → redirect /link-expired
  ├── Increment clickCount + update lastVisited
  ├── Log Visit (browser, OS, device, country, referrer, ip)
  └── 301 redirect → originalUrl
```

### Request Flow — Authenticated API

```
Client Request
      │
      ▼
Axios (attaches Authorization: Bearer <token>)
      │
      ▼
Express Route
      │
      ▼
auth middleware (verifyToken → attach req.user)
      │
      ▼
validate middleware (express-validator)
      │
      ▼
Controller (scoped to req.user.id)
      │
      ▼
MongoDB (Mongoose)
      │
      ▼
JSON Response
```

---

## Database Schema

### User
| Field        | Type   | Notes             |
|--------------|--------|-------------------|
| name         | String | required, max 50  |
| email        | String | unique, lowercase |
| passwordHash | String | bcrypt, hidden    |
| createdAt    | Date   | auto              |

### Url
| Field       | Type     | Notes                  |
|-------------|----------|------------------------|
| userId      | ObjectId | ref User               |
| originalUrl | String   | required               |
| shortCode   | String   | unique, indexed        |
| customAlias | String   | nullable, sparse index |
| clickCount  | Number   | default 0              |
| expiryDate  | Date     | nullable               |
| status      | String   | active / disabled      |
| lastVisited | Date     | nullable               |
| createdAt   | Date     | auto                   |

### Visit
| Field     | Type     | Notes                 |
|-----------|----------|-----------------------|
| urlId     | ObjectId | ref Url, indexed      |
| timestamp | Date     | indexed               |
| browser   | String   |                       |
| os        | String   |                       |
| device    | String   | desktop/mobile/tablet |
| country   | String   | via CF-IPCountry      |
| referrer  | String   |                       |
| ip        | String   |                       |

---

## API Documentation

### Auth

#### POST /api/auth/register
```json
Request:  { "name": "Jane", "email": "jane@example.com", "password": "secret123" }
Response: { "success": true, "token": "...", "user": { "id": "...", "name": "Jane", "email": "..." } }
```

#### POST /api/auth/login
```json
Request:  { "email": "jane@example.com", "password": "secret123" }
Response: { "success": true, "token": "...", "user": { ... } }
```

#### GET /api/auth/me *(protected)*
```json
Response: { "success": true, "user": { "id": "...", "name": "...", "email": "..." } }
```

### URLs *(all protected)*

#### POST /api/urls
```json
Request:  { "originalUrl": "https://example.com", "customAlias": "my-link", "expiryDate": "2025-12-31" }
Response: { "success": true, "data": { ...Url } }
```

#### GET /api/urls
```json
Response: { "success": true, "data": [ ...Url ] }
```

#### PUT /api/urls/:id
```json
Request:  { "originalUrl": "https://new.com", "status": "disabled", "expiryDate": null }
Response: { "success": true, "data": { ...Url } }
```

#### DELETE /api/urls/:id
```json
Response: { "success": true, "message": "URL deleted" }
```

### Analytics *(protected)*

#### GET /api/analytics/:urlId
```json
Response: {
  "success": true,
  "data": {
    "url": { ...Url },
    "totalClicks": 120,
    "lastVisited": "2025-01-15T10:30:00Z",
    "topBrowsers":  [ { "name": "Chrome", "count": 80 } ],
    "topDevices":   [ { "name": "desktop", "count": 95 } ],
    "topCountries": [ { "name": "IN", "count": 60 } ],
    "dailyClicks":  [ { "date": "2025-01-15", "count": 12 } ]
  }
}
```

### Redirect

#### GET /:shortCode
Redirects `301` to the original URL. On error redirects to:
- `/not-found` — short code does not exist
- `/link-disabled` — link is disabled by owner
- `/link-expired` — link has passed its expiry date

---

## Project Structure

```
url-shortener/
├── client/                          # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyticsChart.tsx   # Recharts: Line, Pie, Bar
│   │   │   ├── EditUrlModal.tsx     # Edit destination/status/expiry
│   │   │   ├── Loaders.tsx          # Spinner, Skeleton, PageLoader
│   │   │   ├── Navbar.tsx           # Top navigation
│   │   │   ├── ProtectedRoute.tsx   # Auth guard
│   │   │   ├── QRModal.tsx          # QR code view + download
│   │   │   ├── Toast.tsx            # Toast notifications
│   │   │   ├── UrlForm.tsx          # Create short URL form
│   │   │   ├── UrlTable.tsx         # URL management table
│   │   │   └── index.ts             # Barrel exports
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Auth state + JWT
│   │   ├── hooks/
│   │   │   ├── useUrls.ts           # URL CRUD + state
│   │   │   └── useToast.ts          # Toast notification state
│   │   ├── pages/
│   │   │   ├── Analytics.tsx        # Analytics detail page
│   │   │   ├── Dashboard.tsx        # Main URL management
│   │   │   ├── ErrorPage.tsx        # 404 / expired / disabled
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── services/
│   │   │   └── api.ts               # Axios instance + all API calls
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── helpers.ts           # Date, URL, copy utilities
│   │   ├── App.tsx                  # Router + layout
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind + custom classes
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── server/                          # Express.js backend
    ├── controllers/
    │   ├── analyticsController.js   # Analytics with MongoDB aggregation
    │   ├── authController.js        # Register / Login / Me
    │   ├── redirectController.js    # Short URL resolution + redirect
    │   └── urlController.js         # URL CRUD
    ├── middleware/
    │   ├── auth.js                  # JWT protect middleware
    │   ├── errorHandler.js          # Global error handler
    │   ├── rateLimiter.js           # API + auth rate limits
    │   └── validate.js              # express-validator result check
    ├── models/
    │   ├── Url.js
    │   ├── User.js
    │   └── Visit.js
    ├── routes/
    │   ├── analyticsRoutes.js
    │   ├── authRoutes.js
    │   └── urlRoutes.js
    ├── services/
    │   ├── analyticsService.js      # UA parser, visitor metadata
    │   └── shortCodeService.js      # nanoid short code generator
    ├── utils/
    │   ├── errors.js                # AppError class + catchAsync
    │   └── jwt.js                   # signToken / verifyToken
    ├── validators/
    │   ├── authValidator.js
    │   └── urlValidator.js
    ├── .env.example
    ├── app.js                       # Express entry point
    └── package.json
```

---

## Security Features

| Feature           | Implementation                          |
|-------------------|-----------------------------------------|
| Password hashing  | bcrypt with salt rounds = 12            |
| JWT auth          | HS256, 7d expiry, Bearer token          |
| Rate limiting     | 100 req/15min API, 10 req/15min auth    |
| HTTP headers      | Helmet (15+ security headers)           |
| CORS              | Restricted to CLIENT_URL env var        |
| Input validation  | express-validator on all endpoints      |
| Error handling    | Centralised, no stack traces in prod    |
| User isolation    | All queries scoped to `userId`          |

---

## Deployment Guide

### Backend → Render

1. Push `server/` to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Build command: `npm install` | Start command: `node app.js`
4. Add all environment variables from `.env.example`
5. Deploy

### Frontend → Vercel

1. Push `client/` to GitHub
2. Import on [Vercel](https://vercel.com), preset: **Vite**
3. Set `VITE_API_URL` and `VITE_BASE_URL` to your Render backend URL
4. Deploy

### Database → MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` in Network Access
3. Create a database user and copy the connection string into `MONGO_URI`

---

## Environment Variables Reference

| Variable       | Location | Required | Description                       |
|----------------|----------|----------|-----------------------------------|
| PORT           | server   | No       | Server port (default 5000)        |
| NODE_ENV       | server   | Yes      | development / production          |
| MONGO_URI      | server   | Yes      | MongoDB connection string         |
| JWT_SECRET     | server   | Yes      | Secret for signing JWT tokens     |
| JWT_EXPIRES_IN | server   | No       | Token expiry (default 7d)         |
| CLIENT_URL     | server   | Yes      | Frontend origin for CORS          |
| BASE_URL       | server   | Yes      | Used to build short URLs          |
| VITE_API_URL   | client   | Yes      | Backend API base URL              |
| VITE_BASE_URL  | client   | Yes      | Backend base URL for short links  |

---

## Sample Output

### Server Startup

```
[DB] MongoDB connected
[Server] Running on port 5000
```

---

### POST /api/auth/register

**Request**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `201`**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NzFhYjEyMzQ1Njc4OTBhYmNkZWYwMSIsImlhdCI6MTcxODgwMDAwMH0.abc123",
  "user": {
    "id": "6671ab1234567890abcdef01",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

**Validation Error `400`**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Must be a valid email address" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

---

### POST /api/auth/login

**Request**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NzFhYjEyMzQ1Njc4OTBhYmNkZWYwMSIsImlhdCI6MTcxODgwMDAwMH0.abc123",
  "user": {
    "id": "6671ab1234567890abcdef01",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

**Wrong Credentials `401`**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### GET /api/auth/me

**Response `200`**
```json
{
  "success": true,
  "user": {
    "id": "6671ab1234567890abcdef01",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

**Unauthorised `401`**
```json
{
  "success": false,
  "message": "No token provided"
}
```

---

### POST /api/urls — Create Short URL

**Request**
```json
{
  "originalUrl": "https://www.example.com/some/very/long/path?ref=newsletter",
  "customAlias": "my-link",
  "expiryDate": "2025-12-31"
}
```

**Response `201`**
```json
{
  "success": true,
  "data": {
    "_id": "6671cd5678901234abcdef02",
    "userId": "6671ab1234567890abcdef01",
    "originalUrl": "https://www.example.com/some/very/long/path?ref=newsletter",
    "shortCode": "my-link",
    "customAlias": "my-link",
    "shortUrl": "http://localhost:5000/my-link",
    "clickCount": 0,
    "status": "active",
    "expiryDate": "2025-12-31T00:00:00.000Z",
    "lastVisited": null,
    "createdAt": "2025-01-15T08:00:00.000Z"
  }
}
```

**Alias Already Taken `400`**
```json
{
  "success": false,
  "message": "Custom alias already in use"
}
```

---

### GET /api/urls — List All URLs

**Response `200`**
```json
{
  "success": true,
  "data": [
    {
      "_id": "6671cd5678901234abcdef02",
      "originalUrl": "https://www.example.com/some/very/long/path?ref=newsletter",
      "shortCode": "my-link",
      "shortUrl": "http://localhost:5000/my-link",
      "clickCount": 42,
      "status": "active",
      "expiryDate": "2025-12-31T00:00:00.000Z",
      "lastVisited": "2025-01-20T14:22:10.000Z",
      "createdAt": "2025-01-15T08:00:00.000Z"
    },
    {
      "_id": "6671ef9012345678abcdef03",
      "originalUrl": "https://github.com/jane/repo",
      "shortCode": "Ab3xY7z",
      "shortUrl": "http://localhost:5000/Ab3xY7z",
      "clickCount": 8,
      "status": "active",
      "expiryDate": null,
      "lastVisited": "2025-01-19T09:10:05.000Z",
      "createdAt": "2025-01-16T12:30:00.000Z"
    }
  ]
}
```

---

### PUT /api/urls/:id — Update URL

**Request**
```json
{
  "originalUrl": "https://www.updated-example.com",
  "status": "disabled",
  "expiryDate": null
}
```

**Response `200`**
```json
{
  "success": true,
  "data": {
    "_id": "6671cd5678901234abcdef02",
    "originalUrl": "https://www.updated-example.com",
    "shortCode": "my-link",
    "shortUrl": "http://localhost:5000/my-link",
    "clickCount": 42,
    "status": "disabled",
    "expiryDate": null,
    "lastVisited": "2025-01-20T14:22:10.000Z",
    "createdAt": "2025-01-15T08:00:00.000Z"
  }
}
```

---

### DELETE /api/urls/:id

**Response `200`**
```json
{
  "success": true,
  "message": "URL deleted"
}
```

**Not Found `404`**
```json
{
  "success": false,
  "message": "URL not found"
}
```

---

### GET /api/analytics/:urlId

**Response `200`**
```json
{
  "success": true,
  "data": {
    "url": {
      "_id": "6671cd5678901234abcdef02",
      "originalUrl": "https://www.example.com/some/very/long/path?ref=newsletter",
      "shortCode": "my-link",
      "shortUrl": "http://localhost:5000/my-link",
      "clickCount": 42,
      "status": "active"
    },
    "totalClicks": 42,
    "lastVisited": "2025-01-20T14:22:10.000Z",
    "topBrowsers": [
      { "name": "Chrome",  "count": 28 },
      { "name": "Firefox", "count": 9  },
      { "name": "Safari",  "count": 5  }
    ],
    "topDevices": [
      { "name": "desktop", "count": 30 },
      { "name": "mobile",  "count": 10 },
      { "name": "tablet",  "count": 2  }
    ],
    "topCountries": [
      { "name": "IN", "count": 20 },
      { "name": "US", "count": 12 },
      { "name": "GB", "count": 10 }
    ],
    "dailyClicks": [
      { "date": "2025-01-15", "count": 5  },
      { "date": "2025-01-16", "count": 8  },
      { "date": "2025-01-17", "count": 3  },
      { "date": "2025-01-18", "count": 11 },
      { "date": "2025-01-19", "count": 9  },
      { "date": "2025-01-20", "count": 6  }
    ]
  }
}
```

---

### GET /:shortCode — Redirect

**Success** — HTTP `301` redirect to `https://www.example.com/some/very/long/path?ref=newsletter`

**Link not found** — HTTP `302` redirect to `http://localhost:5173/not-found`

**Link disabled** — HTTP `302` redirect to `http://localhost:5173/link-disabled`

**Link expired** — HTTP `302` redirect to `http://localhost:5173/link-expired`

---

### GET /api/health

**Response `200`**
```json
{ "status": "ok" }
```

---

### Rate Limit Exceeded `429`

```json
{
  "success": false,
  "message": "Too many requests, please try again later."
}
```

---

## Demo Video

> 📹 [Watch the demo on Loom](https://www.loom.com/share/b2109ea816b648f28845fecac0a36e01)

> 📹 [Watch the demo on Loom](https://www.loom.com/share/a39d43008f7f451d804321ff1d94d75a)

---

This project is a part of a hackathon run by https://katomaran.com
