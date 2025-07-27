'use client';

import { useState, useEffect } from 'react';
import { Course, User } from '@/types';
import { CourseList } from '@/components/features/courses/CourseList';
import { FileUpload } from '@/components/features/files/FileUpload';
import { FileList } from '@/components/features/files/FileList';
import { FileCategoryView } from '@/components/features/files/FileCategoryView';
import { StorageUsage } from '@/components/features/files/StorageUsage';
import { UploadStats } from '@/components/features/files/UploadStats';
import { coursesService } from '@/lib/services/courses.service';
import { useAppStore } from '@/stores/useAppStore';
import { useRouter } from 'next/navigation';
import { getAcademicSystemWithTerms } from '@/lib/academic-systems';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FolderOpen, Grid3x3, List } from 'lucide-react';
import { filesService } from '@/lib/services/files.service';
import type { File } from '@/types';

interface DashboardClientProps {
  initialCourses: Course[];
  userProfile: any;
}

export function DashboardClient({ initialCourses, userProfile }: DashboardClientProps) {
  const router = useRouter();
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [activeTab, setActiveTab] = useState<'courses' | 'files'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [fileViewMode, setFileViewMode] = useState<'list' | 'category'>('category');
  
  // Get state and actions from Zustand store
  const {
    courses,
    isLoadingCourses,
    coursesError,
    setCourses,
    addCourse,
    updateCourse,
    deleteCourse,
    setLoadingCourses,
    setCoursesError,
  } = useAppStore();

  // Initialize courses in store on mount
  useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses, setCourses]);

  // Determine academic system based on user's country
  const academicSystem = getAcademicSystemWithTerms(userProfile?.country || 'US');

  const handleCreateCourse = async (courseData: any) => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      const newCourse = await coursesService.createCourse({
        ...courseData,
        academic_period_type: academicSystem.periodType,
      });
      addCourse(newCourse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course';
      setCoursesError(errorMessage);
      throw err; // Re-throw to let the form handle it
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleUpdateCourse = async (id: string, updates: any) => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      const updatedCourse = await coursesService.updateCourse(id, updates);
      updateCourse(id, updatedCourse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course';
      setCoursesError(errorMessage);
      throw err;
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      await coursesService.deleteCourse(id);
      deleteCourse(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course';
      setCoursesError(errorMessage);
      throw err;
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    // For future use - could navigate to course details page
    // For now, the CourseList component handles edit/delete internally
    console.log('Course clicked:', course);
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await filesService.deleteFile(fileId);
      const { deleteFile: deleteFileFromStore } = useAppStore.getState();
      deleteFileFromStore(fileId);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileDownload = async (file: File) => {
    try {
      const downloadData = await filesService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadData.url;
      link.download = downloadData.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'courses' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('courses')}
          className="rounded-b-none"
        >
          Courses
        </Button>
        <Button
          variant={activeTab === 'files' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('files')}
          className="rounded-b-none"
        >
          <FolderOpen className="mr-2 h-4 w-4" />
          Files
        </Button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          {coursesError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {coursesError}
            </div>
          )}
          
          <CourseList
            courses={courses}
            academicSystem={academicSystem}
            isLoading={isLoadingCourses}
            onCreateCourse={handleCreateCourse}
            onUpdateCourse={handleUpdateCourse}
            onDeleteCourse={handleDeleteCourse}
            viewMode="grid"
          />
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">My Files</h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={fileViewMode === 'category' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setFileViewMode('category')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={fileViewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setFileViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button
                onClick={() => setShowFileUpload(!showFileUpload)}
                variant={showFileUpload ? 'secondary' : 'default'}
              >
                <Upload className="mr-2 h-4 w-4" />
                {showFileUpload ? 'Hide Upload' : 'Upload Files'}
              </Button>
            </div>
          </div>

          {/* Course Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Filter by course:</label>
            <select
              className="p-2 border rounded-md max-w-xs"
              value={selectedCourse?.id || ''}
              onChange={(e) => {
                const course = courses.find(c => c.id === e.target.value);
                setSelectedCourse(course || null);
              }}
            >
              <option value="">All Files</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.emoji} {course.name} ({course.term})
                </option>
              ))}
            </select>
          </div>

          {/* Stats and Usage Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StorageUsage userTier="free" />
            <UploadStats />
          </div>

          {showFileUpload && (
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Course for Upload
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedCourse?.id || ''}
                    onChange={(e) => {
                      const course = courses.find(c => c.id === e.target.value);
                      setSelectedCourse(course || null);
                    }}
                  >
                    <option value="">No specific course (General files)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.emoji} {course.name} ({course.term})
                      </option>
                    ))}
                  </select>
                </div>
                
                <FileUpload
                  courseId={selectedCourse?.id}
                  onUploadComplete={() => {
                    // Optionally hide upload after completion
                    // setShowFileUpload(false);
                  }}
                />
              </div>
            </Card>
          )}

          {fileViewMode === 'list' ? (
            <FileList courseId={selectedCourse?.id} />
          ) : (
            <FileCategoryView 
              courseId={selectedCourse?.id}
              onFileDelete={handleFileDelete}
              onFileDownload={handleFileDownload}
            />
          )}
        </div>
      )}
    </div>
  );
}