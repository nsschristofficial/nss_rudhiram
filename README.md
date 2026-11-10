# RUDHIRAM – A Centralised Blood Donor Portal
### National Service Scheme (NSS Units 20 & 49)
### Christ College (Autonomous), Irinjalakuda
#### Affiliated with the University of Calicut | Accredited with NAAC 'A++' Grade

> *"RESPOND. REGISTER. DONATE. BECAUSE HUMANITY FLOWS IN ALL OF US."*

---

## 1. Project Overview

**RUDHIRAM** is an institutional digital blood donation and coordination management portal developed for the **National Service Scheme (NSS Units 20 & 49)** of **Christ College (Autonomous), Irinjalakuda**. 

The platform bridges voluntary blood donors with patients and hospitals across Irinjalakuda, Thrissur district, and surrounding regions in Central Kerala.

### Core Objectives:
1. **Voluntary Donor Registration**: Streamlined, mobile-first registration for student and community voluntary donors.
2. **Private Blood Assistance Requests**: A structured form for families, attender relatives, and hospitals to submit blood needs with clinical urgency levels (Normal, Urgent, Emergency).
3. **Smart Donor Matching Engine**: Administrative matching tool pairing compatible RBC blood groups, proximity, and mandatory donation interval (&ge; 90 days), with one-click WhatsApp prefilled templates and direct calling.
4. **Zero Public Disclosure Security Architecture**: Donor lists, private contact numbers, and patient details are strictly protected behind PostgreSQL Row Level Security (RLS) and cryptographic administrator sessions.

---

## 2. Technology Stack

- **Framework**: Next.js 14+ (App Router, Server-Side API Routes, Server Actions, Middleware)
- **Language**: TypeScript throughout with strict typing
- **Styling**: Tailwind CSS with custom institutional palette (Deep Blood Red `#A50021`, Charcoal `#242424`, Surface Grey)
- **Icons**: Lucide React
- **Database**: Supabase PostgreSQL (with dual-mode fallback repository for offline/local execution)
- **Security & Auth**: PostgreSQL Row Level Security (RLS), HMAC SHA-256 signed `httpOnly` sessions, server-side route guards, submission rate-limiting, and CSV formula injection sanitization.
- **Hosting Target**: Vercel + Supabase

---

## 3. Architecture & Directory Structure

```
c:\Users\User\Documents\NSS-Blood/
├── public/
│   └── images/
│       ├── christ-college-logo.jpg   # Official Christ College Crest
│       ├── nss-logo.png              # Official NSS Wheel Emblem
│       └── rudhiram-logo.jpg         # Rudhiram Banner Asset
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with institutional metadata
│   │   ├── page.tsx                  # Public landing homepage
│   │   ├── globals.css               # Design tokens, keyframes, scrollbars
│   │   ├── about/page.tsx            # College & NSS history
│   │   ├── how-it-works/page.tsx     # Eligibility & donation guidelines
│   │   ├── register/page.tsx         # Voluntary donor registration
│   │   ├── request/page.tsx          # Patient blood request submission
│   │   ├── contact/page.tsx          # Emergency desk, location & contacts
│   │   ├── privacy/page.tsx          # Data privacy & RLS policy
│   │   ├── admin/
│   │   │   ├── login/page.tsx        # Administrator authentication
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx        # Dashboard layout with sidebar
│   │   │       ├── page.tsx          # Live metrics & recent activities
│   │   │       ├── donors/page.tsx   # Full donor registry management
│   │   │       ├── requests/page.tsx # Hospital request management
│   │   │       ├── match/page.tsx    # Smart donor matching engine
│   │   │       ├── logs/page.tsx     # Security audit logs
│   │   │       ├── export/page.tsx   # CSV/Excel export engine
│   │   │       └── settings/page.tsx # Institutional config & keys
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── session/route.ts
│   │       ├── donors/
│   │       │   ├── route.ts          # Public POST (register), Admin GET
│   │       │   └── [id]/route.ts     # Admin PATCH, DELETE
│   │       ├── requests/
│   │       │   ├── route.ts          # Public POST (request), Admin GET
│   │       │   └── [id]/route.ts     # Admin PATCH, DELETE
│   │       ├── match/route.ts        # Admin donor matching
│   │       ├── stats/route.ts        # Admin calculated statistics
│   │       ├── logs/route.ts         # Admin activity logs
│   │       └── export/route.ts       # Admin CSV export with sanitization
│   ├── components/
│   │   ├── Navbar.tsx                # Public header with logos & links
│   │   ├── Footer.tsx                # Institutional footer with Calicut Univ info
│   │   ├── AdminSidebar.tsx          # Dashboard navigation
│   │   ├── AdminHeader.tsx           # Dashboard top bar & profile
│   │   ├── CompatibilityMatrix.tsx   # Interactive blood compatibility guide
│   │   ├── DonorRegistrationForm.tsx # Verified donor registration with confetti
│   │   └── BloodRequestForm.tsx      # Patient blood request form
│   ├── lib/
│   │   ├── auth/session.ts           # HMAC token signing & verification
│   │   ├── constants.ts              # Kerala districts, blood compatibility rules
│   │   ├── utils.ts                  # Date formatting, Indian phone validator, WhatsApp generator
│   │   ├── db/
│   │   │   ├── repository.ts         # Unified database repository layer
│   │   │   └── seedData.ts           # Realistic Christ College NSS seed data
│   │   └── supabase/
│   │       ├── client.ts             # Browser Supabase client
│   │       ├── server.ts             # SSR Supabase client
│   │       └── admin.ts              # Service-role Supabase client
│   ├── middleware.ts                 # Edge route protection for /admin/dashboard
│   └── types/index.ts                # TypeScript domain models
├── supabase/
│   └── migrations/
│       └── 20260101_init_rudhiram.sql# Complete PostgreSQL Schema & RLS DDL
├── .env.example                      # Environment variables template
├── .env.local                        # Local development variables
└── README.md                         # Documentation
```

---

## 4. Setup & Running Locally

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Administrator Login Credentials

For development and institutional access:
- **URL**: `/admin/login`
- **Email**: `admin@christcollegeijk.edu.in`
- **Password**: `NSSChrist#2026`

*(Alternatively, you can click the **Auto Fill** button on the login screen).*

---

## 6. Supabase PostgreSQL Setup & Deployment

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Open `supabase/migrations/20260101_init_rudhiram.sql` from this codebase, copy all contents, paste into the SQL editor, and click **Run**.
4. In Supabase **Project Settings &gt; API**, copy:
   - **Project URL** &rarr; `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** &rarr; `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** &rarr; `SUPABASE_SERVICE_ROLE_KEY`
5. Place these values in `.env.local` or in your Vercel Project Settings.

---

## 7. Security & Privacy Matrix

| Threat / Requirement | Technical Mitigation |
| :--- | :--- |
| **Public Data Scraping** | Public cannot read donors or requests. Strict RLS and 401 Unauthorized API responses. |
| **Session Hijacking / XSS** | Sessions use signed HMAC tokens stored in `httpOnly`, `SameSite=Lax`, `Secure` cookies. |
| **Route Tampering** | Edge Next.js `middleware.ts` automatically redirects unauthorized users to `/admin/login`. |
| **Spam / Bot Submissions** | IP cooldown rate-limiting and server-side regex validation on all inputs. |
| **CSV Formula Injection** | Cells starting with `=`, `+`, `-`, `@` are safely prefixed with apostrophes. |
| **Audit Compliance** | All administrative actions (logins, status changes, deletions, exports) are recorded in `activity_logs`. |

---

## 8. Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. In [vercel.com](https://vercel.com), click **Add New Project** and select this repository.
3. Add the environment variables from `.env.example`.
4. Deploy! Next.js will automatically detect and deploy the application.
