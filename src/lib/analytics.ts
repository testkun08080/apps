import { createHash } from 'node:crypto';
import { locales } from '@/config/i18n';
import { jsonForInlineScript } from '@/lib/json';

export type PageKind = 'hub' | 'landing' | 'privacy' | 'terms' | 'support' | 'other';

export interface PageAnalytics {
  /** App slug, or `hub` for the site index. */
  appSlug: string;
  pageKind: PageKind;
}

const localeSet = new Set<string>(locales);
const pageKindSet = new Set<string>(['privacy', 'terms', 'support']);

/**
 * Derive GA content group / custom params from the URL (and optional known slug).
 */
export function parsePageAnalytics(pathname: string, knownAppSlug?: string): PageAnalytics {
  const segments = pathname.split('/').filter(Boolean);

  let i = 0;
  if (segments[i] && localeSet.has(segments[i])) {
    i += 1;
  }

  const first = segments[i];
  if (!first) {
    return { appSlug: 'hub', pageKind: 'hub' };
  }

  // Skip locale codes that somehow remain; treat reserved legal words without an app as hub/other
  if (localeSet.has(first)) {
    return { appSlug: 'hub', pageKind: 'hub' };
  }

  const appSlug = knownAppSlug ?? first;
  const rest = segments.slice(i + 1);
  const last = rest[rest.length - 1];

  if (!last) {
    return { appSlug, pageKind: 'landing' };
  }

  if (pageKindSet.has(last)) {
    return { appSlug, pageKind: last as PageKind };
  }

  return { appSlug, pageKind: 'other' };
}

/** GA4 の初期化用インラインスクリプト（GoogleAnalytics.astro と CSP ハッシュ計算で共有）。 */
export function buildGaConfigScript(measurementId: string, { appSlug, pageKind }: PageAnalytics): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${jsonForInlineScript(measurementId)}, {
  send_page_view: true,
  content_group1: ${jsonForInlineScript(appSlug)},
  app_slug: ${jsonForInlineScript(appSlug)},
  page_kind: ${jsonForInlineScript(pageKind)}
});`;
}

/** CSP の script-src 用ハッシュ（`'sha256-...'`）。 */
export function cspHash(source: string): string {
  return `'sha256-${createHash('sha256').update(source).digest('base64')}'`;
}
