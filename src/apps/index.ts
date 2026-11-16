import { site } from '@/config/site';
import { defaultLocale, type Locale } from '@/config/i18n';
import { localizePath } from '@/i18n';
import type { AppConfig } from './types';

export type { AppConfig, AppPageProps, AppTheme } from './types';
export { defaultTheme } from './types';

const modules = import.meta.glob<{ app: AppConfig }>('./*/config.ts', { eager: true });

/** 登録アプリ一覧 — src/apps/<slug>/config.ts を置くと自動で拾います */
export const apps: AppConfig[] = Object.entries(modules)
  .filter(([path]) => !path.includes('/_default/'))
  .map(([, mod]) => mod.app)
  .sort((a, b) => a.slug.localeCompare(b.slug));

export function getApp(slug: string): AppConfig | undefined {
  return apps.find((app) => app.slug === slug);
}

export function getSupportEmail(app: AppConfig): string {
  return app.supportEmail ?? site.defaultSupportEmail;
}

export function getSiteBaseUrl(): string {
  return site.publicBaseUrl;
}

export function getAppUrl(slug: string, path?: string, locale: Locale = defaultLocale): string {
  const base = getSiteBaseUrl();
  const segment = path ? `/${path.replace(/^\//, '')}` : '';
  const localized = localizePath(`${slug}${segment}`, locale);
  return new URL(localized, base.endsWith('/') ? base : `${base}/`).href;
}

/** SNS シェア用 OGP 画像のパス（src/pages/og/[locale]/[slug].png.ts が生成）。`index` はアプリ一覧用 */
export function getOgImagePath(slug: string, locale: Locale = defaultLocale): string {
  return `${import.meta.env.BASE_URL}og/${locale}/${slug}.png`;
}
