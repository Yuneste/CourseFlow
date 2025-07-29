interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export function generateSitemapXML(entries: SitemapEntry[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;
  
  return xml;
}

// Sitemap index for multiple sitemaps
interface SitemapIndex {
  loc: string;
  lastmod?: string;
}

export function generateSitemapIndexXML(sitemaps: SitemapIndex[]): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(sitemap => `  <sitemap>
    <loc>${sitemap.loc}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  return xml;
}

// Helper to generate sitemap entries
export class SitemapBuilder {
  private entries: SitemapEntry[] = [];
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  addEntry(
    path: string,
    options?: Omit<SitemapEntry, 'loc'>
  ): SitemapBuilder {
    this.entries.push({
      loc: `${this.baseUrl}${path}`,
      ...options
    });
    return this;
  }

  addStaticPages(): SitemapBuilder {
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/login', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/register', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/help', priority: 0.6, changefreq: 'weekly' as const },
      { path: '/privacy', priority: 0.5, changefreq: 'yearly' as const },
      { path: '/terms', priority: 0.5, changefreq: 'yearly' as const }
    ];

    staticPages.forEach(page => {
      this.addEntry(page.path, {
        changefreq: page.changefreq,
        priority: page.priority,
        lastmod: new Date().toISOString().split('T')[0]
      });
    });

    return this;
  }

  addDynamicPages(
    pages: { path: string; lastmod?: string; priority?: number }[]
  ): SitemapBuilder {
    pages.forEach(page => {
      this.addEntry(page.path, {
        lastmod: page.lastmod || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: page.priority || 0.7
      });
    });

    return this;
  }

  build(): string {
    return generateSitemapXML(this.entries);
  }

  getEntries(): SitemapEntry[] {
    return this.entries;
  }
}

// Robots.txt generator
interface RobotsOptions {
  host?: string;
  sitemap?: string;
  disallow?: string[];
  allow?: string[];
  crawlDelay?: number;
  userAgent?: string;
}

export function generateRobotsTxt(options: RobotsOptions): string {
  const {
    host,
    sitemap,
    disallow = [],
    allow = ['/'],
    crawlDelay,
    userAgent = '*'
  } = options;

  let robotsTxt = `User-agent: ${userAgent}\n`;
  
  allow.forEach(path => {
    robotsTxt += `Allow: ${path}\n`;
  });
  
  disallow.forEach(path => {
    robotsTxt += `Disallow: ${path}\n`;
  });
  
  if (crawlDelay) {
    robotsTxt += `Crawl-delay: ${crawlDelay}\n`;
  }
  
  if (sitemap) {
    robotsTxt += `\nSitemap: ${sitemap}\n`;
  }
  
  if (host) {
    robotsTxt += `Host: ${host}\n`;
  }
  
  return robotsTxt;
}