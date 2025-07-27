export type FileCategory = 'lecture' | 'assignment' | 'notes' | 'exam' | 'other';

interface CategoryPattern {
  category: FileCategory;
  patterns: RegExp[];
  keywords: string[];
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  {
    category: 'lecture',
    patterns: [
      /lecture/i,
      /lesson/i,
      /chapter\s*\d+/i,
      /week\s*\d+/i,
      /slide/i,
      /presentation/i,
      /l\d{1,2}[\s\-\_\.]/i, // L01, L02, etc.
    ],
    keywords: ['lecture', 'lesson', 'chapter', 'week', 'slide', 'presentation', 'class'],
  },
  {
    category: 'assignment',
    patterns: [
      /assignment/i,
      /homework/i,
      /hw\d+/i,
      /problem\s*set/i,
      /pset/i,
      /exercise/i,
      /task/i,
      /project/i,
      /lab/i,
      /tutorial/i,
      /worksheet/i,
      /a\d{1,2}[\s\-\_\.]/i, // A01, A02, etc.
    ],
    keywords: ['assignment', 'homework', 'exercise', 'task', 'project', 'lab', 'tutorial', 'worksheet', 'problem'],
  },
  {
    category: 'exam',
    patterns: [
      /exam/i,
      /test/i,
      /quiz/i,
      /midterm/i,
      /final/i,
      /assessment/i,
      /evaluation/i,
      /mock/i,
      /past.*paper/i,
      /sample.*paper/i,
    ],
    keywords: ['exam', 'test', 'quiz', 'midterm', 'final', 'assessment', 'evaluation'],
  },
  {
    category: 'notes',
    patterns: [
      /notes?/i,
      /summary/i,
      /outline/i,
      /review/i,
      /study.*guide/i,
      /cheat.*sheet/i,
      /reference/i,
      /n\d{1,2}[\s\-\_\.]/i, // N01, N02, etc.
    ],
    keywords: ['notes', 'summary', 'outline', 'review', 'study', 'guide', 'reference'],
  },
];

/**
 * Categorize a file based on its name using pattern matching
 * This is a simple rule-based approach that can be replaced with ML later
 */
export function categorizeFile(fileName: string): FileCategory {
  const lowerFileName = fileName.toLowerCase();
  
  // Check each category's patterns
  for (const categoryDef of CATEGORY_PATTERNS) {
    // Check regex patterns
    for (const pattern of categoryDef.patterns) {
      if (pattern.test(lowerFileName)) {
        return categoryDef.category;
      }
    }
    
    // Check keywords
    for (const keyword of categoryDef.keywords) {
      if (lowerFileName.includes(keyword)) {
        return categoryDef.category;
      }
    }
  }
  
  // Default to 'other' if no patterns match
  return 'other';
}

/**
 * Get a human-readable label for a category
 */
export function getCategoryLabel(category: FileCategory): string {
  const labels: Record<FileCategory, string> = {
    lecture: 'Lectures',
    assignment: 'Assignments',
    notes: 'Notes',
    exam: 'Exams',
    other: 'Other Files',
  };
  
  return labels[category] || 'Other Files';
}

/**
 * Get an icon name for a category (for UI purposes)
 */
export function getCategoryIcon(category: FileCategory): string {
  const icons: Record<FileCategory, string> = {
    lecture: 'Presentation',
    assignment: 'FileText',
    notes: 'BookOpen',
    exam: 'ClipboardCheck',
    other: 'File',
  };
  
  return icons[category] || 'File';
}

/**
 * Get the folder path for a category
 */
export function getCategoryFolder(category: FileCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1) + 's';
}

/**
 * Analyze file content to improve categorization (placeholder for future ML)
 */
export async function analyzeFileContent(file: File): Promise<{
  suggestedCategory: FileCategory;
  confidence: number;
}> {
  // For now, just use filename-based categorization
  const category = categorizeFile(file.name);
  
  // In the future, this could:
  // 1. Extract text from PDFs
  // 2. Analyze images for text/diagrams
  // 3. Use NLP to understand content
  // 4. Use ML models for classification
  
  return {
    suggestedCategory: category,
    confidence: category !== 'other' ? 0.8 : 0.3,
  };
}