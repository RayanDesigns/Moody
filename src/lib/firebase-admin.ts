import * as admin from "firebase-admin";

let app: admin.app.App | null = null;

function getFirebaseAdmin(): admin.app.App {
  if (app) return app;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON is not set. Get it from Firebase Console > Project Settings > Service Accounts > Generate new private key."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
  app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return app;
}

export async function createCustomToken(uid: string, claims?: Record<string, unknown>): Promise<string> {
  const auth = getFirebaseAdmin().auth();
  return auth.createCustomToken(uid, claims);
}
