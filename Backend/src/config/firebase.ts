const isProduction = process.env.NODE_ENV === "production";

// In non-production environments without cloud credentials, default to local Firestore emulator
if (
  !isProduction &&
  !process.env.FIREBASE_SERVICE_ACCOUNT_KEY &&
  !process.env.FIREBASE_SERVICE_ACCOUNT_PATH &&
  !process.env.FIRESTORE_EMULATOR_HOST
) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
  process.env.GCLOUD_PROJECT = process.env.FIREBASE_PROJECT_ID || "vlearnn-project";
}

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Firestore, FieldValue, Timestamp } from "firebase-admin/firestore";

let firestoreInstance: Firestore | null = null;

export function getDb(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const existingApps = getApps();
  if (existingApps.length === 0) {
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      "vlearnn-project";

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();

    // Default to emulator host 127.0.0.1:8080 in non-production if neither cloud credentials nor emulator host are set
    if (!isProduction && !serviceAccountKey && !serviceAccountPath && !process.env.FIRESTORE_EMULATOR_HOST) {
      process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
    }

    if (serviceAccountKey) {
      try {
        const parsedCert = JSON.parse(serviceAccountKey);
        initializeApp({
          credential: cert(parsedCert),
          projectId: parsedCert.project_id || projectId,
        });
      } catch (err: any) {
        console.warn("[Firebase] Could not parse FIREBASE_SERVICE_ACCOUNT_KEY JSON. Falling back to project ID:", err.message);
        initializeApp({ projectId });
      }
    } else if (serviceAccountPath) {
      try {
        initializeApp({
          credential: cert(serviceAccountPath),
          projectId,
        });
      } catch (err: any) {
        console.warn("[Firebase] Could not load service account file. Falling back to project ID:", err.message);
        initializeApp({ projectId });
      }
    } else {
      initializeApp({
        projectId,
      });
    }
  }

  firestoreInstance = getFirestore();
  firestoreInstance.settings({ ignoreUndefinedProperties: true });
  return firestoreInstance;
}

export { Firestore, FieldValue, Timestamp };
