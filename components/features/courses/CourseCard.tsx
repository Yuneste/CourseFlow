'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, BookOpen, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden transition-all duration-300 cursor-pointer group glass-effect rounded-lg',
        isHovered && 'shadow-2xl scale-[1.02] course-card-float',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(course)}
    >
      {/* Color band at top */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: course.color }}
      />
      
      {/* Gradient overlay */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${course.color}20 0%, transparent 100%)`
        }}
      />
      
      <Card className="border-0 bg-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-4xl drop-shadow-md" role="img" aria-label="Course emoji">
                {course.emoji || '📚'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">{course.name}</h3>
              {course.code && (
                <div className="text-sm text-muted-foreground mt-1">
                  <span>{course.code}</span>
                </div>
              )}
            </div>
          </div>
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="space-y-2">
          {course.professor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span className="line-clamp-1">{course.professor}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{course.term}</span>
            {(course.credits || course.ects_credits) && (
              <span className="font-medium">
                {course.credits
                  ? `${course.credits} credits`
                  : `${course.ects_credits} ECTS`}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}