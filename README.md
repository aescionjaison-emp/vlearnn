# VLEARNN — Complete Production-Ready Institute Website

A production-grade web platform and admissions lead management system for **VLEARNN**, an IT and technical education institute. Built with Next.js App Router, Express REST API, PostgreSQL, Prisma ORM, and integrated with transactional email (Resend) and WhatsApp click-to-chat.

---

## 1. Project Overview

VLEARNN delivers cohort-based technical training in Artificial Intelligence, Full Stack Web Engineering, Cloud Infrastructure & DevOps, and Data Analytics.

This repository is organized into a clean decoupled architecture:
```
VLEARNN/
├── Backend/          # Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
├── Frontend/         # Next.js 14 App Router + TypeScript + Tailwind CSS + Lucide Icons
├── .gitignore        # Root gitignore excluding secrets, node_modules, and logs
└── README.md         # Comprehensive project documentation
```

### Brand Design Palette
- **Deep Ink Navy:** `#172B4D`
- **Warm Paper:** `#F7F6F2`
- **White:** `#FFFFFF`
- **Muted Blue:** `#496A8A`
- **Warm Amber:** `#C88B3A`
- **Corner Radii:** Subtle 4–8px (`rounded-md` / `rounded-sm`)
- **Aesthetic:** Human-designed editorial layouts, generous whitespace, thin dividers, authentic photography placeholders, visible keyboard focus states.

---

## 2. Required Software & Prerequisites

- **Node.js:** v18.18+ or v20+ / v22+ / v24+
- **Package Manager:** `pnpm` (v9 or v10) or `npm` (v10+)
- **Database:** PostgreSQL (Supabase PostgreSQL, AWS RDS, or local PostgreSQL 15+)

---

## 3. Environment Setup

### A. Backend Configuration (`Backend/.env`)
Copy the provided example file:
```bash
cd Backend
cp .env.example .env
```

Configure your environment variables:
```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Connection String (Supabase or Local PostgreSQL)
# Example Supabase pooled connection:
# DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DATABASE_URL="postgresql://postgres@127.0.0.1:5433/vlearnn_db?schema=public"

# Authentication & Security
JWT_SECRET=replace_with_a_secure_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# Resend Transactional Email
# Obtain an API key from https://resend.com
RESEND_API_KEY=
EMAIL_FROM="VLEARNN Admissions <onboarding@resend.dev>"
ADMIN_NOTIFICATION_EMAIL=admin@vlearnn.com

# WhatsApp Admissions Phone (country code digits, no +)
WHATSAPP_NUMBER=919876543210
```

### B. Frontend Configuration (`Frontend/.env.local`)
Copy the provided example file:
```bash
cd Frontend
cp .env.example .env.local
```

Configure:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
```

---

## 4. Database Setup, Migrations & Seeding

VLEARNN uses standard PostgreSQL and Prisma ORM.

### Run Schema Migrations:
```bash
cd Backend
pnpm prisma db push
```

### Seed Default Database Records:
```bash
cd Backend
pnpm tsx prisma/seed.ts
```

The seed script automatically populates:
1. **Master Admin Account** (`admin@vlearnn.com` / `VlearnnAdmin2026!`)
2. **6 Core Course Categories** (AI, Full Stack, Cloud/DevOps, Data Analytics, Cybersecurity, Python Automation)
3. **Published Courses with Full Syllabi & Modules**
4. **1 Unpublished Course** (used to verify access protection)
5. **Initial Site Settings & Contact Details**
6. **Student FAQs**
7. **Authentic Alumni Testimonials**
8. **Faculty & Industry Mentor Profiles**
9. **Sample CRM Admissions Enquiries**

---

## 5. Admin Authentication & Role-Based Access Control (RBAC)

- **No Public Registration:** The administrator dashboard has zero public registration endpoints. All administrator accounts are provisioned via secure administrative seeds or direct staff provisioning.
- **Server-Verified Authentication:** Protected endpoints check cryptographic JWT tokens signed with `JWT_SECRET`, looking up active administrator records in the PostgreSQL `admin_users` table with `bcryptjs` password hashing (salt rounds: 10).
- **Default Master Admin Credentials:**
  - **Email:** `admin@vlearnn.com`
  - **Password:** `VlearnnAdmin2026!`
- **Role Permission Matrix:**

| Capability | `SUPER_ADMIN` | `ADMIN` | `EDITOR` |
| :--- | :---: | :---: | :---: |
| View Dashboard Metrics (`/api/admin/metrics`) | Yes | Yes | Yes |
| Course Catalog View & Edit | Yes | Yes | Yes |
| Course Creation & Module Editing | Yes | Yes | Yes |
| Safe Course Archival & Unpublishing | Yes | Yes | No |
| Category Management & Deletion | Yes | Yes | View/Edit Only |
| View Admissions Enquiries CRM | Yes | Yes | No |
| Update Enquiry Status & Private Notes | Yes | Yes | No |
| Dispatch Transactional Email Replies | Yes | Yes | No |
| Manage Site Content & Institute Settings | Yes | Yes | Yes |
| Manage FAQs & Testimonials | Full | Full | Create/Edit Only |

---

## 6. Admin Dashboard & Features

The admin control center provides a responsive interface with a dedicated sidebar, status pills, tables, search, filters, confirmation dialogs, and mobile drawers:

- **`/admin`**: Real-time pipeline KPI metrics computed live from PostgreSQL:
  - Total enquiries
  - New leads awaiting advisor contact
  - Pending follow-ups due
  - Enrolled students
  - Published active courses
  - Course-wise enquiry breakdown chart
  - Recent enquiries quick-action table
- **`/admin/courses`**: Complete Course CRUD with full module/syllabus management, drag-and-drop-style topic lists, duration, fees, eligibility, featured flags, publish/unpublish toggles, safe archival with relationship preservation, and public preview links.
- **`/admin/categories`**: Academic discipline categories with course counts, slug validation, and delete protections for categories with attached courses.
- **`/admin/enquiries`**: Lead CRM with search by ID, name, email, or phone; filtering by course and enquiry status; and pagination.
- **`/admin/enquiries/[id]`**: Deep lead detail CRM:
  - Student metadata and selected program
  - Enquiry status transitions (`NEW`, `CONTACTED`, `FOLLOW_UP`, `INTERESTED`, `ENROLLED`, `CLOSED`)
  - Private internal counselor notes (strictly isolated from public endpoints and student emails)
  - Date picker for scheduling follow-up dates
  - Chronological communication history combining student queries, counselor email replies, and system notifications
  - Modal with prefilled, editable WhatsApp click-to-chat links
  - Compose & send email reply via Resend
- **`/admin/content`**: Centralized institute branding, hero headlines, story, mission, vision, address, and social links.
- **`/admin/faq`**: Academic FAQ manager with display ordering and category grouping.
- **`/admin/testimonials`**: Verified student alumni quote management.
- **`/admin/settings`**: Integration diagnostics for PostgreSQL, Resend email status, and WhatsApp configuration.

---

## 7. Email Notifications & Resend Integration

1. **Admissions Enquiry Dispatch:** When a student submits an admissions enquiry on the public website, the enquiry is **persisted in PostgreSQL before attempting email delivery**.
2. **Admin Notification:** An email containing student details, selected course, and contact information is dispatched to `ADMIN_NOTIFICATION_EMAIL`.
3. **Dashboard Email Reply:** From `/admin/enquiries/[id]`, authorized administrators can compose and send email replies directly to the student.
4. **Audit Logging:** Every email attempt is recorded in `email_notifications` and `enquiry_messages` with timestamps, status (`SENT`, `FAILED`, `SKIPPED`), and provider message IDs.
5. **Missing Credentials Resilience:** If `RESEND_API_KEY` is omitted, the email service marks the status as `SKIPPED` in the database without failing the enquiry or throwing errors.

---

## 8. WhatsApp Click-to-Chat

- **Public Website:** Direct WhatsApp contact button and floating pill use `https://wa.me/<cleaned_phone>?text=<encoded_msg>`.
- **Admin CRM:** The "Reply on WhatsApp" modal normalizes the student's phone number with international country codes and prefills a personalized message mentioning their specific course and enquiry ID (`VL-ENQ-XXXX`).
- **Review Before Send:** Counselors can review and modify the message text before opening WhatsApp.

---

## 9. Real-Time Updates & Synchronization

- **Server-Sent Events (SSE):** The backend provides an event stream at `GET /api/admin/events/stream` broadcasting mutations (`new_enquiry`, `enquiry_status_updated`, `course_updated`, `site_settings_updated`).
- **Refetching & Polling Fallback:** The Next.js dashboard checks connection health and polls metrics every 30 seconds to ensure up-to-date counts without requiring page reloads.
- **Privacy Protection:** Private enquiry records and internal notes are never broadcast to public subscriptions or anonymous endpoints.

---

## 10. Local Development Commands

### Start the Backend API (Port 5000):
```bash
cd Backend
pnpm dev
```

### Start the Frontend Next.js App (Port 3000):
```bash
cd Frontend
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

---

## 11. Testing & Quality Verification

### Run Backend Integration Tests:
### Run Backend Automated Tests & Real-Time E2E Verification:
```bash
cd Backend
pnpm run build
pnpm test
pnpm tsx src/tests/e2eRealtimeVerification.ts
```
Runs the automated test suite testing:
- Public health checks (`/api/health`)
- Course listing queries and category filters
- Individual course lookups by slug
- Protection against accessing unpublished courses (returns 404)
- Form validation and PostgreSQL persistence
- Invalid course rejection
- Admin JWT authentication, invalid credentials rejection, and authorization guards
- Complete course creation, editing, publishing, unpublishing, and safe archival
- Enquiry CRM filtering, status transitions, private notes isolation, and email reply logging
- Site settings & FAQ creation, updating, and deletion
- Categories & Testimonials lifecycle testing
- Public Server-Sent Events (SSE) stream (`/api/events/stream`) testing
- Security: Anonymous client rejection on admin SSE stream (`/api/admin/events/stream` returns 401)
- Privacy: Public SSE clients never receive private student enquiry data
- Reconnect and transaction isolation verification


### Run Frontend Production Build:
```bash
cd Frontend
pnpm run build
```
Compiles and generates all 20 static and dynamic routes with zero TypeScript or ESLint errors.

---

## 12. Deployment Instructions

### Frontend (Vercel):
1. Connect the GitHub repository to Vercel.
2. Set root directory to `Frontend`.
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your hosted backend URL (e.g. `https://api.vlearnn.com/api`)
   - `NEXT_PUBLIC_SITE_URL`: Your production domain (e.g. `https://vlearnn.com`)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`: Institute WhatsApp number
4. Deploy.

### Backend (Node.js Host / Render / Railway / Fly.io):
1. Set root directory to `Backend`.
2. Build command: `pnpm install && pnpm prisma generate && pnpm run build`
3. Start command: `node dist/server.js`
4. Add Environment Variables from `Backend/.env.example`.
5. Run migrations: `pnpm prisma db push`

### Database (Supabase PostgreSQL):
1. Create a PostgreSQL project on [supabase.com](https://supabase.com).
2. Copy the Connection Pooling URL (port 6543) and Direct URL (port 5432).
3. Set `DATABASE_URL` in `Backend/.env`.
4. Execute `pnpm prisma db push && pnpm tsx prisma/seed.ts`.

---

## 13. Known Limitations & Out-of-Scope Items

1. **Inbound Email Webhooks:** Sending an email reply from an external mail app (like Outlook or Gmail) will not automatically appear inside the VLEARNN CRM unless inbound webhooks are mapped. Dashboard-initiated email replies via Resend are tracked in `enquiry_messages`.
2. **WhatsApp Direct API:** Click-to-chat uses `wa.me` links rather than the Meta WhatsApp Business Cloud API.
3. **No PGlite or in-memory databases:** Real PostgreSQL with foreign keys and ACID transactions is used across all environments.

