import type { APIRoute } from 'astro';
import { apps } from '@/apps';
import { site } from '@/config/site';
import { locales } from '@/config/i18n';
import { localizePath } from '@/i18n';

// life-office の `pages/updates.astro` のような、アプリ独自の追加ページも拾う
const extraPageModules = import.meta.glob('/src/apps/*/pages/*.astro');

function extraPagesForApp(slug: string): string[] {
  const prefix = `/src/apps/${slug}/pages/`;
  return Object.keys(extraPageModules)
    .filter((key) => key.startsWith(prefix))
    .map((key) => key.slice(prefix.length).replace(/\.astro$/, ''))
    .filter((page) => !excludedExtraPages.has(page));
}

/** noindex の追加ページ（個人のレシート URL を受けるページなど） */
const excludedExtraPages = new Set(['r']);

const legalDocTypes = ['privacy', 'terms', 'support'] as const;

function urlFor(pathSegment: string, locale: (typeof locales)[number]): string {
  const localized = localizePath(pathSegment, locale);
  const withTrailingSlash = localized.endsWith('/') ? localized : `${localized}/`;
  return new URL(withTrailingSlash, site.publicBaseUrl).href;
}

export const GET: APIRoute = () => {
  const urls = new Set<string>();

  // トップページ（ja / en）
  for (const locale of locales) {
    urls.add(urlFor('', locale));
  }

  // アプリごとのランディング・法務ページ・追加ページ
  for (const app of apps) {
    for (const locale of locales) {
      urls.add(urlFor(app.slug, locale));
      for (const doc of legalDocTypes) {
        urls.add(urlFor(`${app.slug}/${doc}`, locale));
      }
      for (const extra of extraPagesForApp(app.slug)) {
        urls.add(urlFor(`${app.slug}/${extra}`, locale));
      }
    }
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
    .sort()
    .map((loc) => `  <url><loc>${loc}</loc></url>`)
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
