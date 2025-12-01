'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Clock, ClipboardList, Trophy } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { createLobby } from '../services/createLobby';
import { GameModeType } from '@/shared/models/lobby.types';

interface PreHostFormProps {
  setId: string;
}

type GameMode = 'time' | 'quiz' | 'points' | null;

export function PreHostForm({ setId }: PreHostFormProps) {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode>(null);
  const [timeValue, setTimeValue] = useState('60');
  const [pointsValue, setPointsValue] = useState('100');
  const [isCreating, setIsCreating] = useState(false);

  const handleStartGame = async () => {
    if (!selectedMode) return;

    setIsCreating(true);

    try {
      let gameType: GameModeType;
      const params: {
        setId: string;
        type: GameModeType;
        timeValue?: number;
        pointsValue?: number;
      } = {
        setId,
        type: GameModeType.QUIZ,
      };

      if (selectedMode === 'time') {
        gameType = GameModeType.TIME;
        params.type = gameType;
        params.timeValue = Number(timeValue);
      } else if (selectedMode === 'points') {
        gameType = GameModeType.POINTS;
        params.type = gameType;
        params.pointsValue = Number(pointsValue);
      } else {
        gameType = GameModeType.QUIZ;
        params.type = gameType;
      }

      const result = await createLobby(params);

      if (result.success && result.lobbyId) {
        router.push(`/sets/host/${result.lobbyId}`);
      } else {
        console.error('Failed to create lobby:', result.error);
        alert('Failed to create game. Please try again.');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-8 flex justify-center">
          <Image src="/logo/logoText.png" alt="Doppler" width={200} height={60} priority />
        </div>

        <div className="mb-8 text-center">
          <h1 className="mb-2">Choose Game Mode</h1>
          <p>Select how you want to play this set</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Time Mode Card */}
          <button
            onClick={() => setSelectedMode('time')}
            className={`group relative flex flex-col rounded-lg border-2 p-6 transition-all ${
              selectedMode === 'time'
                ? 'border-purple-600 bg-purple-600/10'
                : 'border-border bg-bg-dark hover:border-purple-500/50'
            }`}
          >
            <div className="mb-4 flex items-center justify-center">
              <Clock className="size-12" strokeWidth={2} />
            </div>
            <h3 className="mb-2">Time Mode</h3>
            <p>Race against the clock to answer as many questions as possible</p>
          </button>

          {/* Quiz Mode Card */}
          <button
            onClick={() => setSelectedMode('quiz')}
            className={`group relative flex flex-col rounded-lg border-2 p-6 transition-all ${
              selectedMode === 'quiz'
                ? 'border-purple-600 bg-purple-600/10'
                : 'border-border bg-bg-dark hover:border-purple-500/50'
            }`}
          >
            <div className="mb-4 flex items-center justify-center">
              <ClipboardList className="size-12" strokeWidth={2} />
            </div>
            <h3 className="mb-2">Quiz Mode</h3>
            <p>Go through all questions at your own pace</p>
          </button>

          {/* Points Mode Card */}
          <button
            onClick={() => setSelectedMode('points')}
            className={`group relative flex flex-col rounded-lg border-2 p-6 transition-all ${
              selectedMode === 'points'
                ? 'border-purple-600 bg-purple-600/10'
                : 'border-border bg-bg-dark hover:border-purple-500/50'
            }`}
          >
            <div className="mb-4 flex items-center justify-center">
              <Trophy className="size-12" strokeWidth={2} />
            </div>
            <h3 className="mb-2">Points Mode</h3>
            <p>Race to reach a target score first</p>
          </button>
        </div>

        {/* Configuration Section - Always Rendered */}
        <div className="mt-8 space-y-6">
          {/* Input area with fixed height */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm" style={{ minHeight: '88px' }}>
              {selectedMode === 'time' && (
                <div className="space-y-3">
                  <Label htmlFor="time-input" className="text-center block">
                    Duration (seconds)
                  </Label>
                  <Input
                    id="time-input"
                    type="number"
                    min="10"
                    max="600"
                    value={timeValue}
                    onChange={(e) => setTimeValue(e.target.value)}
                    placeholder="60"
                    className="text-center"
                  />
                </div>
              )}
              {selectedMode === 'points' && (
                <div className="space-y-3">
                  <Label htmlFor="points-input" className="text-center block">
                    Target Points
                  </Label>
                  <Input
                    id="points-input"
                    type="number"
                    min="10"
                    max="10000"
                    value={pointsValue}
                    onChange={(e) => setPointsValue(e.target.value)}
                    placeholder="100"
                    className="text-center"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Button - Always Rendered */}
          <div className="flex justify-center">
            <Button onClick={handleStartGame} size="lg" className="px-12" disabled={!selectedMode || isCreating}>
              {isCreating ? 'Creating Game...' : 'Start Game'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
