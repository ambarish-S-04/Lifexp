import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';

// Firebase configuration - uses environment variables from .env file
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error('Error signing in with Google:', error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Firestore functions
export interface Section {
    id: string;
    name: string;
    icon: string;
    color: string;
    tasks: Task[];
    isDefault?: boolean;
}

export interface UserData {
    totalXP: number;
    level: number;
    streak: number;
    lastActiveDate: string;
    // Old format (for backward compat)
    tasks?: {
        career: Task[];
        health: Task[];
        creativity: Task[];
        custom: Task[];
    };
    // New format
    sections?: Section[];
    history: DayHistory[];
}

export interface Task {
    id: string;
    name: string;
    xp: number;
    completed: boolean;
    isDefault?: boolean;
}

export interface DayHistory {
    date: string;
    xp: number;
    tasksCompleted: number;
}

export const getUserData = async (userId: string): Promise<UserData | null> => {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as UserData;
        }
        return null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

export const saveUserData = async (userId: string, data: Partial<UserData>) => {
    try {
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, { ...data, updatedAt: Timestamp.now() }, { merge: true });
    } catch (error) {
        console.error('Error saving user data:', error);
        throw error;
    }
};

// Schedule account for deletion in 24 hours
export const scheduleAccountDeletion = async (userId: string): Promise<Date> => {
    try {
        const deletionDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, {
            scheduledDeletionAt: Timestamp.fromDate(deletionDate),
            updatedAt: Timestamp.now()
        }, { merge: true });
        return deletionDate;
    } catch (error) {
        console.error('Error scheduling account deletion:', error);
        throw error;
    }
};

// Cancel scheduled deletion
export const cancelAccountDeletion = async (userId: string): Promise<void> => {
    try {
        const docRef = doc(db, 'users', userId);
        await setDoc(docRef, {
            scheduledDeletionAt: null,
            updatedAt: Timestamp.now()
        }, { merge: true });
    } catch (error) {
        console.error('Error cancelling account deletion:', error);
        throw error;
    }
};

// Delete user data immediately (for when 24h has passed)
export const deleteUserData = async (userId: string): Promise<void> => {
    try {
        const { deleteDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'users', userId);
        await deleteDoc(docRef);

        // Also delete the Firebase auth user
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === userId) {
            await currentUser.delete();
        }
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw error;
    }
};
