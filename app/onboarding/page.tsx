'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, BookOpen, Globe, Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { coursesService, CreateCourseInput } from '@/lib/services/courses.service';
import { Course } from '@/types';
import { cn } from '@/lib/utils';
import { BenefitsShowcaseStyles } from '@/components/features/onboarding/BenefitsShowcase';
import { BenefitsShowcaseAnimated } from '@/components/features/onboarding/BenefitsShowcaseAnimated';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';

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
  const [studyProgram, setStudyProgram] = useState({
    study_program: '',
    degree_type: '' as any,
    start_year: new Date().getFullYear(),
    expected_graduation_year: new Date().getFullYear() + 4,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showBenefits, setShowBenefits] = useState(false);
  const [academicSystem, setAcademicSystem] = useState<ReturnType<typeof getAcademicSystemWithTerms> | null>(null);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleCountrySelect = async (country: CountryCode) => {
    setSelectedCountry(country);
    const system = getAcademicSystemWithTerms(country);
    setAcademicSystem(system);
    
    // Save country immediately to profile
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      });
      
      if (!response.ok) {
        console.error('Failed to save country to profile');
      }
    } catch (error) {
      console.error('Error saving country:', error);
    }
    
    setStep(2);
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  const handleComplete = async () => {
    try {
      // Save study program information and mark onboarding as completed
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studyProgram,
          country: selectedCountry,
          onboarding_completed: true,
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update profile');
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
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

  const updateCourse = async (id: string, courseData: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedCourse = await coursesService.updateCourse(id, courseData);
      setCourses(courses.map(course => 
        course.id === id ? updatedCourse : course
      ));
      setEditingCourse(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await coursesService.deleteCourse(id);
      setCourses(courses.filter(course => course.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
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
          <StepStudyProgram
            country={selectedCountry!}
            studyProgram={studyProgram}
            onChange={setStudyProgram}
            onNext={() => setStep(3)}
            onPrevious={() => setStep(1)}
          />
        );
      case 3:
        return academicSystem ? (
          <StepAddCourses
            country={selectedCountry!}
            academicSystem={academicSystem}
            courses={courses}
            onAddCourse={addCourse}
            onUpdateCourse={updateCourse}
            onDeleteCourse={deleteCourse}
            onNext={() => setStep(4)}
            onPrevious={() => setStep(2)}
            isLoading={isLoading}
            error={error}
            editingCourse={editingCourse}
            setEditingCourse={setEditingCourse}
          />
        ) : null;
      case 4:
        return (
          <StepComplete
            coursesCount={courses.length}
            onComplete={handleComplete}
            onShowBenefits={() => setShowBenefits(true)}
            onPrevious={() => setStep(3)}
          />
        );
      default:
        return null;
    }
  };

  if (showBenefits) {
    return (
      <>
        <BenefitsShowcaseStyles />
        <BenefitsShowcaseAnimated onComplete={handleComplete} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F5] via-white to-[#FFF8F5]">
      <div className="max-w-2xl mx-auto pt-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] bg-clip-text text-transparent mb-2">
            Welcome to CourseFlow
          </h1>
          <p className="text-gray-600">Let&apos;s set up your courses in just a few steps</p>
        </div>

        <div className="mb-8">
          <Progress value={progress} className="h-3 bg-[#FFE4E1]" />
        </div>

      {renderStep()}

      </div>
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
          We&apos;ll customize your academic calendar based on your location
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
  academicSystem: ReturnType<typeof getAcademicSystemWithTerms>;
  courses: Course[];
  onAddCourse: (course: CreateCourseInput) => Promise<void>;
  onUpdateCourse: (id: string, course: any) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onNext: () => void;
  onPrevious: () => void;
  isLoading: boolean;
  error: string | null;
  editingCourse: Course | null;
  setEditingCourse: (course: Course | null) => void;
}

function StepAddCourses({
  country,
  academicSystem,
  courses,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onNext,
  onPrevious,
  isLoading,
  error,
  editingCourse,
  setEditingCourse,
}: StepAddCoursesProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateCourseInput>({
    name: '',
    term: academicSystem.currentTerm || academicSystem.terms[0],
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
    
    if (editingCourse) {
      await onUpdateCourse(editingCourse.id, formData);
    } else {
      await onAddCourse(formData);
    }
    
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
      setEditingCourse(null);
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
          Add the courses you&apos;re taking this term
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
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 group hover:bg-gray-100 transition-colors"
                >
                  <span className="text-2xl">{course.emoji}</span>
                  <div className="flex-1">
                    <div className="font-medium">{course.name}</div>
                    <div className="text-sm text-gray-500">
                      {course.code && `${course.code} • `}
                      {course.term}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingCourse(course);
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
                        setShowForm(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteCourse(course.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
            {courses.length === 0 && (
              <Button 
                onClick={onPrevious}
                variant="outline"
                className="w-full"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            {courses.length > 0 && (
              <div className="flex gap-3">
                <Button 
                  onClick={onPrevious}
                  variant="outline"
                  className="flex-1"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                <Button onClick={onNext} className="flex-1 bg-[#FA8072] hover:bg-[#FF6B6B] text-white">
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
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

            {academicSystem.creditSystem === 'credits' && (
              <div>
                <label className="block text-sm font-medium mb-1">Credits</label>
                <input
                  type="number"
                  value={formData.credits || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, credits: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 3"
                  min="0"
                  max="10"
                />
              </div>
            )}

            {academicSystem.creditSystem === 'ects' && (
              <div>
                <label className="block text-sm font-medium mb-1">ECTS Credits</label>
                <input
                  type="number"
                  value={formData.ects_credits || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, ects_credits: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6"
                  min="0"
                  max="30"
                />
              </div>
            )}

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
                onClick={() => {
                  setShowForm(false);
                  setEditingCourse(null);
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
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (editingCourse ? 'Updating...' : 'Adding...') : (editingCourse ? 'Update Course' : 'Add Course')}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

// Step 2: Study Program
interface StepStudyProgramProps {
  country: CountryCode;
  studyProgram: {
    study_program: string;
    degree_type: string;
    start_year: number;
    expected_graduation_year: number;
  };
  onChange: (program: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}

function StepStudyProgram({ country, studyProgram, onChange, onNext, onPrevious }: StepStudyProgramProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i);
  
  // Define degree types based on country
  const getDegreeTypes = () => {
    switch (country) {
      case 'DE':
        return [
          { value: 'bachelor', label: 'Bachelor' },
          { value: 'master', label: 'Master' },
          { value: 'diploma', label: 'Diplom' },
          { value: 'phd', label: 'Promotion (Dr.)' },
        ];
      case 'US':
      case 'CA':
        return [
          { value: 'associate', label: "Associate's Degree" },
          { value: 'undergraduate', label: "Bachelor's Degree" },
          { value: 'graduate', label: "Master's Degree" },
          { value: 'phd', label: 'Doctoral Degree (PhD)' },
        ];
      case 'UK':
        return [
          { value: 'undergraduate', label: 'Undergraduate (BSc/BA)' },
          { value: 'postgraduate', label: 'Postgraduate (MSc/MA)' },
          { value: 'phd', label: 'Doctoral (PhD/DPhil)' },
        ];
      default:
        return [
          { value: 'bachelor', label: "Bachelor's Degree" },
          { value: 'master', label: "Master's Degree" },
          { value: 'phd', label: 'Doctoral Degree' },
          { value: 'other', label: 'Other' },
        ];
    }
  };

  const degreeTypes = getDegreeTypes();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (studyProgram.study_program && studyProgram.degree_type) {
      onNext();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Your Study Program
        </CardTitle>
        <CardDescription>
          Tell us about your academic journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="study_program">What are you studying? *</Label>
            <Input
              id="study_program"
              value={studyProgram.study_program}
              onChange={(e) => onChange({ ...studyProgram, study_program: e.target.value })}
              placeholder={
                country === 'DE' ? 'z.B. Informatik, Maschinenbau, BWL' : 
                country === 'US' ? 'e.g., Computer Science, Engineering, Business' :
                'e.g., Computer Science, Engineering, Business'
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="degree_type">Degree Type *</Label>
            <Select
              value={studyProgram.degree_type}
              onValueChange={(value) => onChange({ ...studyProgram, degree_type: value })}
              required
            >
              <SelectTrigger id="degree_type">
                <SelectValue placeholder="Select your degree type" />
              </SelectTrigger>
              <SelectContent>
                {degreeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_year">Start Year</Label>
              <Select
                value={studyProgram.start_year.toString()}
                onValueChange={(value) => onChange({ ...studyProgram, start_year: parseInt(value) })}
              >
                <SelectTrigger id="start_year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_graduation">Expected Graduation</Label>
              <Select
                value={studyProgram.expected_graduation_year.toString()}
                onValueChange={(value) => onChange({ ...studyProgram, expected_graduation_year: parseInt(value) })}
              >
                <SelectTrigger id="expected_graduation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.filter(year => year >= studyProgram.start_year).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={onPrevious}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-[#FA8072] hover:bg-[#FF6B6B] text-white"
              disabled={!studyProgram.study_program || !studyProgram.degree_type}
            >
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 4: Complete
function StepComplete({
  coursesCount,
  onComplete,
  onShowBenefits,
  onPrevious,
}: {
  coursesCount: number;
  onComplete: () => void;
  onShowBenefits: () => void;
  onPrevious: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          You&apos;re All Set!
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-6">
        <div className="py-8">
          <p className="text-lg text-gray-600">
            {coursesCount > 0
              ? `Great! You've added ${coursesCount} course${
                  coursesCount > 1 ? 's' : ''
                } to get started.`
              : 'Your account is ready! You can add courses anytime from your dashboard.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={onPrevious}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>
          <Button onClick={onShowBenefits} size="lg" className="flex-1 bg-[#FA8072] hover:bg-[#FF6B6B] text-white">
            Discover CourseFlow
            <ChevronRight className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}