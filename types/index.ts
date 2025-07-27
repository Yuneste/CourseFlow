export interface User {
  id: string;
  email: string;
  full_name: string;
  university?: string;
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