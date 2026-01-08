'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { MobileTabBar } from '@/components/layout/mobile-tab-bar';
import { ToastProvider } from '@/components/ui/toast';
import { CommandPalette, useCommandPalette } from '@/components/ui/command-palette';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const commandPalette = useCommandPalette();

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content focus:ring-2 focus:ring-blue-500"
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-[#f5f3ef] lg:flex">
        <Sidebar />
        <main
          id="main-content"
          className="flex-1 overflow-auto pt-14 lg:pt-0 pb-20 lg:pb-0"
          tabIndex={-1}
        >
          {children}
        </main>
        <MobileTabBar />
      </div>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette isOpen={commandPalette.isOpen} onClose={commandPalette.close} />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <DashboardContent>{children}</DashboardContent>
    </ToastProvider>
  );
}
