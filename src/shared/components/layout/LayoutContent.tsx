'use client';

import { useState, useMemo, useEffect, useRef, startTransition } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/shared/components/ui/sidebar';
import { AppSidebar } from '@/shared/components/layout/AppSidebar';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInitialMount = useRef(true);

  // Check if we're on host or play pages
  const shouldBeCollapsed = useMemo(() => {
    return pathname?.startsWith('/sets/host') || pathname?.startsWith('/play');
  }, [pathname]);

  const [open, setOpen] = useState(!shouldBeCollapsed);

  // Sync open state when route changes (not on initial mount since useState handles that)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    startTransition(() => {
      setOpen(!shouldBeCollapsed);
    });
  }, [shouldBeCollapsed]);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      {pathname !== '/' && <AppSidebar />}
      {children}
    </SidebarProvider>
  );
}
