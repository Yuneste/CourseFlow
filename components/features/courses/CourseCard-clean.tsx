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
  Clock,
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
import { ANIMATION } from '@/lib/constants/ui.constants';

// Types
interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
  onClick?: (course: Course) => void;
  className?: string;
  statistics?: CourseStatistics;
}

interface CourseStatistics {
  fileCount: number;
  folderCount: number;
  recentActivity: string;
  progressPercent: number;
}

// Constants
const COLOR_SCHEMES = [
  { name: 'blue', hue: 500 },
  { name: 'purple', hue: 500 },
  { name: 'emerald', hue: 500 },
  { name: 'amber', hue: 500 },
  { name: 'rose', hue: 500 },
  { name: 'indigo', hue: 500 },
] as const;

const DEFAULT_STATISTICS: CourseStatistics = {
  fileCount: 0,
  folderCount: 0,
  recentActivity: 'No recent activity',
  progressPercent: 0,
};

// Utilities
function getColorScheme(courseId: string) {
  const index = courseId.charCodeAt(0) % COLOR_SCHEMES.length;
  const scheme = COLOR_SCHEMES[index];
  
  return {
    gradient: `bg-gradient-to-br from-${scheme.name}-500 to-${scheme.name}-600`,
    light: `bg-${scheme.name}-50 dark:bg-${scheme.name}-950/30`,
    text: `text-${scheme.name}-600 dark:text-${scheme.name}-400`,
    border: `border-${scheme.name}-200 dark:border-${scheme.name}-800`,
    accent: `bg-${scheme.name}-100 dark:bg-${scheme.name}-900/50`,
  };
}

// Sub-components
const CourseHeader = ({ 
  course, 
  colors,
  onEdit,
  onDelete 
}: {
  course: Course;
  colors: ReturnType<typeof getColorScheme>;
  onEdit?: CourseCardProps['onEdit'];
  onDelete?: CourseCardProps['onDelete'];
}) => (
  <div className="relative">
    <div className={cn("h-24 w-full", colors.gradient)}>
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
        <CourseIcon />
        {(onEdit || onDelete) && (
          <CourseActions course={course} onEdit={onEdit} onDelete={onDelete} />
        )}
      </div>
    </div>
    <CourseInfoOverlay course={course} colors={colors} />
  </div>
);

const CourseIcon = () => (
  <motion.div 
    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg"
    whileHover={{ scale: 1.1, rotate: 5 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <BookOpen className="h-5 w-5 text-white" />
  </motion.div>
);

const CourseActions = ({ 
  course, 
  onEdit, 
  onDelete 
}: {
  course: Course;
  onEdit?: CourseCardProps['onEdit'];
  onDelete?: CourseCardProps['onDelete'];
}) => (
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
);

const CourseInfoOverlay = ({ 
  course, 
  colors 
}: {
  course: Course;
  colors: ReturnType<typeof getColorScheme>;
}) => (
  <div className="absolute -bottom-4 left-4 right-4">
    <div className="bg-card rounded-lg shadow-lg border border-border p-4">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg flex-shrink-0", colors.light)}>
          <BookOpen className={cn("h-5 w-5", colors.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg text-foreground line-clamp-1 mb-1">
            {course.name}
          </h3>
          {course.code && <CourseCode code={course.code} />}
        </div>
      </div>
    </div>
  </div>
);

const CourseCode = ({ code }: { code: string }) => (
  <div className="flex items-center gap-1 text-sm text-muted-foreground">
    <Hash className="h-3 w-3" />
    {code}
  </div>
);

const CourseDetails = ({ course }: { course: Course }) => (
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
);

const CourseProgress = ({ 
  percent, 
  colors 
}: {
  percent: number;
  colors: ReturnType<typeof getColorScheme>;
}) => {
  if (percent <= 0) return null;
  
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-muted-foreground">Progress</span>
        <span className={cn("font-medium", colors.text)}>{percent}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colors.gradient)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const CourseStats = ({ 
  statistics, 
  colors 
}: {
  statistics: CourseStatistics;
  colors: ReturnType<typeof getColorScheme>;
}) => (
  <div className="grid grid-cols-2 gap-3 mb-4">
    <StatCard
      icon={FolderOpen}
      value={statistics.folderCount}
      label="Folders"
      colors={colors}
    />
    <StatCard
      icon={FileText}
      value={statistics.fileCount}
      label="Files"
      colors={colors}
    />
  </div>
);

const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  colors 
}: {
  icon: typeof FolderOpen;
  value: number;
  label: string;
  colors: ReturnType<typeof getColorScheme>;
}) => (
  <div className={cn("p-3 rounded-lg", colors.accent)}>
    <div className="flex items-center gap-2">
      <Icon className={cn("h-4 w-4", colors.text)} />
      <div>
        <p className="text-sm font-medium text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  </div>
);

const RecentActivity = ({ activity }: { activity: string }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <Clock className="h-3 w-3" />
    <span className="truncate">{activity}</span>
  </div>
);

const CreditsBadge = ({ 
  course, 
  colors 
}: {
  course: Course;
  colors: ReturnType<typeof getColorScheme>;
}) => {
  const credits = course.credits || course.ects_credits;
  if (!credits) return null;
  
  const label = course.credits 
    ? `${course.credits} credits` 
    : `${course.ects_credits} ECTS`;
  
  return (
    <div className="absolute top-28 right-4">
      <div className={cn(
        "px-2 py-1 rounded-full text-xs font-medium border",
        colors.light, colors.text, colors.border
      )}>
        {label}
      </div>
    </div>
  );
};

// Main component
export function CourseCard({
  course,
  onEdit,
  onDelete,
  onClick,
  className,
  statistics = DEFAULT_STATISTICS,
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = getColorScheme(course.id);

  const handleClick = () => onClick?.(course);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn('relative group cursor-pointer', className)}
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: ANIMATION.NORMAL / 1000, ease: "easeOut" }}
    >
      <div className={cn(
        "relative overflow-hidden rounded-xl bg-card border border-border",
        "shadow-sm hover:shadow-xl transition-all duration-500",
        "backdrop-blur-sm min-h-[280px]"
      )}>
        <CourseHeader 
          course={course} 
          colors={colors}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        <div className="pt-8 px-4 pb-4">
          <CourseDetails course={course} />
          <CourseProgress percent={statistics.progressPercent} colors={colors} />
          <CourseStats statistics={statistics} colors={colors} />
          <RecentActivity activity={statistics.recentActivity} />
          <CreditsBadge course={course} colors={colors} />
        </div>

        {/* Hover effects */}
        <motion.div 
          className="absolute inset-0 bg-primary/5 rounded-xl pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: ANIMATION.NORMAL / 1000 }}
        />

        <motion.div
          className="absolute bottom-4 right-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.8
          }}
          transition={{ duration: ANIMATION.FAST / 1000 }}
        >
          <Button 
            size="sm"
            className="h-8 w-8 p-0 rounded-full shadow-lg"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <Target className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}