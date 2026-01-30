import type { FieldValue, Timestamp } from 'firebase/firestore';

export type UserProfileData = {
  id: string;
  email: string | null;
  currency: number;
  createdAt: Timestamp | FieldValue;
  ownedSkinIds: string[];
};
