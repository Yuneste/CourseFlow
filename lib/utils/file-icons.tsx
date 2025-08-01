import { 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio, 
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Presentation,
  BookOpen,
  ClipboardCheck,
  PenTool,
  TestTube,
  File,
  Braces,
  Database,
  Palette,
  Terminal,
  Globe,
  Mail,
  Calendar,
  Calculator
} from 'lucide-react';

export interface FileIconConfig {
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

export const FILE_TYPE_ICONS: Record<string, FileIconConfig> = {
  // Documents
  'pdf': {
    icon: BookOpen,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'doc': {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'docx': {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'txt': {
    icon: FileText,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  'md': {
    icon: FileText,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50'
  },
  
  // Presentations
  'ppt': {
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  'pptx': {
    icon: Presentation,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  
  // Spreadsheets
  'xls': {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  'xlsx': {
    icon: FileSpreadsheet,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  'csv': {
    icon: Database,
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  
  // Code files
  'js': {
    icon: Braces,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  'ts': {
    icon: Braces,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'jsx': {
    icon: Braces,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  'tsx': {
    icon: Braces,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  'py': {
    icon: FileCode,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  'java': {
    icon: FileCode,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'cpp': {
    icon: FileCode,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50'
  },
  'c': {
    icon: FileCode,
    color: 'text-blue-800',
    bgColor: 'bg-blue-50'
  },
  'sh': {
    icon: Terminal,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50'
  },
  'html': {
    icon: Globe,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  'css': {
    icon: Palette,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50'
  },
  'json': {
    icon: Braces,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  'xml': {
    icon: FileCode,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  },
  
  // Images
  'jpg': {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'jpeg': {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'png': {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'gif': {
    icon: FileImage,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50'
  },
  'svg': {
    icon: FileImage,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50'
  },
  'webp': {
    icon: FileImage,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  
  // Videos
  'mp4': {
    icon: FileVideo,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'avi': {
    icon: FileVideo,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'mov': {
    icon: FileVideo,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'webm': {
    icon: FileVideo,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  
  // Audio
  'mp3': {
    icon: FileAudio,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  'wav': {
    icon: FileAudio,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  'ogg': {
    icon: FileAudio,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  
  // Archives
  'zip': {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'rar': {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  '7z': {
    icon: FileArchive,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  'tar': {
    icon: FileArchive,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50'
  },
  'gz': {
    icon: FileArchive,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50'
  },
  
  // Special academic files
  'tex': {
    icon: FileText,
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  'bib': {
    icon: BookOpen,
    color: 'text-green-700',
    bgColor: 'bg-green-50'
  },
  'nb': {
    icon: Calculator,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  'ipynb': {
    icon: Calculator,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  
  // Other
  'eml': {
    icon: Mail,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'ics': {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
};

// Category-based icons for when we categorize files
export const CATEGORY_ICONS: Record<string, FileIconConfig> = {
  'lecture': {
    icon: Presentation,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  'assignment': {
    icon: ClipboardCheck,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  'notes': {
    icon: PenTool,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  'exam': {
    icon: TestTube,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  'other': {
    icon: File,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

export function getFileIcon(filename: string, category?: string): FileIconConfig {
  // First check if we have a category
  if (category && CATEGORY_ICONS[category]) {
    return CATEGORY_ICONS[category];
  }
  
  // Otherwise, get icon by file extension
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  return FILE_TYPE_ICONS[extension] || {
    icon: File,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  };
}