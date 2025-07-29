import { UnifiedBackground, UnifiedSection, UnifiedCard } from '@/components/ui/unified-background';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function NotificationsPage() {
  return (
    <UnifiedBackground>
      <UnifiedSection className="flex items-center justify-center min-h-[80vh]">
        <UnifiedCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Bell className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Notifications Coming Soon
          </h1>
          <p className="text-muted-foreground mb-6">
            Stay updated with important course announcements, assignment deadlines, 
            and study reminders. Never miss an important update!
          </p>
          <Link href="/dashboard">
            <Button className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </UnifiedCard>
      </UnifiedSection>
    </UnifiedBackground>
  );
}