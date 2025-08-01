'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { coursesService } from '@/lib/services/courses.service.client';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';
import { User } from '@/types';
import { cn } from '@/lib/utils';
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme';

const formSchema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters').max(100),
  code: z.string().max(20).optional(),
  professor: z.string().max(100).optional(),
  term: z.string().min(1, 'Please select a term'),
  credits: z.number().min(0).max(50).optional(),
  emoji: z.string().emoji().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CourseFormClientProps {
  userProfile: User;
}

// Default emojis for courses
const courseEmojis = ['📚', '📖', '✏️', '🎓', '📝', '💻', '🔬', '🧪', '🎨', '🎵', '🏛️', '⚡'];

export function CourseFormClient({ userProfile }: CourseFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const country = userProfile.country || 'US';
  const academicSystem = getAcademicSystemWithTerms(country);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      code: '',
      professor: '',
      term: academicSystem.currentTerm,
      credits: undefined,
      emoji: '📚',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const courseData: any = {
        name: values.name,
        code: values.code || undefined,
        professor: values.professor || undefined,
        term: values.term,
        academic_period_type: academicSystem.periodType as 'semester' | 'term' | 'trimester',
        emoji: values.emoji || '📚',
        color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'), // Random color
      };
      
      // Handle credits based on user's academic system
      if (values.credits !== undefined) {
        if (userProfile.academic_system === 'ects') {
          courseData.ects_credits = values.credits;
        } else {
          courseData.credits = values.credits;
        }
      }
      
      const course = await coursesService.createCourse(courseData);
      
      toast.success('Course created successfully!');
      router.push(`/courses/${course.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create course');
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/courses')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground mt-2">
            Add a new course to start organizing your academic materials
          </p>
        </div>

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
                  <FormDescription>
                    The full name of your course
                  </FormDescription>
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
                    <FormDescription>
                      Optional course identifier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{userProfile.academic_system === 'ects' ? 'ECTS Credits' : 'Credits'}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 3" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      {userProfile.academic_system === 'ects' ? 'ECTS credit points' : 'Number of credit hours'}
                    </FormDescription>
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
                  <FormDescription>
                    Instructor or professor name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a term" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {academicSystem.terms.map((term) => (
                        <SelectItem key={term} value={term}>
                          {term}
                          {term === academicSystem.currentTerm && ' (Current)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Academic term for this course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/courses')}
                disabled={isSubmitting}
                className={lightThemeClasses.button.secondary}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className={lightThemeClasses.button.primary}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Course'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </>
  );
}