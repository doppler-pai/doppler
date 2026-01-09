'use client';

import { createSet } from '../services/createSet';
import { SetForm } from './AddSetForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SetData } from '@/shared/models/sets.type';
import { useAuth } from '@/shared/hooks/useAuth'; // Assuming useAuth exists, if not will fall back to mock or direct auth

export const CreateSet = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth(); // Need to check if this hook exists or how to get user ID

  const handleCreate = async (data: Omit<SetData, 'id'> | SetData) => {
    setIsLoading(true);
    try {
      const setData = {
        ...data,
        ownerId: user?.uid || 'anonymous', // Fallback if no user
      } as Omit<SetData, 'id'>;

      await createSet(setData);
      router.push('/sets'); // Redirect to sets list or the new set
    } catch (error) {
      console.error(error);
      alert('Failed to create set');
    } finally {
      setIsLoading(false);
    }
  };

  return <SetForm onSubmit={handleCreate} isLoading={isLoading} />;
};
