'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Edit, 
  Trash2, 
  BookOpen, 
  User, 
  Calendar, 
  Hash, 
  FolderOpen, 
  FileText,
  Star,
  Clock,
  TrendingUp,
  Target
} from 'lucide-react';
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
  recentActivity?: string;
  progressPercent?: number;
}

const courseColorSchemes = [
  { 
    bg: 'bg-gradient-to-br from-blue-500 to-blue-600', 
    light: 'bg-blue-50 dark:bg-blue-950/30', 
    text: 'text-blue-600 dark:text-blue-400', 
    border: 'border-blue-200 dark:border-blue-800',
    accent: 'bg-blue-100 dark:bg-blue-900/50'
  },
  { 
    bg: 'bg-gradient-to-br from-purple-500 to-purple-600', 
    light: 'bg-purple-50 dark:bg-purple-950/30', 
    text: 'text-purple-600 dark:text-purple-400', 
    border: 'border-purple-200 dark:border-purple-800',
    accent: 'bg-purple-100 dark:bg-purple-900/50'
  },
  { 
    bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', 
    light: 'bg-emerald-50 dark:bg-emerald-950/30', 
    text: 'text-emerald-600 dark:text-emerald-400', 
    border: 'border-emerald-200 dark:border-emerald-800',
    accent: 'bg-emerald-100 dark:bg-emerald-900/50'
  },
  { 
    bg: 'bg-gradient-to-br from-amber-500 to-amber-600', 
    light: 'bg-amber-50 dark:bg-amber-950/30', 
    text: 'text-amber-600 dark:text-amber-400', 
    border: 'border-amber-200 dark:border-amber-800',
    accent: 'bg-amber-100 dark:bg-amber-900/50'
  },
  { 
    bg: 'bg-gradient-to-br from-rose-500 to-rose-600', 
    light: 'bg-rose-50 dark:bg-rose-950/30', 
    text: 'text-rose-600 dark:text-rose-400', 
    border: 'border-rose-200 dark:border-rose-800',
    accent: 'bg-rose-100 dark:bg-rose-900/50'
  },
  { 
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', 
    light: 'bg-indigo-50 dark:bg-indigo-950/30', 
    text: 'text-indigo-600 dark:text-indigo-400', 
    border: 'border-indigo-200 dark:border-indigo-800',
    accent: 'bg-indigo-100 dark:bg-indigo-900/50'
  },
];

export function CourseCard({
  course,
  onEdit,
  onDelete,
  onClick,
  className,
  fileCount = 0,
  folderCount = 0,
  recentActivity = 'No recent activity',
  progressPercent = 0,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colorIndex = course.id.charCodeAt(0) % courseColorSchemes.length;
  const colors = courseColorSchemes[colorIndex];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn('relative group cursor-pointer', className)}
      onClick={() => onClick?.(course)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border",
        "shadow-sm hover:shadow-xl transition-all duration-500",
        "backdrop-blur-sm min-h-[280px]"
      )}>
        {/* Header with gradient accent */}
        <div className="relative">
          {/* Gradient header */}
          <div className={cn("h-24 w-full", colors.bg)}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              {/* Course icon */}
              <motion.div 
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <BookOpen className="h-5 w-5 text-white" />
              </motion.div>

              {/* Action menu */}
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(course);
                        }}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Course
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(course);
                        }}
                        className="gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Course
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Course info overlay */}
          <div className="absolute -bottom-4 left-4 right-4">
            <div className="bg-card rounded-lg shadow-lg border border-border p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "p-2 rounded-lg flex-shrink-0",
                  colors.light
                )}>
                  <BookOpen className={cn("h-5 w-5", colors.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg text-foreground line-clamp-1 mb-1">
                    {course.name}
                  </h3>
                  {course.code && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Hash className="h-3 w-3" />
                      {course.code}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="pt-8 px-4 pb-4">
          {/* Course details */}
          <div className="space-y-3 mb-4">
            {course.professor && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="truncate">{course.professor}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{course.term}</span>
            </div>
          </div>

          {/* Progress bar */}
          {progressPercent > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn("font-medium", colors.text)}>{progressPercent}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full", colors.bg)}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={cn("p-3 rounded-lg", colors.accent)}>
              <div className="flex items-center gap-2">
                <FolderOpen className={cn("h-4 w-4", colors.text)} />
                <div>
                  <p className="text-sm font-medium text-foreground">{folderCount}</p>
                  <p className="text-xs text-muted-foreground">Folders</p>
                </div>
              </div>
            </div>
            <div className={cn("p-3 rounded-lg", colors.accent)}>
              <div className="flex items-center gap-2">
                <FileText className={cn("h-4 w-4", colors.text)} />
                <div>
                  <p className="text-sm font-medium text-foreground">{fileCount}</p>
                  <p className="text-xs text-muted-foreground">Files</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent activity */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="truncate">{recentActivity}</span>
          </div>

          {/* Credits badge */}
          {(course.credits || course.ects_credits) && (
            <div className="absolute top-28 right-4">
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium border",
                colors.light, colors.text, colors.border
              )}>
                {course.credits ? `${course.credits} credits` : `${course.ects_credits} ECTS`}
              </div>
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <motion.div 
          className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Floating action button */}
        <motion.div
          className="absolute bottom-4 right-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          transition={{ duration: 0.2 }}
        >
          <Button 
            size="sm"
            className="h-8 w-8 p-0 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(course);
            }}
          >
            <Target className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
          <div className={cn(
            "absolute top-2 right-2 w-12 h-12 rounded-full opacity-20",
            colors.bg
          )} />
        </div>
      </div>
    </motion.div>
  );
}