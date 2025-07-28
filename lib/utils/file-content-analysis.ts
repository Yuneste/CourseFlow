import type { Course } from '@/types';

interface ContentAnalysisResult {
  courseId: string;
  confidence: number;
  matchReasons: string[];
  extractedKeywords: string[];
}

/**
 * Analyzes the actual content of a file to determine which course it belongs to
 * This is a more advanced version that reads file content, not just filenames
 */
export async function analyzeFileContent(
  file: File,
  courses: Course[]
): Promise<ContentAnalysisResult | null> {
  if (!courses.length) return null;

  try {
    // Extract text based on file type
    let extractedText = '';
    
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPDF(file);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               file.type === 'application/msword') {
      extractedText = await extractTextFromDOCX(file);
    } else if (file.type.startsWith('text/')) {
      extractedText = await file.text();
    } else {
      // For other file types, fall back to filename analysis
      return analyzeByFilename(file.name, courses);
    }

    // Analyze the extracted text
    return analyzeText(extractedText, file.name, courses);
  } catch (error) {
    console.error('Error analyzing file content:', error);
    // Fall back to filename analysis if content extraction fails
    return analyzeByFilename(file.name, courses);
  }
}

/**
 * Extract text from PDF files (client-side)
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For client-side, we'll use a simpler approach
  // In production, you might want to use pdf.js or send to server
  // For now, we'll return empty and rely on filename
  console.log('PDF content extraction would happen here for:', file.name);
  return '';
}

/**
 * Extract text from DOCX files (client-side)
 */
async function extractTextFromDOCX(file: File): Promise<string> {
  // For client-side DOCX parsing, we'd need mammoth.js browser version
  // For now, we'll return empty and rely on filename
  console.log('DOCX content extraction would happen here for:', file.name);
  return '';
}

/**
 * Analyze text content to match with courses
 */
function analyzeText(
  text: string,
  filename: string,
  courses: Course[]
): ContentAnalysisResult | null {
  const lowerText = text.toLowerCase();
  const matches: ContentAnalysisResult[] = [];

  // Extract keywords from the text
  const extractedKeywords = extractKeywords(text);

  for (const course of courses) {
    let confidence = 0;
    const matchReasons: string[] = [];

    // Check for course code in content
    if (course.code) {
      const codeRegex = new RegExp(`\\b${course.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const codeMatches = (text.match(codeRegex) || []).length;
      if (codeMatches > 0) {
        // Higher confidence for course codes as they're more unique
        confidence += Math.min(50 + (codeMatches * 5), 70);
        matchReasons.push(`Course code "${course.code}" found ${codeMatches} times in content`);
      }
    }

    // Check for course name in content
    const courseNameWords = course.name
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3);

    let nameMatchCount = 0;
    for (const word of courseNameWords) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
      const wordMatches = (lowerText.match(wordRegex) || []).length;
      if (wordMatches > 0) {
        nameMatchCount++;
      }
    }

    if (nameMatchCount > 0) {
      // Check if full course name appears in content
      const fullNameRegex = new RegExp(course.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const fullNameMatches = (text.match(fullNameRegex) || []).length;
      
      if (fullNameMatches > 0) {
        // Very high confidence for exact course name matches
        confidence += Math.min(40 + (fullNameMatches * 10), 60);
        matchReasons.push(`Exact course name "${course.name}" found ${fullNameMatches} times`);
      } else {
        // Partial name match
        const nameMatchScore = (nameMatchCount / courseNameWords.length) * 25;
        confidence += nameMatchScore;
        matchReasons.push(`Course name keywords found: ${nameMatchCount}/${courseNameWords.length}`);
      }
    }

    // Check for professor name in content
    if (course.professor) {
      const profRegex = new RegExp(`\\b${course.professor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const profMatches = (text.match(profRegex) || []).length;
      if (profMatches > 0) {
        confidence += 15;
        matchReasons.push(`Professor "${course.professor}" mentioned in content`);
      }
    }

    // Subject-specific keyword analysis
    const subjectKeywords = getSubjectKeywords(course.name);
    let keywordScore = 0;
    const foundKeywords: string[] = [];

    for (const keyword of subjectKeywords) {
      const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const keywordMatches = (lowerText.match(keywordRegex) || []).length;
      if (keywordMatches > 0) {
        keywordScore += Math.min(keywordMatches * 0.5, 3);
        foundKeywords.push(keyword);
      }
    }

    if (keywordScore > 0) {
      confidence += Math.min(keywordScore, 20);
      matchReasons.push(`Subject keywords found: ${foundKeywords.join(', ')}`);
    }

    // Boost confidence if filename also matches
    if (filename.toLowerCase().includes(course.code?.toLowerCase() || '') ||
        filename.toLowerCase().includes(course.name.toLowerCase().split(' ')[0])) {
      confidence += 10;
      matchReasons.push('Filename also matches course');
    }

    if (confidence > 0) {
      matches.push({
        courseId: course.id,
        confidence: Math.min(confidence, 100),
        matchReasons,
        extractedKeywords: foundKeywords,
      });
    }
  }

  // Sort by confidence and return the best match
  if (matches.length > 0) {
    matches.sort((a, b) => b.confidence - a.confidence);
    
    // Only return if confidence is above threshold
    // Increased threshold to 60% for better accuracy
    if (matches[0].confidence >= 60) {
      return matches[0];
    }
  }

  return null;
}

/**
 * Fallback to filename analysis when content can't be extracted
 */
function analyzeByFilename(
  filename: string,
  courses: Course[]
): ContentAnalysisResult | null {
  // This is a simplified version of the original detection
  const lowerFilename = filename.toLowerCase();
  
  for (const course of courses) {
    const matchReasons: string[] = [];
    let confidence = 0;

    if (course.code && lowerFilename.includes(course.code.toLowerCase().replace(/\s+/g, ''))) {
      confidence = 40;
      matchReasons.push('Course code in filename');
    } else if (lowerFilename.includes(course.name.toLowerCase().split(' ')[0])) {
      confidence = 30;
      matchReasons.push('Course name in filename');
    }

    if (confidence > 0) {
      return {
        courseId: course.id,
        confidence,
        matchReasons,
        extractedKeywords: [],
      };
    }
  }

  return null;
}

/**
 * Extract important keywords from text
 */
function extractKeywords(text: string): string[] {
  // Remove common words and extract significant terms
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
  ]);

  const words = text.toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3 && !commonWords.has(word));

  // Count word frequency
  const wordFreq = new Map<string, number>();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  // Sort by frequency and return top keywords
  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

/**
 * Get subject-specific keywords based on course name
 */
function getSubjectKeywords(courseName: string): string[] {
  const lowerName = courseName.toLowerCase();
  const keywords: string[] = [];

  // Computer Science / Programming
  if (lowerName.match(/computer|programming|software|coding|development/)) {
    keywords.push(
      'algorithm', 'data structure', 'function', 'variable', 'loop',
      'array', 'object', 'class', 'method', 'database', 'api',
      'code', 'programming', 'software', 'debug', 'compile',
      'syntax', 'framework', 'library', 'git', 'version control'
    );
  }

  // Mathematics
  if (lowerName.match(/math|calculus|algebra|geometry|statistics/)) {
    keywords.push(
      'equation', 'formula', 'theorem', 'proof', 'derivative',
      'integral', 'matrix', 'vector', 'probability', 'statistics',
      'function', 'graph', 'limit', 'series', 'sequence',
      'variable', 'coefficient', 'polynomial', 'exponential', 'logarithm'
    );
  }

  // Physics
  if (lowerName.match(/physics|mechanics|thermodynamics|electromagnetism/)) {
    keywords.push(
      'force', 'energy', 'momentum', 'velocity', 'acceleration',
      'mass', 'gravity', 'friction', 'wave', 'frequency',
      'amplitude', 'electric', 'magnetic', 'field', 'charge',
      'quantum', 'particle', 'relativity', 'newton', 'einstein'
    );
  }

  // Chemistry
  if (lowerName.match(/chemistry|chemical|organic|inorganic/)) {
    keywords.push(
      'atom', 'molecule', 'element', 'compound', 'reaction',
      'bond', 'electron', 'proton', 'neutron', 'periodic',
      'acid', 'base', 'ph', 'oxidation', 'reduction',
      'organic', 'inorganic', 'catalyst', 'equilibrium', 'concentration'
    );
  }

  // Biology
  if (lowerName.match(/biology|biological|genetics|ecology/)) {
    keywords.push(
      'cell', 'dna', 'rna', 'protein', 'gene',
      'chromosome', 'evolution', 'species', 'organism', 'ecosystem',
      'photosynthesis', 'respiration', 'metabolism', 'enzyme', 'mutation',
      'natural selection', 'adaptation', 'biodiversity', 'ecology', 'anatomy'
    );
  }

  // Literature / English
  if (lowerName.match(/literature|english|writing|composition/)) {
    keywords.push(
      'essay', 'thesis', 'analysis', 'theme', 'character',
      'plot', 'setting', 'narrative', 'metaphor', 'symbolism',
      'rhetoric', 'argument', 'citation', 'bibliography', 'prose',
      'poetry', 'novel', 'shakespeare', 'literary', 'critique'
    );
  }

  // History
  if (lowerName.match(/history|historical/)) {
    keywords.push(
      'civilization', 'empire', 'revolution', 'war', 'treaty',
      'constitution', 'democracy', 'monarchy', 'republic', 'colonialism',
      'industrial', 'renaissance', 'medieval', 'ancient', 'modern',
      'historical', 'primary source', 'secondary source', 'historiography', 'timeline'
    );
  }

  // Economics
  if (lowerName.match(/economics|economic|finance/)) {
    keywords.push(
      'supply', 'demand', 'market', 'price', 'elasticity',
      'gdp', 'inflation', 'unemployment', 'fiscal', 'monetary',
      'trade', 'investment', 'capital', 'labor', 'productivity',
      'microeconomics', 'macroeconomics', 'equilibrium', 'utility', 'cost'
    );
  }

  // Psychology
  if (lowerName.match(/psychology|psychological/)) {
    keywords.push(
      'behavior', 'cognition', 'memory', 'learning', 'perception',
      'personality', 'motivation', 'emotion', 'development', 'disorder',
      'therapy', 'neuroscience', 'brain', 'mental', 'consciousness',
      'freud', 'jung', 'piaget', 'experiment', 'research'
    );
  }

  return keywords;
}

/**
 * Server-side content analysis endpoint data
 */
export interface ContentAnalysisRequest {
  filename: string;
  fileType: string;
  fileSize: number;
  contentSample?: string; // First 1000 chars for text files
}

/**
 * Prepare file for server-side analysis
 */
export async function prepareFileForAnalysis(file: File): Promise<ContentAnalysisRequest> {
  const request: ContentAnalysisRequest = {
    filename: file.name,
    fileType: file.type,
    fileSize: file.size,
  };

  // For text files, include a content sample
  if (file.type.startsWith('text/')) {
    try {
      const text = await file.text();
      request.contentSample = text.substring(0, 1000);
    } catch (error) {
      console.error('Error reading text file:', error);
    }
  }

  return request;
}