'use client';

import { useState, useEffect } from 'react';
import { Course } from '@/types';
import { CreateCourseInput, UpdateCourseInput } from '@/lib/services/courses.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCourseInput | UpdateCourseInput) => Promise<void>;
  course?: Course | null;
  academicSystem: {
    terms: string[];
    periodType: 'semester' | 'term' | 'trimester';
    creditSystem: string;
  };
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // purple
];

const EMOJIS = ['📚', '📖', '📝', '🎓', '💻', '🔬', '🎨', '📊', '🌍', '⚖️', '🏥', '🎭'];

export function CourseForm({
  open,
  onOpenChange,
  onSubmit,
  course,
  academicSystem,
}: CourseFormProps) {
  const [formData, setFormData] = useState<CreateCourseInput>({
    name: '',
    term: academicSystem.terms[0],
    code: '',
    professor: '',
    academic_period_type: academicSystem.periodType,
    credits: undefined,
    ects_credits: undefined,
    color: '#3B82F6',
    emoji: '📚',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when course changes or dialog opens
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        term: course.term,
        code: course.code || '',
        professor: course.professor || '',
        academic_period_type: course.academic_period_type,
        credits: course.credits || undefined,
        ects_credits: course.ects_credits || undefined,
        color: course.color,
        emoji: course.emoji || '📚',
      });
    } else {
      setFormData({
        name: '',
        term: academicSystem.terms[0],
        code: '',
        professor: '',
        academic_period_type: academicSystem.periodType,
        credits: undefined,
        ects_credits: undefined,
        color: '#3B82F6',
        emoji: '📚',
      });
    }
    setErrors({});
  }, [course, open, academicSystem]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Course name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Course name must be 100 characters or less';
    }

    if (!formData.term) {
      newErrors.term = 'Term is required';
    }

    if (formData.code && formData.code.length > 20) {
      newErrors.code = 'Course code must be 20 characters or less';
    }

    if (formData.professor && formData.professor.length > 100) {
      newErrors.professor = 'Professor name must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        name: formData.name.trim(),
        code: formData.code?.trim() || undefined,
        professor: formData.professor?.trim() || undefined,
      };

      await onSubmit(dataToSubmit);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{course ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {course
                ? 'Update the course information below.'
                : 'Fill in the details for your new course.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Course Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Introduction to Psychology"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="term">Term *</Label>
                <Select
                  value={formData.term}
                  onValueChange={(value) => setFormData({ ...formData, term: value })}
                >
                  <SelectTrigger id="term" className={errors.term ? 'border-red-500' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {academicSystem.terms.map((term) => (
                      <SelectItem key={term} value={term}>
                        {term}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.term && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.term}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., PSY 101"
                  className={errors.code ? 'border-red-500' : ''}
                />
                {errors.code && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.code}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professor">Professor</Label>
              <Input
                id="professor"
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                placeholder="e.g., Dr. Smith"
                className={errors.professor ? 'border-red-500' : ''}
              />
              {errors.professor && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.professor}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="grid grid-cols-6 gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 transition-all',
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      )}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Emoji</Label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={cn(
                        'w-10 h-10 rounded-lg border-2 text-lg transition-all',
                        formData.emoji === emoji
                          ? 'border-gray-900 bg-gray-100'
                          : 'border-transparent hover:bg-gray-50'
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {academicSystem.creditSystem === 'credits' && (
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.credits || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      credits: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="e.g., 3"
                />
              </div>
            )}

            {academicSystem.creditSystem === 'ects' && (
              <div className="space-y-2">
                <Label htmlFor="ects">ECTS Credits</Label>
                <Input
                  id="ects"
                  type="number"
                  min="0"
                  max="30"
                  value={formData.ects_credits || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ects_credits: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="e.g., 6"
                />
              </div>
            )}
          </div>
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
              {isSubmitting ? 'Saving...' : course ? 'Update Course' : 'Add Course'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}