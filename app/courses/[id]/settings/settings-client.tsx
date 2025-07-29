'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Lock, Share2, Download, BarChart3, FileStack } from 'lucide-react';
import Link from 'next/link';
import { UnifiedCard } from '@/components/ui/unified-background';
import { Course } from '@/types';

interface CourseSettingsClientProps {
  course: Course;
}

export function CourseSettingsClient({ course }: CourseSettingsClientProps) {
  return (
    <>
      <div className="mb-6">
        <Link href={`/courses/${course.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <UnifiedCard className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Course Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Advanced settings and features for {course.name} are coming soon!
          </p>
        </UnifiedCard>

        {/* Coming Soon Features */}
        <div className="grid gap-4 md:grid-cols-2">
          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Permissions & Privacy</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Control who can view and edit your course materials.
            </p>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Sharing & Collaboration</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Share your course with classmates and study together.
            </p>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Export & Backup</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Export all course data and create backups.
            </p>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Analytics & Insights</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Track your study progress and learning patterns.
            </p>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileStack className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold">Course Templates</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Save and reuse course structures as templates.
            </p>
          </UnifiedCard>
        </div>

        <UnifiedCard className="p-8 text-center">
          <p className="text-lg text-muted-foreground mb-2">
            These features are currently in development.
          </p>
          <p className="text-sm text-muted-foreground">
            Stay tuned for updates!
          </p>
        </UnifiedCard>
      </div>
    </>
  );
}