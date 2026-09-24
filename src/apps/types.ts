import type { ImageMetadata } from 'astro';
import type { Locale } from '@/config/i18n';
import type { LocalizedString } from '@/i18n';

export type { LocalizedString };

export type AppTheme = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  link: string;
  fontSans?: string;
  radius?: string;
};

export type AppConfig = {
  slug: string;
  name: LocalizedString;
  tagline: LocalizedString;
  /** 未指定時は site.defaultSupportEmail を使用 */
  supportEmail?: string;
  /** アプリアイコン（未指定時はハブのカードにイニシャルを表示） */
  icon?: ImageMetadata;
  theme: AppTheme;
  /** 指定すると prefers-color-scheme: dark でこのトークンに切り替わります */
  darkTheme?: AppTheme;
  /** App Store の配信 URL。未指定ならダウンロード導線を出しません */
  appStoreUrl?: string;
  /** 配信中のアプリバージョン。指定するとランディングと更新履歴に表示します */
  version?: string;
};

export type ResolvedAppConfig = Omit<AppConfig, 'name' | 'tagline'> & {
  name: string;
  tagline: string;
};

export type AppPageProps = {
  app: ResolvedAppConfig;
  locale?: Locale;
};

/** ハブ・未設定アプリ向けのデフォルトトークン（現行 legal デザイン） */
export const defaultTheme: AppTheme = {
  bg: '#faf9f7',
  surface: '#ffffff',
  text: '#1a1a1a',
  muted: '#5c5c5c',
  border: '#e5e2dc',
  accent: '#2d5016',
  link: '#1a5fb4',
};
