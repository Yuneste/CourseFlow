import Head from 'next/head';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  jsonLd?: Record<string, any>;
}

const defaultMeta = {
  title: 'CourseFlow - Academic File Organization',
  description: 'Organize your academic files with AI-powered categorization. Upload, manage, and find your study materials effortlessly.',
  keywords: ['academic', 'education', 'file management', 'study materials', 'AI organization'],
  author: 'CourseFlow',
  ogImage: '/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image' as const
};

export function SEOHead({
  title = defaultMeta.title,
  description = defaultMeta.description,
  keywords = defaultMeta.keywords,
  author = defaultMeta.author,
  ogImage = defaultMeta.ogImage,
  ogType = defaultMeta.ogType,
  twitterCard = defaultMeta.twitterCard,
  canonicalUrl,
  noindex = false,
  nofollow = false,
  jsonLd
}: SEOHeadProps) {
  const fullTitle = title === defaultMeta.title ? title : `${title} | CourseFlow`;
  const robots = `${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:site_name" content="CourseFlow" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#FA8072" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}