import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { 
  initializeFirestore, 
  getFirestore, 
  doc, 
  getDocFromServer 
} from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0708408149",
  appId: "1:235853730088:web:555b8dbd5771abc3db001d",
  apiKey: "AIzaSyB0mNNaoa-N3gAQylFRJq3UqT3bmeQNA8U",
  authDomain: "gen-lang-client-0708408149.firebaseapp.com",
  storageBucket: "gen-lang-client-0708408149.firebasestorage.app",
  messagingSenderId: "235853730088"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.error("Auth persistence failed:", err);
});

export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with custom database ID
export const db = initializeFirestore(app, {}, "ai-studio-d1b7a18d-8e99-4eae-b5c6-648eeee0fc66");

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection on startup (Prerequisite in Firebase Integration Skill)
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration. Active client is offline.");
    } else {
      console.log("Firebase connection validated successfully.");
    }
  }
}
testConnection();
