import { ViewSet } from '@/features/sets/components/ViewSet';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewSetPage({ params }: PageProps) {
  const { id } = await params;
  return <ViewSet setId={id} />;
}
