'use client'

import { useState, useEffect } from 'react';
import { SetCard } from './SetCard';
import { fetchSets } from '../services/getUserSets';

interface Question {
  type: string;
  question: string;
}

interface SetData {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  ownerId: string;
  questions: Question[];
}

interface SetCardListProps {
  userId: string; // ID zalogowanego użytkownika
}

export const SetCardList = ({ userId }: SetCardListProps) => {
  const [sets, setSets] = useState<SetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSets = async () => {
      try {
        const setsData = await fetchSets(userId);
        setSets(setsData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    loadSets();
  }, [userId]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sets.map((set) => (
          <SetCard
            key={set.id}
            title={set.title}
            plays={0}
            edited={5}
            questions={set.questions?.length || 0}
          />
        ))}
      </div>
      
      {sets.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-xl">No quiz sets found</p>
          <p className="mt-2">Create your first set to get started!</p>
        </div>
      )}
    </div>
  );
};