'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { CourseCard } from './CourseCard';
import { CourseForm } from './CourseForm';
import { CourseListSkeleton } from './CourseListSkeleton';
import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, List, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  showCreateForm?: boolean;
  onCloseCreateForm?: () => void;
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
  showCreateForm = false,
  onCloseCreateForm,
}: CourseListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [currentViewMode, setCurrentViewMode] = useState(viewMode);
  const [selectedTerm, setSelectedTerm] = useState<string>('all');

  // Update form state when showCreateForm prop changes
  useEffect(() => {
    if (showCreateForm) {
      setIsFormOpen(true);
    }
  }, [showCreateForm]);

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
      onCloseCreateForm?.();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Courses</h2>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>
        <CourseListSkeleton />
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

  // Filter courses by selected term
  const filteredCourses = selectedTerm === 'all' 
    ? courses 
    : courses.filter(course => course.term === selectedTerm);

  // Get unique terms from courses
  const availableTerms = Array.from(new Set(courses.map(course => course.term)));

  // Group filtered courses by term
  const coursesByTerm = filteredCourses.reduce((acc, course) => {
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
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              {academicSystem.terms.map((term) => (
                <SelectItem key={term} value={term}>
                  {term}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      {filteredCourses.length === 0 && selectedTerm !== 'all' ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Filter className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">
            No courses found for the selected term. Try selecting a different term or add a new course.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setSelectedTerm('all')}>
              Clear Filter
            </Button>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>
      ) : (
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
      )}

      <CourseForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        onDelete={editingCourse ? async () => {
          await onDeleteCourse(editingCourse.id);
          setIsFormOpen(false);
          setEditingCourse(null);
        } : undefined}
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