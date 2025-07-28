'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, BookOpen, User, Calendar, Hash } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onClick?: (course: Course) => void;
  className?: string;
}

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onClick,
  className,
}: CourseCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn('relative group', className)}
      onClick={() => onClick?.(course)}
    >
      <Card className="overflow-hidden border border-gray-200/60 bg-white/70 backdrop-blur-sm hover:border-[#FA8072]/20 hover:shadow-lg hover:shadow-[#FA8072]/5 transition-all duration-200 cursor-pointer">
        {/* Subtle gradient line at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FA8072]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Icon with subtle background */}
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E1] flex items-center justify-center group-hover:from-[#FFE4E1] group-hover:to-[#FFDDD9] transition-colors">
                <BookOpen className="w-5 h-5 text-[#FA8072]" />
              </div>
              
              {/* Course info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-[#FA8072] transition-colors">
                  {course.name}
                </h3>
                {course.course_code && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Hash className="w-3 h-3" />
                    {course.course_code}
                  </p>
                )}
              </div>
            </div>

            {/* Action menu */}
            {(onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(course);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(course);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-600 min-w-0">
              {course.professor && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <User className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{course.professor}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{course.term}</span>
              </div>
            </div>
            
            {(course.credits || course.ects_credits) && (
              <div className="flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {course.credits ? `${course.credits} credits` : `${course.ects_credits} ECTS`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}