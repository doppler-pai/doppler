'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
} from '@/shared/components/ui/sidebar';
import { Gamepad2, Bot, Store, List, PlusSquare } from 'lucide-react';
import Image from 'next/image';

const links = [
  {
    title: 'Play Now',
    url: '#',
    icon: Gamepad2,
  },
  {
    title: 'Dopples',
    url: '#',
    icon: Bot,
  },
  {
    title: 'Dopple Market',
    url: '#',
    icon: Store,
  },
  {
    title: 'Sets',
    url: '#',
    icon: List,
  },
  {
    title: 'Create New Set',
    url: '#',
    icon: PlusSquare,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Image src="/logo/logoFull.png" alt="Doppler" width={100} height={100} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.title}>
                <SidebarMenuButton asChild>
                  <a href={link.url}>
                    <link.icon />
                    <span>{link.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
