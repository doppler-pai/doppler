import type { FieldValue, Timestamp } from 'firebase/firestore';

export type UserProfileData = {
  id: string;
  email: string | null;
  currency: 0;
  createdAt: Timestamp | FieldValue;
  ownedSkinIds: string[];
};
