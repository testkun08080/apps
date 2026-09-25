import type { AppConfig } from '@/apps/types';
import icon from '@/assets/watcher/icon.png';

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
  supportEmail: 'support@legal.testkun.net',
  icon,
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
