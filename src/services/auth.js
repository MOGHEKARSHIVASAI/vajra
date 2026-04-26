import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signInWithRedirect,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const requireAuth = () => {
  if (!auth) throw new Error("Firebase is not configured. Please check your environment variables.");
};

const requireDb = () => {
  if (!db) throw new Error("Firebase is not configured. Please check your environment variables.");
};

export const loginEmail = (email, password) => {
  requireAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerEmail = async (email, password, name) => {
  requireAuth();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential;
};

export const loginGoogle = async () => {
  requireAuth();
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    // If popup is blocked, fall back to redirect
    if (error.code === 'auth/popup-blocked') {
      return signInWithRedirect(auth, googleProvider);
    }
    throw error;
  }
};

export const logout = () => {
  if (!auth) return Promise.resolve();
  return signOut(auth);
};

export const checkProfileSetup = async (uid) => {
  requireDb();
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
};

export const saveUserProfile = async (uid, profileData) => {
  requireDb();
  await setDoc(doc(db, "users", uid), {
    ...profileData,
    createdAt: new Date().toISOString(),
    gamification: {
      xp: 0,
      level: 0,
      streak: 0,
      longestStreak: 0,
      lastWorkoutDate: null
    },
    settings: {
      darkMode: true,
      notifications: true,
      geminiApiKey: ""
    }
  });
};
