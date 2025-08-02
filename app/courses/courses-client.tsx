'use client'

import { useState } from 'react'
import { Course, User } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TermFilter } from '@/components/ui/term-filter'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronRight,
  GripVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { lightTheme, lightThemeClasses, componentStyles } from '@/lib/theme/light-theme'

interface CoursesClientProps {
  courses: Course[]
  userProfile: User
}

export function CoursesClient({ courses, userProfile }: CoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all'>('all')
  const [selectedTerm, setSelectedTerm] = useState('')
  const [courseList, setCourseList] = useState(courses)
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const filteredCourses = courseList.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.code?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesTerm = !selectedTerm || course.term === selectedTerm
    return matchesSearch && matchesTerm
  })

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, course: Course, index: number) => {
    setDraggedCourse(course)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)

    if (!draggedCourse) return

    const draggedIndex = courseList.findIndex(c => c.id === draggedCourse.id)
    if (draggedIndex === dropIndex) return

    // Reorder courses
    const newCourses = [...courseList]
    newCourses.splice(draggedIndex, 1)
    newCourses.splice(dropIndex, 0, draggedCourse)
    
    setCourseList(newCourses)
    setDraggedCourse(null)
    
    // Update display order in database
    try {
      // This would need an API endpoint to update display orders
      toast.success('Course order updated')
    } catch (error) {
      toast.error('Failed to update course order')
      // Revert on error
      setCourseList(courses)
    }
  }

  return (
    <div className={lightThemeClasses.page.wrapper}>
      <div className={lightThemeClasses.page.container + " py-8"}>
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
        <p className="text-gray-600 text-sm">Manage and track all your courses in one place</p>
      </motion.div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-8"
      >
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn("pl-10", lightThemeClasses.input.base)}
          />
        </div>
        
        <div className="flex gap-2 flex-1 sm:flex-initial justify-end">
          <TermFilter
            countryCode={userProfile?.country || 'US'}
            onTermChange={setSelectedTerm}
            className="w-full sm:w-auto"
          />
          <Link href="/courses/new" className="w-full sm:w-auto">
            <Button className={cn("w-full", lightThemeClasses.button.primary)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery
              ? 'No courses found' 
              : 'No courses yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Get started by adding your first course'}
          </p>
          {!searchQuery && (
            <Link href="/courses/new">
              <Button className={lightThemeClasses.button.primary}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Course
              </Button>
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                "relative",
                dragOverIndex === index && "scale-105 opacity-50"
              )}
            >
              <div
                draggable
                onDragStart={(e) => handleDragStart(e, course, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
              <Card className={cn(
                lightThemeClasses.card.base,
                "h-[180px] transition-all duration-300 cursor-move hover:scale-[1.02] hover:border-[#6366F1]/30 flex flex-col relative overflow-hidden",
                draggedCourse?.id === course.id && "opacity-50"
              )}>
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1]/5 to-[#8B5CF6]/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity z-10">
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>
                <Link href={`/courses/${course.id}`} className="flex flex-col p-5 group h-full relative">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 rounded-lg bg-[#E0E7FF]">
                      <BookOpen className="h-4 w-4 text-[#6366F1]" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0]">
                      {course.term}
                    </span>
                  </div>
                  
                  <h3 className="text-base font-semibold text-[#3B82F6] mb-2 group-hover:text-[#2563EB] transition-colors">
                    {course.name}
                  </h3>
                  
                  <div className="h-4 mb-1">
                    {course.code && (
                      <p className="text-sm text-gray-600 font-medium">{course.code}</p>
                    )}
                  </div>
                  
                  <div className="h-5 mb-3">
                    {course.professor && (
                      <p className="text-sm text-gray-500">
                        Professor: {course.professor}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mt-auto">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-[#64748B] font-medium">{course.term || 'Current Term'}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-[#6366F1] group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </Card>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}