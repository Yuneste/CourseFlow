'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { User } from '@/types';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { SearchModal } from '@/components/search/SearchModal';
import { KeyboardShortcutsModal } from '@/components/modals/KeyboardShortcutsModal';
import { useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { lightThemeClasses } from '@/lib/theme/light-theme';

interface DashboardLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  // Initialize with false to prevent hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  useEffect(() => {
    // Read from localStorage after mount
    const stored = localStorage.getItem('sidebar-collapsed') === 'true';
    setIsCollapsed(stored);

    const handleStorageChange = () => {
      setIsCollapsed(localStorage.getItem('sidebar-collapsed') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={cn("min-h-screen", lightThemeClasses.page.wrapper)}>
      <Sidebar user={user} onSignOut={handleSignOut} />
      
      {/* Main content area with margin for sidebar */}
      <div className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-[280px]"
      )}>
        <Header className="border-b border-gray-200 bg-white" showMenuButton={false}>
          <div className="flex items-center justify-between px-4">
            <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
          </div>
        </Header>
        <main className="min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </div>
      
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <KeyboardShortcutsModal />
    </div>
  );
}