import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme';

export default function AchievementsPage() {
  return (
    <div className={lightThemeClasses.page.wrapper}>
      <div className={cn(lightThemeClasses.page.container, "py-8 flex items-center justify-center min-h-[80vh]")}>
        <div className={cn(lightThemeClasses.card.base, "max-w-md w-full p-8 text-center")}>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-[#E6F7F5] rounded-full">
              <Award className="h-12 w-12 text-[#8CC2BE]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Achievements Coming Soon
          </h1>
          <p className="text-gray-600 mb-6">
            Unlock badges and track your academic milestones as you progress through your courses. 
            Recognition for your hard work is on the way!
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