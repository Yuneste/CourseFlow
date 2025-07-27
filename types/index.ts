export interface User {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  study_program?: string;
  degree_type?: 'bachelor' | 'master' | 'phd' | 'diploma' | 'associate' | 'undergraduate' | 'graduate' | 'postgraduate' | 'other';
  start_year?: number;
  expected_graduation_year?: number;
  preferred_locale: string;
  country: string;
  timezone: string;
  academic_system: 'gpa' | 'ects' | 'uk_honours' | 'percentage';
  created_at: Date;
  avatar_url?: string;
}

export interface Course {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  professor?: string;
  term: string;
  academic_period_type: 'semester' | 'term' | 'trimester';
  credits?: number;
  ects_credits?: number;
  color: string;
  emoji?: string;
  created_at: Date;
  updated_at: Date;
}