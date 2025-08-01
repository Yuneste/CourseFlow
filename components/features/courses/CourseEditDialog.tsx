'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Course } from '@/types';
import { coursesService } from '@/lib/services/courses.service.client';
import { toast } from 'sonner';
import { useAppStore } from '@/stores/useAppStore';

const formSchema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters').max(100),
  code: z.string().max(20).optional().or(z.literal('')),
  professor: z.string().max(100).optional().or(z.literal('')),
  credits: z.string().optional().or(z.literal('')),
  emoji: z.string().emoji().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseEditDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userAcademicSystem?: string;
}

// Default emojis for courses
const courseEmojis = ['📚', '📖', '✏️', '🎓', '📝', '💻', '🔬', '🧪', '🎨', '🎵', '🏛️', '⚡'];

export function CourseEditDialog({ course, open, onOpenChange, onSuccess, userAcademicSystem }: CourseEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateCourse: updateCourseInStore } = useAppStore();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: course.name,
      code: course.code || '',
      professor: course.professor || '',
      credits: course.credits?.toString() || course.ects_credits?.toString() || '',
      emoji: course.emoji || '📚',
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        name: course.name,
        code: course.code || '',
        professor: course.professor || '',
        credits: course.credits?.toString() || course.ects_credits?.toString() || '',
        emoji: course.emoji || '📚',
      });
    }
  }, [open, course, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    
    const updates: any = {
      name: values.name,
      code: values.code || undefined,
      professor: values.professor || undefined,
      emoji: values.emoji || '📚',
    };

    // Handle credits based on user's academic system
    if (values.credits) {
      const credits = parseInt(values.credits);
      if (!isNaN(credits)) {
        if (userAcademicSystem === 'ects') {
          updates.ects_credits = credits;
          // Clear regular credits to avoid confusion
          updates.credits = null;
        } else {
          updates.credits = credits;
          // Clear ECTS credits to avoid confusion
          updates.ects_credits = null;
        }
      }
    }

    // Optimistically update the store
    updateCourseInStore(course.id, updates);
    toast.success('Course updated successfully!');
    onSuccess();
    onOpenChange(false);
    
    try {
      await coursesService.updateCourse(course.id, updates);
    } catch (error) {
      // Revert on error by calling onSuccess which will refresh
      toast.error(error instanceof Error ? error.message : 'Failed to update course');
      onSuccess(); // This will refresh and revert the optimistic update
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>
            Update your course details. All changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Icon</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 flex-wrap">
                      {courseEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => field.onChange(emoji)}
                          className={`text-2xl p-2 rounded-lg border-2 transition-all ${
                            field.value === emoji
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Choose an icon to represent your course
                  </FormDescription>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Introduction to Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. CS101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{userAcademicSystem === 'ects' ? 'ECTS Credits' : 'Credits'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 3" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="professor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professor</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Dr. Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}