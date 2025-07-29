import { UnifiedBackground, UnifiedSection, UnifiedCard } from '@/components/ui/unified-background';
import { Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AchievementsPage() {
  return (
    <UnifiedBackground>
      <UnifiedSection className="flex items-center justify-center min-h-[80vh]">
        <UnifiedCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Award className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Achievements Coming Soon
          </h1>
          <p className="text-muted-foreground mb-6">
            Unlock badges and track your academic milestones as you progress through your courses. 
            Recognition for your hard work is on the way!
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