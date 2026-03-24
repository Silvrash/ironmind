import { initializeApp, getApps, cert } from 'firebase-admin/app';

export function initAdmin(): void {
  if (getApps().length > 0) return;

  // In Cloud Run, Application Default Credentials (ADC) are used automatically.
  // Locally, set GOOGLE_APPLICATION_CREDENTIALS to a service account key file.
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      // ADC will be used if GOOGLE_APPLICATION_CREDENTIALS is set; otherwise
      // fall back to the env vars below for explicit key-based auth.
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
