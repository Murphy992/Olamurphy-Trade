# Olamurphy Trade — Multi-user demo platform starter

A Next.js + Supabase starter for separate customer accounts and a protected admin user list.

## What is implemented
- Email/password sign-up and sign-in through Supabase Auth
- Database trigger creates a profile and an individual virtual $10,000 wallet
- Customer can read only their own wallet and activity
- Demo BUY action is an atomic Postgres RPC; users cannot directly edit wallet balances
- Admin can read the registered user list when their role is manually promoted
- Responsive black-and-gold interface

## 1. Create Supabase project
Create a project at https://supabase.com. In Project Settings / API, copy the Project URL and publishable (or anon) key.

## 2. Configure environment
Copy .env.example to .env.local and fill in your Supabase values:NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLIC_PUBLISHABLE_OR_ANON_KEY
Never put a Supabase service_role or secret key in a browser app or commit it to source control.

## 3. Create database
In Supabase Dashboard -> SQL Editor, run the complete supabase/schema.sql script.

## 4. Run locally
Install Node.js 20 or newer, then in this folder:npm install
npm run dev
Open http://localhost:3000.

## 5. Create your administrator
1. Register your own account through the website.
2. In Supabase Dashboard -> Authentication -> Users, locate your account and copy its UUID.
3. In SQL Editor run:update public.profiles
set role = 'admin'
where id = 'YOUR-USER-UUID';
4. Sign out and sign in again. The admin user list should appear.

Do not make an admin by accepting a role field from public registration. Only promote trusted accounts manually using the database console.

## Important limitations before production
This is a development starter, not a production financial platform:
- Demo quotes are not live market data; no exchange or broker is connected.
- Only simulated BUY actions are implemented; no sells, matching engine, custody or withdrawals.
- No real deposits, payments, investment products, yield, or customer funds.
- No KYC/AML, fraud monitoring, rate limiting, email workflows, audit/compliance console, backups, incident response or independent security audit.
- Add Supabase email confirmation, password reset, CAPTCHA/rate limiting, MFA for admins, monitoring and tested backup/restore before wider testing.
- Review and test all RLS policies and database functions with separate customer/admin test accounts.
- Obtain Nigerian legal and regulatory advice and required approvals before offering regulated financial or digital-asset services.

The UI and database deliberately label all balances and activity as demo/virtual.
