# MentorConnect

MentorConnect connects people who want to grow with experienced mentors. The repository is being rebuilt from its original React/Vite + Express/SQLite application into a Next.js and Supabase platform. The legacy `frontend/` and `backend/` folders are retained as a reference while the new application is built in `src/`.

## Current architecture

- Next.js App Router, React, and TypeScript
- Tailwind CSS 4 and reusable page components
- Supabase Auth with cookie-based sessions through `@supabase/ssr`
- PostgreSQL schema with row-level security, status-transition checks, review uniqueness, and booking-conflict constraints
- Zod validation for auth, profiles, availability, reviews, and session requests
- React Hook Form and Lucide icons

## Local development

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

The development server runs on `http://localhost:3001` so Supabase confirmation links use the same port. Add your Supabase project URL and publishable key to `.env.local` to enable authentication and database-backed screens:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

The publishable key is designed for client use; row-level security protects database rows. Never put a Supabase service-role key in a `NEXT_PUBLIC_` variable or browser code.

## Database setup

The proposed initial schema is in `supabase/migrations/0001_initial_schema.sql`. It creates the auth-linked profiles, mentor and mentee profiles, normalized skills and categories, availability, mentoring sessions, notifications, and reviews. It enables row-level security and adds database rules for session ownership, lifecycle transitions, duplicate reviews, and overlapping bookings.

The schema has **not** been applied to a Supabase project. Review it, create a new Supabase project, then apply the migration using your approved workflow. Optional starting categories and skills are in `supabase/seed.sql`; it creates no sample users or passwords.

For admin onboarding, `public.grant_admin_role(uuid)` is restricted to trusted database operators/service-role access. Do not expose a service-role key to the browser.

## Authentication and redirects

Configure Supabase Auth’s site URL as `http://localhost:3001`. Add the local callback URL (`http://localhost:3001/auth/callback`) and the production callback URL to the allowed redirect URLs. Email confirmation and password-reset messages are sent by Supabase Auth.

Registration permits only `mentee` and `mentor`. Admin assignment is a trusted operator action. Dashboard routes check the signed-in user and application role on the server; RLS and database constraints enforce ownership independently of the UI.

## Main routes

- `/` — public landing page
- `/mentors` — database-backed mentor search and filters
- `/mentors/[mentorId]` — mentor details, availability, reviews, and session request
- `/login`, `/register`, `/forgot-password`, `/reset-password` — account access
- `/resend-confirmation` — resend a signup confirmation email using the configured local callback URL
- `/dashboard/mentee` — mentee sessions, learning time, and notifications
- `/dashboard/mentor` — requests, upcoming sessions, reviews, and notifications
- `/dashboard/mentor/profile` and `/dashboard/mentee/profile` — profile management
- `/dashboard/mentor/availability` — recurring weekly availability

The core session flow is request → mentor approval, rejection, or proposed time → mentee confirmation → completion → verified review. Notifications are created by database triggers and refreshed on the dashboard.

## Quality checks

```bash
npm run lint
npm run build
npm audit --omit=dev
```

The build script uses webpack because Turbopack worker subprocesses failed in the Windows sandbox used during development. A complete live-flow and RLS test still requires a configured Supabase project; the repository does not include real demo credentials.

## Legacy implementation

The original application source remains in `frontend/` and `backend/` for business-logic reference. Its README, SQLite schema, and endpoint code described features that were not all enforced consistently. The rebuild does not run the old database setup or reset scripts and does not modify any existing SQLite database.
