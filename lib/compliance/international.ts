// EU VAT rates by country (2025)
export const EU_VAT_RATES: Record<string, number> = {
  'AT': 20, // Austria
  'BE': 21, // Belgium
  'BG': 20, // Bulgaria
  'HR': 25, // Croatia
  'CY': 19, // Cyprus
  'CZ': 21, // Czech Republic
  'DK': 25, // Denmark
  'EE': 22, // Estonia
  'FI': 25.5, // Finland
  'FR': 20, // France
  'DE': 19, // Germany
  'GR': 24, // Greece
  'HU': 27, // Hungary
  'IE': 23, // Ireland
  'IT': 22, // Italy
  'LV': 21, // Latvia
  'LT': 21, // Lithuania
  'LU': 17, // Luxembourg
  'MT': 18, // Malta
  'NL': 21, // Netherlands
  'PL': 23, // Poland
  'PT': 23, // Portugal
  'RO': 19, // Romania
  'SK': 20, // Slovakia
  'SI': 22, // Slovenia
  'ES': 21, // Spain
  'SE': 25, // Sweden
};

// Countries requiring specific compliance
export const COMPLIANCE_REQUIREMENTS = {
  // GDPR countries (EU + EEA)
  gdpr: [
    ...Object.keys(EU_VAT_RATES),
    'IS', // Iceland
    'LI', // Liechtenstein
    'NO', // Norway
  ],
  
  // Countries with strong data localization laws
  dataLocalization: [
    'RU', // Russia
    'CN', // China
    'IN', // India (certain sectors)
  ],
  
  // Countries requiring special payment processing
  paymentRestrictions: {
    'IN': ['upi', 'netbanking'], // India prefers local methods
    'BR': ['boleto', 'pix'], // Brazil
    'MX': ['oxxo'], // Mexico
  }
};

export interface ComplianceCheck {
  compliant: boolean;
  issues: string[];
  requirements: string[];
}

// Check compliance for a specific country
export function checkCountryCompliance(countryCode: string): ComplianceCheck {
  const issues: string[] = [];
  const requirements: string[] = [];
  
  // GDPR compliance
  if (COMPLIANCE_REQUIREMENTS.gdpr.includes(countryCode)) {
    requirements.push('GDPR compliant data processing');
    requirements.push('Explicit consent for data collection');
    requirements.push('Right to data portability and deletion');
  }
  
  // VAT requirements
  if (EU_VAT_RATES[countryCode]) {
    requirements.push(`EU VAT collection required (${EU_VAT_RATES[countryCode]}%)`);
    requirements.push('VAT invoice generation');
    requirements.push('Quarterly VIES reporting');
  }
  
  // Data localization
  if (COMPLIANCE_REQUIREMENTS.dataLocalization.includes(countryCode)) {
    issues.push('Data localization requirements not fully implemented');
    requirements.push('Store user data within country borders');
  }
  
  // Payment methods
  const localPayments = COMPLIANCE_REQUIREMENTS.paymentRestrictions[countryCode as keyof typeof COMPLIANCE_REQUIREMENTS.paymentRestrictions];
  if (localPayments) {
    requirements.push(`Support local payment methods: ${localPayments.join(', ')}`);
  }
  
  return {
    compliant: issues.length === 0,
    issues,
    requirements
  };
}

// Privacy policy requirements by region
export const PRIVACY_REQUIREMENTS = {
  gdpr: {
    required: [
      'Data controller information',
      'Legal basis for processing',
      'Data retention periods',
      'Third-party data sharing',
      'User rights (access, rectification, deletion, portability)',
      'Right to withdraw consent',
      'Right to lodge complaint with supervisory authority',
      'International data transfers',
      'Automated decision-making disclosure'
    ]
  },
  ccpa: { // California
    required: [
      'Categories of personal information collected',
      'Business purposes for collection',
      'Categories of third parties with whom data is shared',
      'Right to know about personal information',
      'Right to delete personal information',
      'Right to opt-out of sale',
      'Right to non-discrimination'
    ]
  },
  lgpd: { // Brazil
    required: [
      'Purpose of data processing',
      'Legal basis',
      'Data sharing information',
      'Data subject rights',
      'International transfers',
      'Data protection officer contact'
    ]
  }
};

// Cookie consent requirements
export const COOKIE_CONSENT_LEVELS = {
  strict: ['gdpr'], // Requires explicit consent before any cookies
  moderate: ['US', 'CA'], // Notice and opt-out
  minimal: [] // Simple notice
};

// Generate compliant invoice
export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  customerAddress: string;
  customerVatId?: string;
  items: Array<{
    description: string;
    amount: number;
    vatRate: number;
  }>;
  currency: string;
  countryCode: string;
}

export function generateCompliantInvoice(data: InvoiceData): {
  subtotal: number;
  vatAmount: number;
  total: number;
  requiresVatId: boolean;
  invoiceText: string;
} {
  const isEU = EU_VAT_RATES[data.countryCode] !== undefined;
  const isB2B = !!data.customerVatId;
  const vatRate = isEU ? EU_VAT_RATES[data.countryCode] : 0;
  
  let subtotal = 0;
  let vatAmount = 0;
  
  data.items.forEach(item => {
    subtotal += item.amount;
    // B2B reverse charge in EU - no VAT
    if (isEU && !isB2B) {
      vatAmount += item.amount * (item.vatRate / 100);
    }
  });
  
  const total = subtotal + vatAmount;
  
  let invoiceText = `
Invoice #${data.invoiceNumber}
Date: ${data.date.toISOString().split('T')[0]}

Bill To:
${data.customerName}
${data.customerAddress}
${data.customerVatId ? `VAT ID: ${data.customerVatId}` : ''}

Items:
${data.items.map(item => 
  `${item.description} - ${data.currency}${item.amount.toFixed(2)}`
).join('\n')}

Subtotal: ${data.currency}${subtotal.toFixed(2)}
${vatAmount > 0 ? `VAT (${vatRate}%): ${data.currency}${vatAmount.toFixed(2)}` : ''}
${isB2B && isEU ? 'Reverse charge - VAT to be accounted for by the recipient' : ''}
Total: ${data.currency}${total.toFixed(2)}
  `.trim();
  
  return {
    subtotal,
    vatAmount,
    total,
    requiresVatId: isEU && isB2B,
    invoiceText
  };
}

// Age verification requirements
export const AGE_REQUIREMENTS = {
  general: 13, // COPPA
  financial: 18, // Payment processing
  gdpr: 16, // GDPR consent age
  countrySpecific: {
    'AT': 14, 'BG': 14, 'HR': 16, 'CY': 14, 'CZ': 15,
    'DK': 13, 'EE': 13, 'FI': 13, 'FR': 15, 'DE': 16,
    'GR': 15, 'HU': 16, 'IE': 16, 'IT': 14, 'LV': 13,
    'LT': 14, 'LU': 16, 'MT': 13, 'NL': 16, 'PL': 16,
    'PT': 13, 'RO': 16, 'SK': 16, 'SI': 15, 'ES': 14,
    'SE': 13
  }
};

export function getMinimumAge(countryCode: string): number {
  const countryAge = AGE_REQUIREMENTS.countrySpecific[countryCode as keyof typeof AGE_REQUIREMENTS.countrySpecific];
  return Math.max(
    AGE_REQUIREMENTS.financial, // Always require 18 for payments
    countryAge || AGE_REQUIREMENTS.general
  );
}