import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// PDF and DOCX parsing will be handled differently to avoid build issues

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get user's courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id);

    if (coursesError || !courses) {
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }

    // Extract text content based on file type
    let extractedText = '';
    let extractedKeywords: string[] = [];

    try {
      if (file.type === 'application/pdf') {
        // For MVP, we'll use filename analysis for PDFs
        // In production, you'd use a service like AWS Textract or Google Document AI
        console.log('PDF content extraction would happen here');
        extractedText = ''; // Placeholder
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
      ) {
        // For MVP, we'll use filename analysis for Word docs
        // In production, you'd process these server-side with appropriate libraries
        console.log('DOCX content extraction would happen here');
        extractedText = ''; // Placeholder
      } else if (file.type.startsWith('text/')) {
        extractedText = await file.text();
      }

      // Extract keywords
      extractedKeywords = extractKeywords(extractedText);

      // Analyze content against each course
      const analysis = analyzeContent(extractedText, file.name, courses);

      return NextResponse.json({
        success: true,
        analysis,
        extractedKeywords: extractedKeywords.slice(0, 10), // Top 10 keywords
        textLength: extractedText.length,
      });

    } catch (contentError) {
      console.error('Error extracting content:', contentError);
      
      // Fallback to filename analysis
      const fallbackAnalysis = analyzeByFilename(file.name, courses);
      
      return NextResponse.json({
        success: true,
        analysis: fallbackAnalysis,
        extractedKeywords: [],
        textLength: 0,
        fallback: true,
      });
    }

  } catch (error) {
    console.error('Error in content analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function analyzeContent(text: string, filename: string, courses: any[]) {
  const lowerText = text.toLowerCase();
  const matches: any[] = [];

  for (const course of courses) {
    let confidence = 0;
    const matchReasons: string[] = [];
    const foundKeywords: string[] = [];

    // Check for course code
    if (course.code) {
      const codeRegex = new RegExp(`\\b${course.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const codeMatches = (text.match(codeRegex) || []).length;
      if (codeMatches > 0) {
        confidence += Math.min(40 + (codeMatches * 2), 50);
        matchReasons.push(`Course code "${course.code}" found ${codeMatches} times`);
      }
    }

    // Check course name keywords
    const courseNameWords = course.name
      .toLowerCase()
      .split(/\s+/)
      .filter((word: string) => word.length > 3);

    let nameMatchCount = 0;
    for (const word of courseNameWords) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
      const wordMatches = (lowerText.match(wordRegex) || []).length;
      if (wordMatches > 0) {
        nameMatchCount++;
      }
    }

    if (nameMatchCount > 0) {
      const nameMatchScore = (nameMatchCount / courseNameWords.length) * 30;
      confidence += nameMatchScore;
      matchReasons.push(`${nameMatchCount}/${courseNameWords.length} course name keywords found`);
    }

    // Check professor name
    if (course.professor) {
      const profRegex = new RegExp(`\\b${course.professor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const profMatches = (text.match(profRegex) || []).length;
      if (profMatches > 0) {
        confidence += 15;
        matchReasons.push(`Professor "${course.professor}" mentioned`);
      }
    }

    // Subject-specific keywords
    const subjectKeywords = getSubjectKeywords(course.name);
    let keywordScore = 0;

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
      matchReasons.push(`Subject keywords: ${foundKeywords.slice(0, 5).join(', ')}`);
    }

    if (confidence > 0) {
      matches.push({
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        confidence: Math.min(confidence, 100),
        matchReasons,
        foundKeywords,
      });
    }
  }

  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);
  
  return matches.slice(0, 3); // Return top 3 matches
}

function analyzeByFilename(filename: string, courses: any[]) {
  const lowerFilename = filename.toLowerCase();
  const matches: any[] = [];

  for (const course of courses) {
    let confidence = 0;
    const matchReasons: string[] = [];

    if (course.code && lowerFilename.includes(course.code.toLowerCase().replace(/\s+/g, ''))) {
      confidence = 40;
      matchReasons.push('Course code in filename');
    }

    const firstWord = course.name.toLowerCase().split(' ')[0];
    if (firstWord.length > 3 && lowerFilename.includes(firstWord)) {
      confidence = Math.max(confidence, 30);
      matchReasons.push('Course name in filename');
    }

    if (confidence > 0) {
      matches.push({
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        confidence,
        matchReasons,
        foundKeywords: [],
      });
    }
  }

  matches.sort((a, b) => b.confidence - a.confidence);
  return matches.slice(0, 3);
}

function extractKeywords(text: string): string[] {
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

  const wordFreq = new Map<string, number>();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  return Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([word]) => word);
}

function getSubjectKeywords(courseName: string): string[] {
  const lowerName = courseName.toLowerCase();
  const keywords: string[] = [];

  if (lowerName.match(/computer|programming|software|coding/)) {
    keywords.push(
      'algorithm', 'data', 'structure', 'function', 'variable',
      'loop', 'array', 'object', 'class', 'method', 'database',
      'api', 'code', 'programming', 'software', 'debug'
    );
  }

  if (lowerName.match(/math|calculus|algebra|geometry/)) {
    keywords.push(
      'equation', 'formula', 'theorem', 'proof', 'derivative',
      'integral', 'matrix', 'vector', 'probability', 'function'
    );
  }

  if (lowerName.match(/physics/)) {
    keywords.push(
      'force', 'energy', 'momentum', 'velocity', 'acceleration',
      'mass', 'gravity', 'wave', 'frequency', 'electric'
    );
  }

  if (lowerName.match(/chemistry/)) {
    keywords.push(
      'atom', 'molecule', 'element', 'compound', 'reaction',
      'bond', 'electron', 'acid', 'base', 'oxidation'
    );
  }

  if (lowerName.match(/biology/)) {
    keywords.push(
      'cell', 'dna', 'rna', 'protein', 'gene',
      'evolution', 'species', 'organism', 'ecosystem', 'metabolism'
    );
  }

  return keywords;
}