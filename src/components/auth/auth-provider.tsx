'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, limit } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase/init';
import { UserProfile } from '@/lib/types';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function upsertProfile(firebaseUser: User, displayName?: string) {
  const profileRef = doc(db, 'users', firebaseUser.uid);
  const profileSnap = await getDoc(profileRef);
  if (profileSnap.exists()) return profileSnap.data() as UserProfile;

  const existingUsers = await getDocs(query(collection(db, 'users'), limit(1)));
  const role = existingUsers.empty ? 'admin' : 'member';
  const profile: UserProfile = {
    uid: firebaseUser.uid,
    name: displayName || firebaseUser.displayName || 'Unnamed User',
    email: firebaseUser.email || '',
    avatarUrl: firebaseUser.photoURL || '',
    role,
    createdAt: new Date().toISOString()
  };

  await setDoc(profileRef, { ...profile, createdAt: serverTimestamp() });
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const snap = await getDoc(doc(db, 'users', nextUser.uid));
        if (snap.exists()) setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      loginWithEmail: async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      signupWithEmail: async (name, email, password) => {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const created = await upsertProfile(cred.user, name);
        setProfile(created);
      },
      loginWithGoogle: async () => {
        const cred = await signInWithPopup(auth, googleProvider);
        const created = await upsertProfile(cred.user);
        setProfile(created);
      },
      logout: async () => {
        await signOut(auth);
      }
    }),
    [loading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
