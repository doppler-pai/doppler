'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { PreHostForm } from '@/features/prehost/components/PreHostForm';
import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { getSetPermissions } from '@/shared/services/getSetPermissions';

type Status = 'checking' | 'not-found' | 'ok';

export default function HostSetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setId = searchParams.get('setId');

  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const run = async () => {
      // If no setId query param, redirect to /sets
      if (!setId) {
        router.push('/sets');
        return;
      }

      // Check set permissions
      const permissions = await getSetPermissions(setId);
      console.log(permissions);
      setStatus(permissions.read ? 'ok' : 'not-found');
    };

    void run();
  }, [setId, router]);

  let content: React.ReactNode;

  if (status === 'checking') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Checking set...</p>
      </div>
    );
  } else if (status === 'not-found') {
    content = (
      <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
        <p>Set not found.</p>
      </div>
    );
  } else {
    content = <PreHostForm setId={setId!} />;
  }

  return <ProtectedRoute>{content}</ProtectedRoute>;
}
