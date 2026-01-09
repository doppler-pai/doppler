'use client';

import { useEffect, useState } from 'react';
import { getSetById } from '../services/getSetById';
import { SetForm } from './AddSetForm';
import { useRouter } from 'next/navigation';
import { SetData } from '@/shared/models/sets.type';

interface ViewSetProps {
  setId: string;
}

export const ViewSet = ({ setId }: ViewSetProps) => {
  const router = useRouter();
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

  const handleNoOp = async () => {
    // Read-only view, no updates allowed
  };

  if (isFetching) return <div>Loading...</div>;

  return <SetForm key={initialData?.id} initialData={initialData} onSubmit={handleNoOp} readOnly={true} />;
};
