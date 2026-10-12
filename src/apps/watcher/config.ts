import type { AppConfig } from '@/apps/types';
import shot01 from '@/assets/watcher/01-home.png';
import shot02 from '@/assets/watcher/02-reports.png';
import shot01En from '@/assets/watcher/en/01-home.png';
import shot02En from '@/assets/watcher/en/02-reports.png';
import icon from '@/assets/watcher/icon.png';

/** 1320×2868 の App Store 用画像のうち、端末の画面（＋ベゼル少し）の範囲 */
const watcherScreen = { left: 190, top: 776, width: 940, height: 2092 };

/**
 * トークンは watcher-app の `src/constants/theme.ts`（WatcherColors / WatcherColorsDark）に揃えています。
 * accent だけは本文・小さな文字でも AA を満たすよう primary(#4F7CFF) ではなく
 * primaryDark(#3D63E0) を採用し、ブランド色そのものは theme.css の --wt-brand で使います。
 */
export const app: AppConfig = {
  slug: 'watcher',
  name: 'Watcher',
  tagline: {
    ja: 'あなたの「気になる」を、AI が見張って、まとめて届ける。',
    en: 'AI watches what you care about, and delivers the summary.',
  },
  supportEmail: 'support-app+watcher@testkun.net',
  icon,
  appStoreUrl: 'https://apps.apple.com/jp/app/id6772545052',
  version: '1.2.0',
  og: {
    headline: {
      ja: 'あなたの「気になる」を、\nAI が見張って、\nまとめて届ける。',
      en: 'AI watches\nwhat you care about,\nand sends the summary.',
    },
    // App Store 用画像（見出し・端末フレーム合成済み）から画面部分だけを切り出す
    screenshots: {
      ja: [{ image: shot01, crop: watcherScreen }, { image: shot02, crop: watcherScreen }],
      en: [{ image: shot01En, crop: watcherScreen }, { image: shot02En, crop: watcherScreen }],
    },
    brand: '#4f7cff',
  },
  theme: {
    bg: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    accent: '#3d63e0',
    link: '#3d63e0',
    fontSans:
      "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif",
    radius: '0.75rem',
  },
  darkTheme: {
    bg: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#334155',
    accent: '#4f7cff',
    link: '#93b4ff',
    fontSans:
      "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', 'Yu Gothic', system-ui, sans-serif",
    radius: '0.75rem',
  },
};
