'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { UnifiedCard } from '@/components/ui/unified-background';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { coursesService } from '@/lib/services/courses.service';
import { useRouter } from 'next/navigation';
import { Course } from '@/types';

interface CourseSettingsClientProps {
  course: Course;
}

export function CourseSettingsClient({ course }: CourseSettingsClientProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      await coursesService.deleteCourse(course.id);
      toast.success('Course deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      toast.error('Failed to delete course');
      setIsDeleting(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-4">Course Settings</h1>
          <p className="text-muted-foreground mb-6">
            Manage your course settings and preferences.
          </p>
        </UnifiedCard>

        {/* Danger Zone */}
        <UnifiedCard className="p-8 border-destructive/20">
          <h2 className="text-xl font-semibold mb-4 text-destructive">Danger Zone</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
              <div>
                <h3 className="font-medium">Delete Course</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete this course and all associated files. This action cannot be undone.
                </p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the course{' '}
                      &quot;<strong>{course.name}</strong>&quot; and all of its files, folders, and data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCourse}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete course'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </UnifiedCard>

        {/* Coming Soon Features */}
        <UnifiedCard className="p-8">
          <h2 className="text-xl font-semibold mb-4">Coming Soon</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Edit course details (name, code, professor)</li>
            <li>• Manage course permissions and sharing</li>
            <li>• Export course data and files</li>
            <li>• Course analytics and insights</li>
            <li>• Custom course templates</li>
          </ul>
        </UnifiedCard>
      </div>
    </>
  );
}