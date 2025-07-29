'use client';

import { usePathname } from 'next/navigation';

interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function MetaTags({
  title = 'CourseFlow',
  description = 'Organize your academic files with AI-powered categorization',
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags
}: MetaTagsProps) {
  const pathname = usePathname();
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://courseflow.app'}${pathname}`;

  return (
    <>
      {/* Primary Meta Tags */}
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Article specific tags */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Additional tags for better SEO */}
      <meta name="twitter:site" content="@courseflow" />
      <meta name="twitter:creator" content="@courseflow" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:site_name" content="CourseFlow" />
    </>
  );
}

// Dynamic meta component for client-side updates
interface DynamicMetaProps {
  title?: string;
  description?: string;
}

export function DynamicMeta({ title, description }: DynamicMetaProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | CourseFlow`;
    }
    
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);

  return null;
}

import { useEffect } from 'react';

// Breadcrumb schema component
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Organization schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CourseFlow',
    url: 'https://courseflow.app',
    logo: 'https://courseflow.app/logo.png',
    description: 'Academic file organization platform with AI-powered categorization',
    sameAs: [
      'https://twitter.com/courseflow',
      'https://github.com/courseflow'
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Website schema
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CourseFlow',
    url: 'https://courseflow.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://courseflow.app/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}