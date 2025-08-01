// Student email domains for various countries
const STUDENT_EMAIL_DOMAINS = [
  // US Universities
  '.edu',
  
  // UK Universities
  '.ac.uk',
  
  // Canadian Universities
  '.ca', // When combined with university patterns
  
  // European Universities
  '.ac.at', // Austria
  '.ac.be', // Belgium
  '.edu.pl', // Poland
  '.edu.gr', // Greece
  '.edu.tr', // Turkey
  '.ac.il', // Israel
  '.edu.au', // Australia
  '.ac.nz', // New Zealand
  '.ac.za', // South Africa
  '.ac.in', // India
  '.edu.cn', // China
  '.ac.jp', // Japan
  '.ac.kr', // South Korea
  
  // German Universities (special pattern)
  '.uni-', // e.g., uni-heidelberg.de
  '.tu-',  // e.g., tu-berlin.de
  '.fh-',  // e.g., fh-aachen.de
  '.hs-',  // e.g., hs-mannheim.de
  
  // French Universities
  '.univ-', // e.g., univ-paris.fr
  '.ens-',  // e.g., ens-lyon.fr
  
  // Netherlands
  '.uva.nl',
  '.vu.nl',
  '.rug.nl',
  '.tue.nl',
  '.utwente.nl',
  
  // Common patterns
  'university',
  'universiteit',
  'universitet',
  'universitat',
  'universite',
  'universita',
  'universidad',
  'universidade'
];

export class StudentVerificationService {
  /**
   * Verify if an email belongs to a student
   */
  static isStudentEmail(email: string): boolean {
    const emailLower = email.toLowerCase();
    const domain = emailLower.split('@')[1];
    
    if (!domain) return false;
    
    // Check against known student domains
    return STUDENT_EMAIL_DOMAINS.some(pattern => {
      if (pattern.startsWith('.')) {
        // Check if it's a domain suffix
        return domain.endsWith(pattern) || domain.includes(pattern);
      } else {
        // Check if domain contains the pattern
        return domain.includes(pattern);
      }
    });
  }

  /**
   * Get student discount amount (20% off)
   */
  static getStudentDiscountPercent(): number {
    return 20; // 20% discount for students
  }

  /**
   * Generate a student discount code
   */
  static generateStudentDiscountCode(email: string): string {
    const timestamp = Date.now().toString(36);
    const emailHash = email.split('@')[0].substring(0, 4).toUpperCase();
    return `STUDENT-${emailHash}-${timestamp}`;
  }

  /**
   * Verify student status and return discount info
   */
  static async verifyStudentStatus(email: string): Promise<{
    isStudent: boolean;
    discountPercent?: number;
    discountCode?: string;
    message: string;
  }> {
    const isStudent = this.isStudentEmail(email);
    
    if (!isStudent) {
      return {
        isStudent: false,
        message: 'Email does not appear to be from an educational institution. Please use your university email address.'
      };
    }
    
    return {
      isStudent: true,
      discountPercent: this.getStudentDiscountPercent(),
      discountCode: this.generateStudentDiscountCode(email),
      message: 'Student discount verified! You qualify for 20% off all plans.'
    };
  }

  /**
   * Get list of example student domains for UI display
   */
  static getExampleDomains(): string[] {
    return [
      'yourname@university.edu',
      'student@uni-heidelberg.de',
      'name@student.ac.uk',
      'email@univ-paris.fr'
    ];
  }
}