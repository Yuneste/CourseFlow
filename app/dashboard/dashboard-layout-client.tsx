'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from 'sonner';
import { User } from '@/types';
import { signOut } from '@/app/actions/auth';
import { cn } from '@/lib/utils';
import { SearchModal } from '@/components/search/search-modal';
import { KeyboardShortcutsModal } from '@/components/modals/keyboard-shortcuts-modal';
import { useGlobalKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface DashboardLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayoutClient({ user, children }: DashboardLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Initialize global keyboard shortcuts
  useGlobalKeyboardShortcuts();

  useEffect(() => {
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
    <div className="min-h-screen bg-background academic-theme">
      <Sidebar user={user} onSignOut={handleSignOut} />
      
      {/* Main content area with margin for sidebar */}
      <main className={cn(
        "transition-all duration-300",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {children}
      </main>
      
      <Toaster />
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <KeyboardShortcutsModal />
    </div>
  );
}