import { Metadata } from 'next'

interface GenerateMetadataProps {
  title?: string
  description?: string
  image?: string
  noIndex?: boolean
  keywords?: string[]
}

const defaultMetadata = {
  title: 'CourseFlow - Organize Your Academic Journey',
  description: 'CourseFlow helps students organize course materials, track progress, and succeed academically with AI-powered insights.',
  image: '/og-image.png',
  keywords: [
    'course management',
    'student organizer',
    'academic planner',
    'study materials',
    'education platform',
    'student success',
    'course tracking',
    'academic progress'
  ]
}

export function generateMetadata({
  title,
  description,
  image,
  noIndex = false,
  keywords = defaultMetadata.keywords
}: GenerateMetadataProps = {}): Metadata {
  const metaTitle = title ? `${title} | CourseFlow` : defaultMetadata.title
  const metaDescription = description || defaultMetadata.description
  const metaImage = image || defaultMetadata.image

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: keywords.join(', '),
    authors: [{ name: 'CourseFlow Team' }],
    creator: 'CourseFlow',
    publisher: 'CourseFlow',
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://courseflow.app',
      title: metaTitle,
      description: metaDescription,
      siteName: 'CourseFlow',
      images: [
        {
          url: metaImage,
          width: 1200,
          height: 630,
          alt: 'CourseFlow - Organize Your Academic Journey',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [metaImage],
      creator: '@courseflow',
    },
    alternates: {
      canonical: 'https://courseflow.app',
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 1,
    },
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#ECF0C0' },
      { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
    ],
  }
}