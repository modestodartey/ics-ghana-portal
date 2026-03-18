import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

type AdminRouteUser = {
  uid: string;
  email: string;
};

function getFirebaseAdminConfig() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "";
  const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(/\\n/g, "\n");

console.log("PROJECT_ID:", process.env.FIREBASE_ADMIN_PROJECT_ID);
console.log("CLIENT_EMAIL:", process.env.FIREBASE_ADMIN_CLIENT_EMAIL);
console.log("PRIVATE_KEY LENGTH:", process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length);

  return {
    projectId,
    clientEmail,
    privateKey
  };
}

function getFirebaseAdminApp() {
  const existingApps = getApps();

  if (existingApps.length > 0) {
    return getApp();
  }

  const { projectId, clientEmail, privateKey } = getFirebaseAdminConfig();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin SDK is not configured. Add FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY to the environment."
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey
    })
  });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}

function createHttpError(message: string, status: number) {
  const error = new Error(message) as Error & { status?: number };
  error.status = status;
  return error;
}

export async function verifyAdminRouteRequest(request: Request): Promise<AdminRouteUser> {
  const authorizationHeader = request.headers.get("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw createHttpError("You must sign in again before continuing.", 401);
  }

  const idToken = authorizationHeader.slice("Bearer ".length);
  const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
  const userSnapshot = await getFirebaseAdminFirestore().collection("users").doc(decodedToken.uid).get();
  const userData = userSnapshot.data();

  if (!userSnapshot.exists || userData?.role !== "admin" || userData?.isActive === false) {
    throw createHttpError("Only active administrator accounts can use this action.", 403);
  }

  return {
    uid: decodedToken.uid,
    email: typeof userData.email === "string" ? userData.email : decodedToken.email ?? ""
  };
}

export function getHttpErrorStatus(error: unknown) {
  return typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
    ? error.status
    : 500;
}
