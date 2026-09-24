import type { AppConfig } from '@/apps/types';

/**
 * トークンは shukkin-kidou の `src/constants/themes/{light,dark}.ts` と揃えています。
 */
export const app: AppConfig = {
  slug: 'life-office',
  name: 'LIFE OFFICE',
  tagline: {
    ja: '毎朝の出勤儀式を、スマホで。',
    en: 'Your morning clock-in ritual, on your phone.',
  },
  supportEmail: 'support@legal.testkun.net',
  appStoreUrl: 'https://apps.apple.com/jp/app/id6773638323',
  version: '1.5.1',
  theme: {
    bg: '#f5f0e8',
    surface: '#ffffff',
    text: '#2c2c2c',
    muted: '#8c8578',
    border: '#e0d9ce',
    accent: '#5c6b4a',
    link: '#5c6b4a',
    fontSans:
      "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif",
  },
  darkTheme: {
    bg: '#1a1c18',
    surface: '#2a2c28',
    text: '#e8e6e0',
    muted: '#9a968c',
    border: '#3a3c38',
    accent: '#8a9a76',
    link: '#8a9a76',
    fontSans:
      "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif",
  },
};
