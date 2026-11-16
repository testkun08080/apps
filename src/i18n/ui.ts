import type { Locale } from '@/config/i18n';

export const ui = {
  ja: {
    nav: {
      support: 'サポート',
      privacy: 'プライバシーポリシー',
      terms: '利用規約',
      updates: '更新履歴',
    },
    hub: {
      title: 'アプリ一覧',
      description: '各アプリの紹介ページと、プライバシーポリシー・利用規約・サポート情報です。',
      appPage: 'アプリページ',
    },
    support: {
      title: 'サポート',
      contactIntro: (appName: string) =>
        `${appName} に関するお問い合わせは、以下のメールアドレスまでご連絡ください。`,
      legalDocs: '法務ドキュメント',
    },
    meta: {
      lastUpdated: '最終更新日',
      operator: '運営者',
      contact: 'お問い合わせ',
    },
    footer: {
      appList: 'アプリ一覧',
    },
    aria: {
      legalNav: '法務ページ',
      languageSwitch: '言語切替',
    },
    language: {
      switchTo: '言語を切り替え',
    },
    og: {
      kicker: 'iPhone アプリ',
      available: 'App Store で配信中',
      comingSoon: '近日公開',
      hubTitle: 'testkun のアプリ',
      imageAlt: (appName: string) => `${appName} の紹介画像`,
    },
  },
  en: {
    nav: {
      support: 'Support',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      updates: 'Changelog',
    },
    hub: {
      title: 'Apps',
      description:
        'Landing pages, privacy policies, terms of use, and support information for each app.',
      appPage: 'App page',
    },
    support: {
      title: 'Support',
      contactIntro: (appName: string) =>
        `For questions about ${appName}, please contact us at the email address below.`,
      legalDocs: 'Legal documents',
    },
    meta: {
      lastUpdated: 'Last updated',
      operator: 'Operator',
      contact: 'Contact',
    },
    footer: {
      appList: 'All apps',
    },
    aria: {
      legalNav: 'Legal pages',
      languageSwitch: 'Language switcher',
    },
    language: {
      switchTo: 'Switch language',
    },
    og: {
      kicker: 'App for iPhone',
      available: 'On the App Store',
      comingSoon: 'Coming soon',
      hubTitle: 'Apps by testkun',
      imageAlt: (appName: string) => `${appName} preview`,
    },
  },
} as const satisfies Record<Locale, Record<string, unknown>>;

export type UiTree = typeof ui.ja;
