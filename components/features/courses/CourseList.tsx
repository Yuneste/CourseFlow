'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { CourseCard } from './CourseCard';
import { CourseForm } from './CourseForm';
import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, List } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

interface CourseListProps {
  courses: Course[];
  academicSystem: {
    terms: string[];
    periodType: 'semester' | 'term' | 'trimester';
    creditSystem: string;
  };
  isLoading?: boolean;
  onCreateCourse: (course: any) => Promise<void>;
  onUpdateCourse: (id: string, updates: any) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onCourseClick?: (course: Course) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

export function CourseList({
  courses,
  academicSystem,
  isLoading,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onCourseClick,
  viewMode = 'grid',
  className,
}: CourseListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleDelete = (course: Course) => {
    setDeletingCourse(course);
  };

  const confirmDelete = async () => {
    if (deletingCourse) {
      await onDeleteCourse(deletingCourse.id);
      setDeletingCourse(null);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingCourse) {
      await onUpdateCourse(editingCourse.id, data);
    } else {
      await onCreateCourse(data);
    }
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingCourse(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Grid3x3 className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Get started by adding your first course. You can organize them by term and track your progress.
      </p>
      <Button onClick={() => setIsFormOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Course
      </Button>
    </div>
  );

  if (courses.length === 0) {
    return (
      <>
        <EmptyState />
        <CourseForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          onSubmit={handleFormSubmit}
          course={editingCourse}
          academicSystem={academicSystem}
        />
      </>
    );
  }

  // Group courses by term
  const coursesByTerm = courses.reduce((acc, course) => {
    if (!acc[course.term]) {
      acc[course.term] = [];
    }
    acc[course.term].push(course);
    return acc;
  }, {} as Record<string, Course[]>);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Courses</h2>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={currentViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewMode('grid')}
              className="h-8 px-3"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={currentViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(coursesByTerm).map(([term, termCourses]) => (
          <div key={term}>
            <h3 className="text-lg font-semibold mb-4 text-muted-foreground">{term}</h3>
            <div
              className={cn(
                currentViewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'
              )}
            >
              {termCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onClick={onCourseClick || handleEdit}
                  className={currentViewMode === 'list' ? 'max-w-md' : ''}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <CourseForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        course={editingCourse}
        academicSystem={academicSystem}
      />

      <AlertDialog
        open={!!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold">{deletingCourse?.name}</span>? This action cannot be
              undone. Your files will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}