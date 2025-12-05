import { doc, getDoc } from 'firebase/firestore';
import { Permissions } from '@/shared/models/permissions.types';

import { auth, db } from '@/shared/lib/firebase';

export async function getSetPermissions(setId: string): Promise<Permissions> {
  try {
    // Check if setId is valid
    if (!setId || setId.trim() === '') {
      return { read: false, write: false };
    }

    // Check if set exists in Firestore
    const setRef = doc(db, 'sets', setId);
    const setSnapshot = await getDoc(setRef);

    // If set doesn't exist, return false false
    if (!setSnapshot.exists()) {
      return { read: false, write: false };
    }

    // Get set data
    const setData = setSnapshot.data();
    const ownerId = setData?.ownerId;
    const isPublic = setData?.isPublic === true;

    // Check if user is authenticated
    const currentUserId = auth.currentUser?.uid;

    // If user is owner, return true true
    if (currentUserId && ownerId && currentUserId === ownerId) {
      return { read: true, write: true };
    }

    // If set is public, return true false
    if (isPublic) {
      return { read: true, write: false };
    }

    // If not public, return false false
    return { read: false, write: false };
  } catch (error) {
    console.error('Error getting set permissions:', error);
    return { read: false, write: false };
  }
}
