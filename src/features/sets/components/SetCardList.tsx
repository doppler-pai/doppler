'use client';

import { useState, useEffect } from 'react';
import { SetCard } from './SetCard';
import { fetchSets } from '../services/getUserSets';
import { SetData } from '@/shared/models/sets.type';

import { deleteSet } from '../services/deleteSet';

interface SetCardListProps {
  userId: string;
}

export const SetCardList = ({ userId }: SetCardListProps) => {
  const [sets, setSets] = useState<SetData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSets = async () => {
      try {
        const setsData = await fetchSets(userId);
        setSets(setsData);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadSets();
  }, [userId]);

  const handleDeleteSet = async (setId: string) => {
    try {
      await deleteSet(setId);
      setSets((prevSets) => prevSets.filter((set) => set.id !== setId));
    } catch (err) {
      console.error('Failed to delete set:', err);
      // Optionally handle error state here
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sets.map((set) => (
          <SetCard
            key={set.id}
            id={set.id}
            title={set.title}
            plays={0}
            edited={5}
            questions={set.questions?.length || 0}
            onDelete={() => handleDeleteSet(set.id)}
          />
        ))}
      </div>

      {sets.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <h2>No quiz sets found</h2>
          <p className="mt-2">Create your first set to get started!</p>
        </div>
      )}
    </div>
  );
};
