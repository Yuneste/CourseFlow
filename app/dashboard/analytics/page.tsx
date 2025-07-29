import { UnifiedBackground, UnifiedSection, UnifiedCard } from '@/components/ui/unified-background';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <UnifiedBackground>
      <UnifiedSection className="flex items-center justify-center min-h-[80vh]">
        <UnifiedCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">
            Analytics Coming Soon
          </h1>
          <p className="text-muted-foreground mb-6">
            We&apos;re working on powerful analytics tools to help you track your academic progress, 
            study habits, and performance insights.
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