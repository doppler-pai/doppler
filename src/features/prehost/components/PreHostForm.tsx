'use client';

interface PreHostFormProps {
  setId: string;
}

export function PreHostForm({ setId }: PreHostFormProps) {
  return (
    <div className="flex min-h-screen w-full flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-8">PreHost Form</h1>
        {/* Component content will go here */}
      </div>
    </div>
  );
}
