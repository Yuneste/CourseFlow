import type { Course, File as FileType } from '@/types';

interface CourseMatch {
  courseId: string;
  confidence: number;
  matchReasons: string[];
}

/**
 * Analyzes a file name and content to determine which course it belongs to
 * This is a rule-based approach that can be enhanced with ML later
 */
export function detectCourseFromFile(
  fileName: string,
  courses: Course[]
): CourseMatch | null {
  if (!courses.length) return null;

  const lowerFileName = fileName.toLowerCase();
  const matches: CourseMatch[] = [];

  for (const course of courses) {
    let confidence = 0;
    const matchReasons: string[] = [];

    // Check if filename contains course code
    if (course.code) {
      const courseCode = course.code.toLowerCase().replace(/\s+/g, '');
      const codeVariations = [
        courseCode,
        courseCode.replace('-', ''),
        courseCode.replace('_', ''),
        courseCode.replace(/(\d+)/g, '-$1'), // Add dash before numbers
        courseCode.replace(/(\d+)/g, '_$1'), // Add underscore before numbers
      ];

      for (const variation of codeVariations) {
        if (lowerFileName.includes(variation)) {
          confidence += 40;
          matchReasons.push(`Course code "${course.code}" found in filename`);
          break;
        }
      }
    }

    // Check if filename contains course name words
    const courseNameWords = course.name
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3); // Ignore short words

    let nameMatchCount = 0;
    for (const word of courseNameWords) {
      if (lowerFileName.includes(word)) {
        nameMatchCount++;
      }
    }

    if (nameMatchCount > 0) {
      const nameMatchScore = (nameMatchCount / courseNameWords.length) * 30;
      confidence += nameMatchScore;
      matchReasons.push(`Course name words matched: ${nameMatchCount}/${courseNameWords.length}`);
    }

    // Check for professor name
    if (course.professor) {
      const profWords = course.professor
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2);

      for (const word of profWords) {
        if (lowerFileName.includes(word)) {
          confidence += 20;
          matchReasons.push(`Professor name "${course.professor}" found`);
          break;
        }
      }
    }

    // Check for common course-specific keywords
    const courseKeywords = getCourseKeywords(course.name);
    let keywordMatches = 0;
    for (const keyword of courseKeywords) {
      if (lowerFileName.includes(keyword.toLowerCase())) {
        keywordMatches++;
      }
    }
    
    if (keywordMatches > 0) {
      confidence += Math.min(keywordMatches * 5, 20);
      matchReasons.push(`Subject keywords matched: ${keywordMatches}`);
    }

    // Check for term/semester in filename
    if (lowerFileName.includes(course.term.toLowerCase())) {
      confidence += 10;
      matchReasons.push(`Term "${course.term}" found`);
    }

    if (confidence > 0) {
      matches.push({
        courseId: course.id,
        confidence: Math.min(confidence, 100),
        matchReasons,
      });
    }
  }

  // Sort by confidence and return the best match
  if (matches.length > 0) {
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Only return if confidence is above threshold
    if (matches[0].confidence >= 30) {
      return matches[0];
    }
  }

  return null;
}

/**
 * Extract subject-specific keywords from course name
 */
function getCourseKeywords(courseName: string): string[] {
  const keywords: string[] = [];
  const lowerName = courseName.toLowerCase();

  // Computer Science keywords
  if (lowerName.includes('computer') || lowerName.includes('programming') || lowerName.includes('software')) {
    keywords.push('code', 'program', 'algorithm', 'data', 'structure', 'software', 'development', 'cs');
  }

  // Mathematics keywords
  if (lowerName.includes('math') || lowerName.includes('calculus') || lowerName.includes('algebra')) {
    keywords.push('equation', 'proof', 'theorem', 'formula', 'problem', 'solution', 'math');
  }

  // Physics keywords
  if (lowerName.includes('physics')) {
    keywords.push('force', 'energy', 'motion', 'quantum', 'mechanics', 'physics', 'lab');
  }

  // Chemistry keywords
  if (lowerName.includes('chemistry') || lowerName.includes('chem')) {
    keywords.push('molecule', 'reaction', 'compound', 'element', 'lab', 'chem');
  }

  // Biology keywords
  if (lowerName.includes('biology') || lowerName.includes('bio')) {
    keywords.push('cell', 'organism', 'genetics', 'evolution', 'bio', 'lab');
  }

  // Engineering keywords
  if (lowerName.includes('engineering')) {
    keywords.push('design', 'circuit', 'system', 'project', 'engineering', 'eng');
  }

  // Literature/English keywords
  if (lowerName.includes('literature') || lowerName.includes('english') || lowerName.includes('writing')) {
    keywords.push('essay', 'analysis', 'paper', 'reading', 'literature', 'writing');
  }

  // History keywords
  if (lowerName.includes('history')) {
    keywords.push('historical', 'period', 'civilization', 'war', 'revolution', 'history');
  }

  // Economics keywords
  if (lowerName.includes('economics') || lowerName.includes('econ')) {
    keywords.push('market', 'economy', 'finance', 'trade', 'econ', 'macro', 'micro');
  }

  // Psychology keywords
  if (lowerName.includes('psychology') || lowerName.includes('psych')) {
    keywords.push('behavior', 'cognitive', 'mental', 'study', 'research', 'psych');
  }

  return keywords;
}

/**
 * Batch process multiple files to detect their courses
 */
export function detectCoursesForFiles(
  files: Array<{ name: string; [key: string]: any }>,
  courses: Course[]
): Map<string, CourseMatch | null> {
  const results = new Map<string, CourseMatch | null>();

  for (const file of files) {
    const match = detectCourseFromFile(file.name, courses);
    results.set(file.name, match);
  }

  return results;
}

/**
 * Get course suggestions for a file with reasoning
 */
export function getCourseSuggestions(
  fileName: string,
  courses: Course[],
  limit: number = 3
): CourseMatch[] {
  const allMatches: CourseMatch[] = [];

  for (const course of courses) {
    let confidence = 0;
    const matchReasons: string[] = [];

    // Similar logic as detectCourseFromFile but return all matches
    const lowerFileName = fileName.toLowerCase();

    if (course.code && lowerFileName.includes(course.code.toLowerCase().replace(/\s+/g, ''))) {
      confidence += 40;
      matchReasons.push(`Course code match`);
    }

    const courseNameWords = course.name
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);

    const nameMatches = courseNameWords.filter(word => lowerFileName.includes(word)).length;
    if (nameMatches > 0) {
      confidence += (nameMatches / courseNameWords.length) * 30;
      matchReasons.push(`Name similarity`);
    }

    if (confidence > 0) {
      allMatches.push({
        courseId: course.id,
        confidence: Math.min(confidence, 100),
        matchReasons,
      });
    }
  }

  return allMatches
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}