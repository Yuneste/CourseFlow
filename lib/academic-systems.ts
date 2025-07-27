type AcademicPeriodType = 'semester' | 'term' | 'trimester';

interface AcademicSystem {
  name: string;
  periodType: AcademicPeriodType;
  creditSystem: string;
}

export const ACADEMIC_SYSTEMS: Record<string, AcademicSystem> = {
  US: {
    name: 'United States',
    periodType: 'semester',
    creditSystem: 'credits',
  },
  CA: {
    name: 'Canada',
    periodType: 'semester',
    creditSystem: 'credits',
  },
  UK: {
    name: 'United Kingdom',
    periodType: 'term',
    creditSystem: 'uk_honours',
  },
  DE: {
    name: 'Germany',
    periodType: 'semester',
    creditSystem: 'ects',
  },
  NL: {
    name: 'Netherlands',
    periodType: 'trimester',
    creditSystem: 'ects',
  },
};

/**
 * Generate academic terms for the past 5 years up to the current year
 * @param countryCode - Country code to determine academic system
 * @param currentDate - Optional date for testing, defaults to now
 * @returns Array of term strings
 */
export function generateAcademicTerms(
  countryCode: string,
  currentDate: Date = new Date()
): string[] {
  const terms: string[] = [];
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-based month
  
  // Generate terms for 5 years back to 1 year forward
  const startYear = currentYear - 5;
  const endYear = currentYear + 1;
  
  switch (countryCode) {
    case 'US':
      // US: Fall (Aug-Dec), Spring (Jan-May), Summer (Jun-Aug)
      // Academic year starts in Fall
      for (let year = startYear; year <= endYear; year++) {
        if (year > startYear) {
          terms.push(`Spring ${year}`);
          terms.push(`Summer ${year}`);
        }
        if (year < endYear) {
          terms.push(`Fall ${year}`);
        }
      }
      break;
      
    case 'CA':
      // Canada: Fall (Sep-Dec), Winter (Jan-Apr), Summer (May-Aug)
      // Academic year starts in Fall
      for (let year = startYear; year <= endYear; year++) {
        if (year > startYear) {
          terms.push(`Winter ${year}`);
          terms.push(`Summer ${year}`);
        }
        if (year < endYear) {
          terms.push(`Fall ${year}`);
        }
      }
      break;
      
    case 'UK':
      // UK: Michaelmas (Oct-Dec), Hilary/Lent (Jan-Mar), Trinity (Apr-Jun)
      // Academic year starts in Michaelmas
      for (let year = startYear; year <= endYear; year++) {
        if (year > startYear) {
          terms.push(`Hilary ${year}`);
          terms.push(`Trinity ${year}`);
        }
        if (year < endYear) {
          terms.push(`Michaelmas ${year}`);
        }
      }
      break;
      
    case 'DE':
      // Germany: Wintersemester (Oct-Mar), Sommersemester (Apr-Sep)
      // Academic year starts in Wintersemester
      for (let year = startYear; year <= endYear; year++) {
        if (year > startYear) {
          terms.push(`Sommersemester ${year}`);
        }
        if (year < endYear) {
          const nextYear = year + 1;
          terms.push(`Wintersemester ${year}/${nextYear.toString().slice(-2)}`);
        }
      }
      break;
      
    case 'NL':
      // Netherlands: Usually 4-6 periods per year
      // Academic year runs Sep-Aug
      for (let year = startYear; year < endYear; year++) {
        const academicYear = `${year}/${(year + 1).toString().slice(-2)}`;
        terms.push(`Period 1 (${academicYear})`);
        terms.push(`Period 2 (${academicYear})`);
        terms.push(`Period 3 (${academicYear})`);
        terms.push(`Period 4 (${academicYear})`);
      }
      break;
      
    default:
      // Default to US system
      return generateAcademicTerms('US', currentDate);
  }
  
  return terms.reverse(); // Most recent first
}

/**
 * Get the current academic term based on country and current date
 * @param countryCode - Country code to determine academic system
 * @param currentDate - Optional date for testing, defaults to now
 * @returns Current term string
 */
export function getCurrentTerm(
  countryCode: string,
  currentDate: Date = new Date()
): string {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1; // 1-based month
  
  switch (countryCode) {
    case 'US':
      if (month >= 8 && month <= 12) return `Fall ${year}`;
      if (month >= 1 && month <= 5) return `Spring ${year}`;
      return `Summer ${year}`;
      
    case 'CA':
      if (month >= 9 && month <= 12) return `Fall ${year}`;
      if (month >= 1 && month <= 4) return `Winter ${year}`;
      return `Summer ${year}`;
      
    case 'UK':
      if (month >= 10 && month <= 12) return `Michaelmas ${year}`;
      if (month >= 1 && month <= 3) return `Hilary ${year}`;
      return `Trinity ${year}`;
      
    case 'DE':
      if (month >= 10 && month <= 12) {
        const nextYear = year + 1;
        return `Wintersemester ${year}/${nextYear.toString().slice(-2)}`;
      }
      if (month >= 1 && month <= 3) {
        const prevYear = year - 1;
        return `Wintersemester ${prevYear}/${year.toString().slice(-2)}`;
      }
      return `Sommersemester ${year}`;
      
    case 'NL':
      // Rough approximation - periods vary by institution
      const academicYear = month >= 9 ? `${year}/${(year + 1).toString().slice(-2)}` : `${year - 1}/${year.toString().slice(-2)}`;
      if (month >= 9 && month <= 11) return `Period 1 (${academicYear})`;
      if (month >= 11 || month <= 1) return `Period 2 (${academicYear})`;
      if (month >= 2 && month <= 4) return `Period 3 (${academicYear})`;
      return `Period 4 (${academicYear})`;
      
    default:
      return getCurrentTerm('US', currentDate);
  }
}

/**
 * Get full academic system information including dynamic terms
 * @param countryCode - Country code
 * @returns Academic system with generated terms
 */
export function getAcademicSystemWithTerms(countryCode: string) {
  const system = ACADEMIC_SYSTEMS[countryCode] || ACADEMIC_SYSTEMS.US;
  const terms = generateAcademicTerms(countryCode);
  const currentTerm = getCurrentTerm(countryCode);
  
  return {
    ...system,
    terms,
    currentTerm,
  };
}