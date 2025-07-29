'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  BarChart3,
  Bell,
  HelpCircle
} from 'lucide-react';
import { User as UserType } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

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
      window.dispatchEvent(new Event('storage'));
    }
  }, [isCollapsed]);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview & recent activity'
    },
    {
      title: 'My Courses',
      href: '/courses',
      icon: BookOpen,
      description: 'View all courses'
    },
    {
      title: 'Analytics',
      href: '/dashboard/analytics',
      icon: BarChart3,
      description: 'Study insights'
    },
    {
      title: 'Achievements',
      href: '/dashboard/achievements',
      icon: Award,
      description: 'Track progress'
    },
  ];

  const bottomItems = [
    {
      title: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
    },
    {
      title: 'Help',
      href: '/help',
      icon: HelpCircle,
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
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-sm shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 80 : 280,
        }}
        className={cn(
          "fixed top-0 left-0 z-40 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800",
          "transition-all duration-300 ease-in-out",
          "shadow-xl lg:shadow-sm",
          // Mobile positioning
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop positioning - always visible
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center gap-3 font-bold text-xl",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    CourseFlow
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex hover:bg-gray-100 dark:hover:bg-gray-800"
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
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-10 w-10 border-2 border-indigo-100 dark:border-indigo-900">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900 dark:text-gray-100">
                    {user?.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav id="main-navigation" className="space-y-1" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                      "hover:bg-gray-100 dark:hover:bg-gray-800 group",
                      active && "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-700 dark:text-gray-300"
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Bottom Section */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    active && "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
                  )} />
                  {!isCollapsed && (
                    <span className={cn(
                      "text-sm",
                      active ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {item.title}
                    </span>
                  )}
                </Link>
              );
            })}
            
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950",
                isCollapsed && "justify-center px-0"
              )}
              onClick={onSignOut}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}