import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme';

export default function NotificationsPage() {
  return (
    <div className={lightThemeClasses.page.wrapper}>
      <div className={cn(lightThemeClasses.page.container, "py-8 flex items-center justify-center min-h-[80vh]")}>
        <div className={cn(lightThemeClasses.card.base, "max-w-md w-full p-8 text-center")}>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#E0E7FF] rounded-full">
              <Bell className="h-10 w-10 text-[#6366F1]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#3B82F6] mb-3">
            Notifications Coming Soon
          </h1>
          <p className="text-gray-600 mb-6">
            Stay updated with important course announcements, assignment deadlines, 
            and study reminders. Never miss an important update!
          </p>
          <Link href="/dashboard">
            <Button className={cn("w-full", lightThemeClasses.button.primary)}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}