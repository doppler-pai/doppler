'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/shared/hooks/useAuth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ensurePlayerInLobby } from '../services/ensurePlayerInLobby';
import { getPlayer } from '../services/getPlayer';
import { SkinSelect } from './SkinSelect';
import { PostLobby } from './PostLobby';

type LobbyProps = {
  gameId: string;
};

type LobbyStatus = 'checking' | 'missing' | 'waiting';

type NickFormValues = {
  nick: string;
};

export function Lobby({ gameId }: LobbyProps) {
  const { user } = useAuth();

  const [status, setStatus] = useState<LobbyStatus>('checking');
  const [serverError, setServerError] = useState<string | null>(null);
  const [currentNick, setCurrentNick] = useState<string | null>(null);
  const [selectedSkinId, setSelectedSkinId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<NickFormValues>({
    defaultValues: {
      nick: '',
    },
  });

  useEffect(() => {
    const run = async () => {
      if (!user?.uid) {
        setServerError('You must be logged in to join the lobby.');
        setStatus('missing');
        return;
      }

      try {
        const result = await getPlayer(gameId, user.uid);
        if (!result) {
          setStatus('missing');
          return;
        }

        setCurrentNick(result.nick ?? null);
        setSelectedSkinId(result.skinId ?? null);
        setStatus('waiting');
      } catch (error) {
        console.error('Error reading player info:', error);
        setStatus('missing');
      }
    };

    void run();
  }, [gameId, user?.uid]);

  const onSubmit = async (values: NickFormValues) => {
    if (!user?.uid) {
      setServerError('You must be logged in to join the lobby.');
      return;
    }

    if (!selectedSkinId) {
      setServerError('Please select a skin.');
      return;
    }

    setServerError(null);

    const result = await ensurePlayerInLobby({
      gameId,
      playerId: user.uid,
      nick: values.nick,
      skinId: selectedSkinId,
    });

    if (!result.success) {
      setServerError(result.error);
      return;
    }

    setCurrentNick(result.nick);
    setSelectedSkinId(result.skinId);
    setStatus('waiting');
    reset({ nick: result.nick });
  };

  let content: React.ReactNode;

  if (status === 'checking') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Loading lobby...</p>
      </div>
    );
  } else if (status === 'missing') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border bg-bg-dark p-6 shadow-sm">
          <h1 className="mb-2 text-2xl font-semibold">Enter your name</h1>
          <p className="mb-4 text-sm text-muted-foreground">Game ID: {gameId}</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="nick">Nickname</Label>
              <Input
                id="nick"
                autoComplete="off"
                aria-invalid={errors.nick ? 'true' : undefined}
                {...register('nick', {
                  required: 'Nickname is required.',
                  minLength: { value: 2, message: 'Nickname must be at least 2 characters.' },
                  maxLength: { value: 20, message: 'Nickname must be at most 20 characters.' },
                })}
              />
              {errors.nick ? <p className="text-xs text-destructive">{errors.nick.message}</p> : null}
            </div>

            {user?.uid ? (
              <SkinSelect userId={user.uid} selectedSkinId={selectedSkinId} onSelectSkin={setSelectedSkinId} />
            ) : null}

            {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

            <Button type="submit" className="w-full" disabled={!isValid || !selectedSkinId}>
              Join lobby
            </Button>
          </form>
        </div>
      </div>
    );
  } else {
    content =
      user?.uid && currentNick && selectedSkinId ? (
        <PostLobby
          gameId={gameId}
          userId={user.uid}
          nick={currentNick}
          selectedSkinId={selectedSkinId}
          onSkinChange={setSelectedSkinId}
        />
      ) : (
        <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      );
  }

  return content;
}
