'use client';

import { useEffect, useState } from 'react';
import { updateSet } from '../services/updateSet';
import { getSetById } from '../services/getSetById';
import { SetForm } from './AddSetForm';
import { useRouter } from 'next/navigation';
import { SetData } from '@/shared/models/sets.type';

interface EditSetProps {
  setId: string;
}

export const EditSet = ({ setId }: EditSetProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<SetData | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSetById(setId);
        if (data) {
          setInitialData(data);
        } else {
          router.push('/404');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [setId, router]);

  const handleUpdate = async (data: Omit<SetData, 'id'> | SetData) => {
    setIsLoading(true);
    try {
      await updateSet(setId, data);
      router.push('/sets');
    } catch (error) {
      console.error(error);
      alert('Failed to update set: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div>Loading...</div>;

  return <SetForm key={initialData?.id} initialData={initialData} onSubmit={handleUpdate} isLoading={isLoading} />;
};
