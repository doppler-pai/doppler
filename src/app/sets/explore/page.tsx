'use client';

import { useState, useEffect } from 'react';
import { SetCard } from '@/features/sets/components/SetCard';
import { fetchPublicSets } from '@/features/sets/services/getPublicSets';
import { SetData } from '@/shared/models/sets.type';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

export default function ExplorePage() {
  const [sets, setSets] = useState<SetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredSets = sets.filter((set) => set.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
      <div className="flex flex-col gap-6 mb-8">
        <h1>Public Sets</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search public sets..."
            className="pl-9"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredSets.map((set) => (
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

      {sets.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <h2>No public sets found</h2>
          <p className="mt-2">Be the first to share a set!</p>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <h2>No sets matching &quot;{searchQuery}&quot;</h2>
        </div>
      ) : null}
    </div>
  );
}
