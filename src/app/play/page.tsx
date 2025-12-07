import { PreLobbyInput } from '@/features/playerFlow/preLobby/components/PreLobbyInput';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';

export default function PlayPage() {
  return (
    <ProtectedRoute>
      <PreLobbyInput />
    </ProtectedRoute>
  );
}
