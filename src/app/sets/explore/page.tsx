'use client';

import { useState, useEffect } from 'react';
import { SetCard } from '@/features/sets/components/SetCard';
import { fetchPublicSets } from '@/features/sets/services/getPublicSets';
import { SetData } from '@/shared/models/sets.type';
import { Loader2 } from 'lucide-react';

export default function ExplorePage() {
  const [sets, setSets] = useState<SetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSets = async () => {
      try {
        const setsData = await fetchPublicSets();
        setSets(setsData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadSets();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1>Public Sets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sets.map((set) => (
          <SetCard
            key={set.id}
            id={set.id}
            title={set.title}
            plays={0}
            edited={0} // Placeholder as backend might not track this yet
            questions={set.questions?.length || 0}
            // No onDelete for public explore page
          />
        ))}
      </div>

      {sets.length === 0 && (
        <div className="text-center text-gray-400 mt-20">
          <h2>No public sets found</h2>
          <p className="mt-2">Be the first to share a set!</p>
        </div>
      )}
    </div>
  );
}
