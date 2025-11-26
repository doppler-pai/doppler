import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { auth, db } from '@/shared/lib/firebase';
import type { UserProfileData } from '../models/userProfile.types';

export type RegisterWithProfileParams = {
  email: string;
  password: string;
};

export async function registerWithProfile({ email, password }: RegisterWithProfileParams) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;

  const profile: UserProfileData = {
    id: user.uid,
    email: user.email ?? email,
    currency: 0,
    createdAt: serverTimestamp(),
  };

  const usersCollection = collection(db, 'users');
  const userDocRef = doc(usersCollection, user.uid);

  await setDoc(userDocRef, {
    ...profile,
  });

  return user;
}
