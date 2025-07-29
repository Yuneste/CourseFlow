'use client'

import { useState } from 'react'
import { Course, User } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Calendar,
  Plus,
  Search,
  Filter,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CoursesClientProps {
  courses: Course[]
  userProfile: User
}

export function CoursesClient({ courses, userProfile }: CoursesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all'>('all')

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course.code?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    return matchesSearch
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">My Courses</h1>
        <p className="text-[#1a1a1a]/70 font-medium">Manage and track all your courses in one place</p>
      </motion.div>

      {/* Actions Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#1a1a1a]/50" />
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/90 border-[#C7C7AD]/30"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Filter buttons can be added here when needed */}
        </div>

        <Link href="/courses/new">
          <Button className="bg-[#F0C4C0] hover:bg-[#F0C4C0]/90 text-[#1a1a1a] w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </Link>
      </motion.div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-12"
        >
          <BookOpen className="h-16 w-16 text-[#C7C7AD] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#1a1a1a] mb-2">
            {searchQuery
              ? 'No courses found' 
              : 'No courses yet'}
          </h3>
          <p className="text-[#1a1a1a]/70 mb-4">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Get started by adding your first course'}
          </p>
          {!searchQuery && (
            <Link href="/courses/new">
              <Button className="bg-[#F0C4C0] hover:bg-[#F0C4C0]/90 text-[#1a1a1a]">
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
            >
              <Link href={`/courses/${course.id}`}>
                <Card className="h-full p-6 hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur-sm border-[#C7C7AD]/30 cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 rounded-lg bg-[#F0C4C0]/20">
                      <BookOpen className="h-6 w-6 text-[#1a1a1a]" />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[#ECF0C0] text-[#1a1a1a]">
                      {course.term}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1 group-hover:text-[#FA8072] transition-colors">
                    {course.name}
                  </h3>
                  {course.code && (
                    <p className="text-sm text-[#1a1a1a]/60 font-medium mb-2">{course.code}</p>
                  )}
                  
                  {course.professor && (
                    <p className="text-sm text-[#1a1a1a]/70 mb-3">
                      Professor: {course.professor}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-[#1a1a1a]/60">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{course.term || 'Current Term'}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}