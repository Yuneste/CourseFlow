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
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme';

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
        className="fixed top-4 left-4 z-50 lg:hidden bg-white backdrop-blur-sm shadow-sm border border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
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
          "fixed top-0 left-0 z-40 h-full",
          componentStyles.sidebar.base,
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
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Link 
                href="/dashboard" 
                className={cn(
                  "flex items-center gap-3 font-bold text-xl",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="w-9 h-9 rounded-lg bg-[#6366F1] flex items-center justify-center text-white shadow-sm">
                  <BookOpen className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <span className="text-gray-900 font-bold">
                    CourseFlow
                  </span>
                )}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className={cn("hidden lg:flex", lightThemeClasses.button.ghost)}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className={cn(
                  "h-4 w-4 transition-transform text-gray-600",
                  isCollapsed && "rotate-180"
                )} />
              </Button>
            </div>
          </div>

          {/* User Section */}
          <div className="p-4 border-b border-gray-200">
            <div className={cn(
              "flex items-center gap-3",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="h-9 w-9 border-2 border-[#E0E7FF]">
                <AvatarFallback className="bg-[#6366F1] text-white text-sm">
                  {user?.full_name?.[0] || user?.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-900">
                    {user?.full_name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
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
                      "group",
                      active ? componentStyles.sidebar.active : componentStyles.sidebar.item,
                      isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      active ? "text-[#5A9B95]" : "text-gray-500 group-hover:text-[#5A9B95]"
                    )} />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium",
                          active ? "text-[#5A9B95]" : "text-gray-700 group-hover:text-[#5A9B95]"
                        )}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
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
          <div className="p-3 border-t border-gray-200 space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                    active ? componentStyles.sidebar.active : componentStyles.sidebar.item,
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0",
                    active ? "text-[#5A9B95]" : "text-gray-500 hover:text-[#5A9B95]"
                  )} />
                  {!isCollapsed && (
                    <span className={cn(
                      "text-sm",
                      active ? "text-[#5A9B95] font-medium" : "text-gray-700 hover:text-[#5A9B95]"
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
                "w-full justify-start gap-3 text-gray-700 hover:text-[#FF7878] hover:bg-[#FFE4E4]",
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