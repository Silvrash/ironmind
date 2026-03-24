# IronMind — Arnold-Style Bodybuilding Tracker

IronMind is a mobile-first web app for serious lifters following Arnold Schwarzenegger-era bodybuilding programs. Log every set, track progressive overload, earn badges, and get rule-based AI coaching — all built on classic Golden Era principles.

**Live:** https://ironmind-s5r2ggkjeq-uc.a.run.app

---

## Prerequisites

- Node.js 20+
- A Firebase project (Firestore + Firebase Auth enabled)
- A Stripe account (for premium subscriptions)
- A Google Cloud project with Cloud Run enabled (for deployment)

---

## Local Setup

```bash
# 1. Clone and install
git clone https://github.com/Silvrash/ironmind
cd ironmind
npm install

# 2. Copy the env template and fill in your values
cp .env.local.example .env.local

# 3. Start the development server
npm run dev
# → http://localhost:3000
```

---

## Environment Variables

Create a `.env.local` file at the project root:

```bash
# Firebase — from your Firebase project settings > General > Your apps > SDK setup
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin — from Firebase project settings > Service accounts > Generate new private key
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Stripe — from your Stripe Dashboard > Developers > API keys
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Your deployed app URL (used for Stripe redirect URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all e2e tests
npx playwright test

# Run smoke tests only
npx playwright test e2e/smoke.spec.ts

# Run with UI
npx playwright test --ui
```

---

## Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Google Cloud Run
gcloud builds submit --tag gcr.io/YOUR_PROJECT/ironmind
gcloud run deploy ironmind --image gcr.io/YOUR_PROJECT/ironmind --platform managed
```

---

## Tech Stack

| Layer    | Technology                              |
| -------- | --------------------------------------- |
| Frontend | Next.js 15 + React 19 + TypeScript      |
| Styling  | Tailwind CSS + shadcn/ui                |
| Database | Firebase Firestore                      |
| Auth     | Firebase Auth                           |
| Payments | Stripe                                  |
| Hosting  | Google Cloud Run                        |
| Tests    | Playwright (30 e2e tests)               |
