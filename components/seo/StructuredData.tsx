interface CourseSchemaProps {
  name: string;
  description: string;
  provider: string;
  url: string;
  dateCreated?: string;
  dateModified?: string;
  inLanguage?: string;
}

export function CourseSchema({
  name,
  description,
  provider,
  url,
  dateCreated,
  dateModified,
  inLanguage = 'en'
}: CourseSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider
    },
    url,
    inLanguage,
    dateCreated,
    dateModified,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT10H'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  items: FAQItem[];
}

export function FAQSchema({ items }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareAppSchemaProps {
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    ratingValue: number;
    ratingCount: number;
  };
}

export function SoftwareAppSchema({
  name,
  description,
  applicationCategory,
  operatingSystem,
  offers,
  aggregateRating
}: SoftwareAppSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name,
    description,
    applicationCategory,
    operatingSystem,
    offers: offers ? {
      '@type': 'Offer',
      price: offers.price,
      priceCurrency: offers.priceCurrency
    } : undefined,
    aggregateRating: aggregateRating ? {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      ratingCount: aggregateRating.ratingCount
    } : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface PersonSchemaProps {
  name: string;
  url?: string;
  image?: string;
  sameAs?: string[];
  jobTitle?: string;
  worksFor?: {
    name: string;
    url?: string;
  };
}

export function PersonSchema({
  name,
  url,
  image,
  sameAs,
  jobTitle,
  worksFor
}: PersonSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url,
    image,
    sameAs,
    jobTitle,
    worksFor: worksFor ? {
      '@type': 'Organization',
      name: worksFor.name,
      url: worksFor.url
    } : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface EventSchemaProps {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
  };
  organizer?: {
    name: string;
    url?: string;
  };
  eventStatus?: 'EventScheduled' | 'EventCancelled' | 'EventPostponed';
  eventAttendanceMode?: 'OfflineEventAttendanceMode' | 'OnlineEventAttendanceMode' | 'MixedEventAttendanceMode';
}

export function EventSchema({
  name,
  description,
  startDate,
  endDate,
  location,
  organizer,
  eventStatus = 'EventScheduled',
  eventAttendanceMode = 'OnlineEventAttendanceMode'
}: EventSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    startDate,
    endDate,
    eventStatus: `https://schema.org/${eventStatus}`,
    eventAttendanceMode: `https://schema.org/${eventAttendanceMode}`,
    location: location ? {
      '@type': 'Place',
      name: location.name,
      address: location.address ? {
        '@type': 'PostalAddress',
        streetAddress: location.address
      } : undefined
    } : {
      '@type': 'VirtualLocation',
      url: 'https://courseflow.app'
    },
    organizer: organizer ? {
      '@type': 'Organization',
      name: organizer.name,
      url: organizer.url
    } : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}