/**
 * サイト全体の設定 — 初回セットアップ時にここだけ編集してください。
 */
export const site = {
  operatorName: 'testkun08080',
  defaultSupportEmail: 'support-app@testkun.net',
  githubUsername: 'testkun08080',
  repoName: 'apps',
  /** 公開 URL（GitHub Pages カスタムドメイン） */
  publicBaseUrl: 'https://apps.testkun.net',
  /**
   * GA4 Measurement ID（例 G-XXXXXXXXXX）。
   * 空文字ならタグを出さない。本番ビルドでのみ注入する。
   */
  googleAnalyticsId: 'G-X4DTQF4739',
} as const;

export type SiteConfig = typeof site;
