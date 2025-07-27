'use client';

import { useState } from 'react';
import { Course } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, BookOpen, User, Hash } from 'lucide-react';
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
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 cursor-pointer group border-2',
        isHovered && 'shadow-lg scale-[1.02] border-[#FA8072]',
        !isHovered && 'border-gray-200',
        className
      )}
      style={{
        borderTopColor: course.color,
        borderTopWidth: '4px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(course)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="Course emoji">
              {course.emoji || '📚'}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-lg line-clamp-1">{course.name}</h3>
              {course.code && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Hash className="h-3 w-3" />
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
  );
}