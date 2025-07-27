'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, BookOpen, Globe, Plus, Sparkles } from 'lucide-react';
import { coursesService, CreateCourseInput } from '@/lib/services/courses.service';
import { Course } from '@/types';
import { cn } from '@/lib/utils';

// Define academic systems by country
const ACADEMIC_SYSTEMS = {
  US: {
    name: 'United States',
    periodType: 'semester' as const,
    terms: ['Fall 2024', 'Spring 2025', 'Summer 2025'],
    creditSystem: 'credits',
  },
  CA: {
    name: 'Canada',
    periodType: 'semester' as const,
    terms: ['Fall 2024', 'Winter 2025', 'Summer 2025'],
    creditSystem: 'credits',
  },
  UK: {
    name: 'United Kingdom',
    periodType: 'term' as const,
    terms: ['Michaelmas 2024', 'Hilary 2025', 'Trinity 2025'],
    creditSystem: 'uk_honours',
  },
  DE: {
    name: 'Germany',
    periodType: 'semester' as const,
    terms: ['Wintersemester 2024/25', 'Sommersemester 2025'],
    creditSystem: 'ects',
  },
  NL: {
    name: 'Netherlands',
    periodType: 'trimester' as const,
    terms: ['Period 1', 'Period 2', 'Period 3', 'Period 4'],
    creditSystem: 'ects',
  },
};

type CountryCode = keyof typeof ACADEMIC_SYSTEMS;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setStep(2);
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleComplete = async () => {
    if (courses.length === 0) {
      // If no courses added, still go to dashboard
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const addCourse = async (courseData: CreateCourseInput) => {
    try {
      setIsLoading(true);
      setError(null);
      const newCourse = await coursesService.createCourse(courseData);
      setCourses([...courses, newCourse]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add course');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepCountrySelection onSelect={handleCountrySelect} />;
      case 2:
        return (
          <StepAddCourses
            country={selectedCountry!}
            academicSystem={ACADEMIC_SYSTEMS[selectedCountry!]}
            courses={courses}
            onAddCourse={addCourse}
            onNext={() => setStep(3)}
            isLoading={isLoading}
            error={error}
          />
        );
      case 3:
        return (
          <StepComplete
            coursesCount={courses.length}
            onComplete={handleComplete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CourseFlow</h1>
        <p className="text-gray-600">Let's set up your courses in just a few steps</p>
      </div>

      <div className="mb-8">
        <Progress value={progress} className="h-2" />
      </div>

      {renderStep()}

      {step < 3 && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
}

// Step 1: Country Selection
function StepCountrySelection({ onSelect }: { onSelect: (country: CountryCode) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Select Your Country
        </CardTitle>
        <CardDescription>
          We'll customize your academic calendar based on your location
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {(Object.entries(ACADEMIC_SYSTEMS) as [CountryCode, typeof ACADEMIC_SYSTEMS[CountryCode]][]).map(
            ([code, system]) => (
              <Button
                key={code}
                variant="outline"
                className="justify-between h-auto p-4"
                onClick={() => onSelect(code)}
              >
                <div className="text-left">
                  <div className="font-medium">{system.name}</div>
                  <div className="text-sm text-gray-500">
                    {system.periodType === 'semester' && 'Semester system'}
                    {system.periodType === 'term' && 'Term system'}
                    {system.periodType === 'trimester' && 'Block/Period system'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5" />
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Step 2: Add Courses
interface StepAddCoursesProps {
  country: CountryCode;
  academicSystem: typeof ACADEMIC_SYSTEMS[CountryCode];
  courses: Course[];
  onAddCourse: (course: CreateCourseInput) => Promise<void>;
  onNext: () => void;
  isLoading: boolean;
  error: string | null;
}

function StepAddCourses({
  country,
  academicSystem,
  courses,
  onAddCourse,
  onNext,
  isLoading,
  error,
}: StepAddCoursesProps) {
  const [showForm, setShowForm] = useState(false);
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

  const colors = [
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

  const emojis = ['📚', '📖', '📝', '🎓', '💻', '🔬', '🎨', '📊', '🌍', '⚖️', '🏥', '🎭'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCourse(formData);
    if (!error) {
      setFormData({
        ...formData,
        name: '',
        code: '',
        professor: '',
        credits: undefined,
        ects_credits: undefined,
      });
      setShowForm(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Add Your Courses
        </CardTitle>
        <CardDescription>
          Add the courses you're taking this term
        </CardDescription>
      </CardHeader>
      <CardContent>
        {courses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Your courses:</h3>
            <div className="grid gap-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50"
                >
                  <span className="text-2xl">{course.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-gray-500">
                      {course.code && `${course.code} • `}
                      {course.term}
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {!showForm ? (
          <div className="space-y-3">
            <Button
              onClick={() => setShowForm(true)}
              className="w-full"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a Course
            </Button>
            {courses.length > 0 && (
              <Button onClick={onNext} className="w-full">
                Continue
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Course Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Introduction to Psychology"
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Term *</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {academicSystem.terms.map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., PSY 101"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Professor</label>
                <input
                  type="text"
                  value={formData.professor}
                  onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Dr. Smith"
                  maxLength={100}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2',
                        formData.color === color ? 'border-gray-900' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Emoji</label>
                <div className="grid grid-cols-6 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, emoji })}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 text-lg',
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

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Adding...' : 'Add Course'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// Step 3: Complete
function StepComplete({
  coursesCount,
  onComplete,
}: {
  coursesCount: number;
  onComplete: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          You're All Set!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="py-8">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-lg text-gray-600">
            {coursesCount > 0
              ? `Great! You've added ${coursesCount} course${
                  coursesCount > 1 ? 's' : ''
                } to get started.`
              : 'Your account is ready! You can add courses anytime from your dashboard.'}
          </p>
        </div>
        <Button onClick={onComplete} size="lg" className="w-full">
          Go to Dashboard
          <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}