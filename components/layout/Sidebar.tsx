'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Menu, 
  X, 
  Home, 
  BookOpen, 
  Settings, 
  LogOut,
  User,
  ChevronLeft,
  Upload,
  FolderOpen,
  Award,
  BarChart3
} from 'lucide-react';
import { User as UserType } from '@/types';

interface SidebarProps {
  user: UserType;
  onSignOut: () => void;
}

export function Sidebar({ user, onSignOut }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sidebar-collapsed') === 'true';
    }
    return false;
  });
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Save collapsed state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', isCollapsed.toString());
      // Emit custom event for other components
      window.dispatchEvent(new Event('storage'));
    }
  }, [isCollapsed]);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'My Courses',
      href: '/dashboard',
      icon: BookOpen,
    },
    {
      title: 'Upload Files',
      href: '/dashboard?tab=upload',
      icon: Upload,
    },
    {
      title: 'Statistics',
      href: '/dashboard/stats',
      icon: BarChart3,
    },
    {
      title: 'Achievements',
      href: '/dashboard/achievements',
      icon: Award,
    },
  ];

  const bottomItems = [
    {
      title: 'Profile',
      href: '/settings/profile',
      icon: User,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 shadow-xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center gap-2 font-bold text-xl",
                  isCollapsed && "justify-center"
                )}
              >
                <span className="text-2xl">📚</span>
                {!isCollapsed && <span className="text-gray-900 dark:text-white">CourseFlow</span>}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn(
                  "h-4 w-4 transition-transform",
                  isCollapsed && "rotate-180"
                )} />
              </Button>
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    "hover:bg-[#FFF5F5] dark:hover:bg-gray-800 hover:scale-105 text-gray-700 dark:text-gray-300",
                    isActive(item.href) && "bg-[#FFE4E1] dark:bg-[#FA8072]/20 text-[#FA8072] font-medium shadow-sm",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive(item.href) ? "text-[#FA8072]" : "text-gray-600 dark:text-gray-400"
                  )} />
                  {!isCollapsed && <span className={isActive(item.href) ? "text-[#FA8072]" : ""}>{item.title}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Items */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    "hover:bg-[#FFF5F5] dark:hover:bg-gray-800 hover:scale-105 text-gray-700 dark:text-gray-300",
                    isActive(item.href) && "bg-[#FFE4E1] dark:bg-[#FA8072]/20 text-[#FA8072] font-medium shadow-sm",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive(item.href) ? "text-[#FA8072]" : "text-gray-600 dark:text-gray-400"
                  )} />
                  {!isCollapsed && <span className={isActive(item.href) ? "text-[#FA8072]" : ""}>{item.title}</span>}
                </Link>
              );
            })}
            
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                isCollapsed && "justify-center px-0"
              )}
              onClick={onSignOut}
            >
              <LogOut className="h-5 w-5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}