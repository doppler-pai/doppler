import { ProtectedRoute } from '@/shared/components/auth/ProtectedRoute';
import { EditSet } from '@/features/sets/components/EditSet';

// Next.js 15+ treats params as a Promise
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSetPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <main>
        <EditSet setId={id} />
      </main>
    </ProtectedRoute>
  );
}
