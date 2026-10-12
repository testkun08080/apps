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

export type AppOgShot = {
  image: ImageMetadata;
  /**
   * 元画像から切り出す範囲（px）。App Store 用に端末フレームや見出しを合成済みの画像から、
   * 画面部分だけを使いたいときに指定します。
   */
  crop?: { left: number; top: number; width: number; height: number };
};

/** SNS シェア用 OGP 画像（/og/<locale>/<slug>.png）の内容 */
export type AppOgConfig = {
  /** 見出し。`\n` で改行位置を指定できます（未指定時は tagline を自動で折り返し） */
  headline?: LocalizedString;
  /** アプリ名の下の補足（未指定時は「iPhone アプリ」） */
  kicker?: LocalizedString;
  /** 右側に並べる端末のスクリーンショット（先頭が手前、最大 2 枚）。ロケール別にも指定できます */
  screenshots?: AppOgShot[] | Partial<Record<Locale, AppOgShot[]>>;
  /** 装飾・バッジに使う色（未指定時は theme.accent） */
  brand?: string;
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
  /** OGP 画像のカスタマイズ。未指定でもアイコンとテーマ色から生成します */
  og?: AppOgConfig;
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
