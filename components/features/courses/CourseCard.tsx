'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, BookOpen, User, Calendar, Hash, FolderOpen, FileText } from 'lucide-react';
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
  fileCount?: number;
  folderCount?: number;
}

const courseColors = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  { bg: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
];

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onClick,
  className,
  fileCount = 0,
  folderCount = 0,
}: CourseCardProps) {
  const colorIndex = course.id.charCodeAt(0) % courseColors.length;
  const colors = courseColors[colorIndex];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn('relative group', className)}
      onClick={() => onClick?.(course)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl bg-white dark:bg-gray-800",
        "border border-gray-100 dark:border-gray-700",
        "shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer",
        "before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/50 before:to-transparent before:opacity-0 before:transition-opacity hover:before:opacity-100"
      )}>
        {/* Color accent bar */}
        <div className={cn("absolute inset-x-0 top-0 h-1", colors.bg)} />
        
        {/* Main content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Course icon with gradient background */}
              <div className={cn(
                "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                colors.light,
                "group-hover:scale-110 transition-transform duration-300"
              )}>
                <BookOpen className={cn("w-6 h-6", colors.text)} />
              </div>
              
              {/* Course info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                  {course.name}
                </h3>
                {course.code && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    {course.code}
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

          {/* Professor and term */}
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-400">
            {course.professor && (
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{course.professor}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{course.term}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm">
                <FolderOpen className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{folderCount}</span>
                <span className="text-gray-500 dark:text-gray-400">folders</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{fileCount}</span>
                <span className="text-gray-500 dark:text-gray-400">files</span>
              </div>
            </div>
            
            {(course.credits || course.ects_credits) && (
              <div className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                colors.light, colors.text
              )}>
                {course.credits ? `${course.credits} credits` : `${course.ects_credits} ECTS`}
              </div>
            )}
          </div>
        </div>

        {/* Hover effect gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </motion.div>
  );
}