import { EU_VAT_RATES, COMPLIANCE_REQUIREMENTS } from './international';

export interface TermsConfig {
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyVatId?: string;
  websiteUrl: string;
  lastUpdated: Date;
  countryCode: string;
  language: string;
}

export interface TermsSection {
  title: string;
  content: string[];
  required: boolean;
}

export function generateTermsOfService(config: TermsConfig): TermsSection[] {
  const isEU = EU_VAT_RATES[config.countryCode] !== undefined;
  const isGDPR = COMPLIANCE_REQUIREMENTS.gdpr.includes(config.countryCode);
  
  const sections: TermsSection[] = [
    {
      title: '1. Acceptance of Terms',
      content: [
        `By accessing and using ${config.websiteUrl} ("Service"), you accept and agree to be bound by the terms and provision of this agreement.`,
        'If you do not agree to abide by the above, please do not use this Service.',
        `These Terms of Service are effective as of ${config.lastUpdated.toISOString().split('T')[0]}.`
      ],
      required: true
    },
    {
      title: '2. Description of Service',
      content: [
        'CourseFlow provides an AI-powered academic file management platform that helps students organize, categorize, and enhance their study materials.',
        'The Service includes features such as file upload, AI-powered summaries, course management, and collaborative study tools.',
        'We reserve the right to modify or discontinue the Service at any time.'
      ],
      required: true
    },
    {
      title: '3. Subscription Plans and Payment',
      content: [
        'CourseFlow offers multiple subscription tiers: Explorer (Free), Scholar (€10/month), and Master (€25/month).',
        'Paid subscriptions include a 7-day free trial period.',
        'Subscriptions automatically renew unless cancelled before the renewal date.',
        isEU ? `Prices include applicable VAT at the rate of ${EU_VAT_RATES[config.countryCode]}% for ${config.countryCode}.` : 'Prices may be subject to local taxes.',
        'Payment processing is handled by Stripe. By subscribing, you agree to Stripe\'s terms of service.'
      ],
      required: true
    },
    {
      title: '4. User Responsibilities',
      content: [
        'You must be at least 18 years old to create an account and use payment features.',
        'You are responsible for maintaining the confidentiality of your account credentials.',
        'You agree not to upload any content that violates copyright, contains malware, or is otherwise illegal.',
        'You may not use the Service for any unlawful purpose or to violate any laws.',
        'Academic integrity: You agree to use AI-generated content responsibly and in accordance with your institution\'s policies.'
      ],
      required: true
    },
    {
      title: '5. Intellectual Property',
      content: [
        'You retain all rights to the content you upload to CourseFlow.',
        'By uploading content, you grant us a limited license to process and analyze your files solely for providing the Service.',
        'AI-generated summaries and insights are provided as study aids and should not be considered original work.',
        'The CourseFlow platform, excluding user content, is protected by copyright and other intellectual property laws.'
      ],
      required: true
    },
    {
      title: '6. Privacy and Data Protection',
      content: [
        `We process your data in accordance with our Privacy Policy and applicable data protection laws${isGDPR ? ', including GDPR' : ''}.`,
        'Your files are stored securely and are not shared with third parties except as necessary to provide the Service.',
        'We use industry-standard encryption for data in transit and at rest.',
        isGDPR ? 'You have rights regarding your personal data including access, rectification, deletion, and portability.' : '',
        'For more details, please review our Privacy Policy.'
      ].filter(Boolean),
      required: true
    },
    {
      title: '7. Limitation of Liability',
      content: [
        'CourseFlow is provided "as is" without warranties of any kind.',
        'We are not liable for any indirect, incidental, special, or consequential damages.',
        'Our total liability shall not exceed the amount paid by you in the last 12 months.',
        'We are not responsible for any loss of data due to your failure to maintain backups.'
      ],
      required: true
    },
    {
      title: '8. Indemnification',
      content: [
        'You agree to indemnify and hold harmless CourseFlow from any claims arising from your use of the Service.',
        'This includes any claims related to your violation of these Terms or infringement of intellectual property rights.'
      ],
      required: true
    },
    {
      title: '9. Termination',
      content: [
        'We may terminate or suspend your account at any time for violations of these Terms.',
        'You may cancel your subscription at any time through your account settings.',
        'Upon termination, your right to use the Service will immediately cease.',
        'We may retain certain data as required by law or for legitimate business purposes.'
      ],
      required: true
    },
    {
      title: '10. Governing Law',
      content: [
        isEU 
          ? `These Terms are governed by the laws of ${config.countryCode} and the European Union.`
          : 'These Terms are governed by the laws of the jurisdiction where the Company is registered.',
        'Any disputes shall be resolved through binding arbitration or in the courts of competent jurisdiction.',
        isEU ? 'EU residents may also use the EU Online Dispute Resolution platform.' : ''
      ].filter(Boolean),
      required: true
    }
  ];

  // Add GDPR-specific sections
  if (isGDPR) {
    sections.push({
      title: '11. GDPR Rights',
      content: [
        'As a data subject under GDPR, you have the following rights:',
        '- Right to access your personal data',
        '- Right to rectification of inaccurate data',
        '- Right to erasure ("right to be forgotten")',
        '- Right to restrict processing',
        '- Right to data portability',
        '- Right to object to processing',
        '- Right to withdraw consent at any time',
        `To exercise these rights, contact us at ${config.companyEmail}.`
      ],
      required: true
    });
  }

  // Add age verification for certain countries
  sections.push({
    title: `${sections.length + 1}. Age Requirements`,
    content: [
      'You must be at least 18 years old to create a paid account.',
      'For free accounts, minimum age requirements vary by country.',
      'By using the Service, you confirm that you meet the age requirements for your jurisdiction.',
      'Parents or guardians may create accounts on behalf of minors and are responsible for their use.'
    ],
    required: true
  });

  return sections;
}

// Generate privacy policy sections
export function generatePrivacyPolicy(config: TermsConfig): TermsSection[] {
  const isGDPR = COMPLIANCE_REQUIREMENTS.gdpr.includes(config.countryCode);
  
  const sections: TermsSection[] = [
    {
      title: '1. Information We Collect',
      content: [
        'Account information: email, name, academic institution',
        'Usage data: file uploads, course information, study patterns',
        'Technical data: IP address, browser type, device information',
        'Payment information: processed securely by Stripe',
        isGDPR ? 'Legal basis: Contract performance and legitimate interests' : ''
      ].filter(Boolean),
      required: true
    },
    {
      title: '2. How We Use Your Information',
      content: [
        'Provide and improve the CourseFlow service',
        'Process payments and manage subscriptions',
        'Send service-related communications',
        'Analyze usage patterns to enhance features',
        'Comply with legal obligations'
      ],
      required: true
    },
    {
      title: '3. Data Sharing',
      content: [
        'We do not sell your personal data',
        'Service providers: Stripe (payments), Supabase (infrastructure)',
        'Legal requirements: when required by law or court order',
        'Business transfers: in case of merger or acquisition',
        isGDPR ? 'International transfers use appropriate safeguards (SCCs)' : ''
      ].filter(Boolean),
      required: true
    },
    {
      title: '4. Data Security',
      content: [
        'Industry-standard encryption (TLS/SSL) for data in transit',
        'Encrypted storage for files and sensitive data',
        'Regular security audits and updates',
        'Access controls and authentication measures',
        'Incident response procedures'
      ],
      required: true
    },
    {
      title: '5. Data Retention',
      content: [
        'Account data: retained while account is active',
        'Files: deleted 30 days after account termination',
        'Payment records: retained as required by tax laws',
        'Usage logs: retained for 12 months',
        isGDPR ? 'You may request earlier deletion subject to legal requirements' : ''
      ].filter(Boolean),
      required: true
    }
  ];

  if (isGDPR) {
    sections.push({
      title: '6. Your Rights (GDPR)',
      content: [
        `Data Controller: ${config.companyName}, ${config.companyAddress}`,
        'You have the right to access, rectify, or delete your personal data',
        'You can object to processing or request restriction',
        'You have the right to data portability',
        'You may withdraw consent at any time',
        'You can lodge a complaint with your supervisory authority',
        `Contact: ${config.companyEmail}`
      ],
      required: true
    });
  }

  return sections;
}