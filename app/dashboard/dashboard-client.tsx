'use client';

import { useState, useEffect, useRef } from 'react';
import { Course, User } from '@/types';
import { CourseList } from '@/components/features/courses/CourseList';
import { FileUpload } from '@/components/features/files/FileUpload';
import { FileUploadWithDetection } from '@/components/features/files/FileUploadWithDetection';
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
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'files'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
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
    router.push(`/dashboard/courses/${course.id}`);
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
    <>
      <div className="space-y-6">
      {/* Quick Upload Button - Always Visible */}
      <div className="mb-4">
        <Button
          onClick={() => {
            setActiveTab('files');
            setShowFileUpload(true);
            setTimeout(() => {
              uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }}
          size="lg"
          className="w-full sm:w-auto bg-gradient-to-r from-[#FA8072] to-[#FF6B6B] hover:from-[#FF6B6B] hover:to-[#FA8072] text-white shadow-lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          Upload Files
        </Button>
      </div>

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
            onCourseClick={handleCourseClick}
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
              <Button
                onClick={() => {
                  setShowFileUpload(!showFileUpload);
                  // Auto-scroll to upload section when opened
                  if (!showFileUpload) {
                    setTimeout(() => {
                      uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }
                }}
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

          {showFileUpload && (
            <div ref={uploadSectionRef}>
              <Card className="p-6 bg-gradient-to-br from-white to-gray-50/50">
                {/* Storage Stats Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <StorageUsage userTier="free" />
                  <UploadStats />
                </div>
                
                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Recently Uploaded Files */}
                    <div className="space-y-4 order-2 lg:order-1">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Recently Uploaded</h3>
                        <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                          <p className="text-sm text-gray-600">Your uploaded files will appear here...</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Upload Section */}
                    <div className="space-y-4 order-1 lg:order-2">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Upload New Files</h3>
                        <div className="space-y-3">
                          <select
                            className="w-full p-2 border rounded-md text-sm"
                            value={selectedCourse?.id || ''}
                            onChange={(e) => {
                              const course = courses.find(c => c.id === e.target.value);
                              setSelectedCourse(course || null);
                            }}
                          >
                            <option value="">Auto-detect course from content</option>
                            {courses.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.emoji} {course.name} ({course.term})
                              </option>
                            ))}
                          </select>
                          
                          <FileUploadWithDetection
                            courseId={selectedCourse?.id}
                            onUploadComplete={() => {
                              // Files are automatically added to the store
                              // No need to reload
                            }}
                            compact={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          <FileCategoryView 
            courseId={selectedCourse?.id}
            onFileDelete={handleFileDelete}
            onFileDownload={handleFileDownload}
          />
        </div>
      )}
    </div>
    </>
  );
}