import type { APIRoute, GetStaticPaths } from 'astro';
import { apps, defaultTheme } from '@/apps';
import type { AppConfig, AppOgShot } from '@/apps/types';
import { site } from '@/config/site';
import { locales, type Locale } from '@/config/i18n';
import { resolveLocalized, t } from '@/i18n';
import { appOgTree, hubOgTree, iconDataUri, prepareShot, renderOgPng, type OgPalette } from '@/lib/og';

/**
 * SNS シェア用の OGP 画像。アプリごと・言語ごとに 1 枚ずつ、ビルド時に PNG を書き出します。
 *   /og/ja/<slug>.png, /og/en/<slug>.png … 各アプリ
 *   /og/ja/index.png,  /og/en/index.png  … アプリ一覧（サイトトップ）
 */
export const getStaticPaths = (() =>
  locales.flatMap((locale) => [
    ...apps.map((app) => ({ params: { locale, slug: app.slug }, props: { locale, app } })),
    { params: { locale, slug: 'index' }, props: { locale, app: undefined } },
  ])) satisfies GetStaticPaths;

type Props = { locale: Locale; app?: AppConfig };

const host = new URL(site.publicBaseUrl).host;

function paletteFor(app: AppConfig): OgPalette {
  return { ...app.theme, brand: app.og?.brand ?? app.theme.accent };
}

function shotsFor(app: AppConfig, locale: Locale): AppOgShot[] {
  const shots = app.og?.screenshots;
  if (!shots) return [];
  if (Array.isArray(shots)) return shots;
  return shots[locale] ?? shots.ja ?? Object.values(shots)[0] ?? [];
}

async function renderApp(app: AppConfig, locale: Locale): Promise<Buffer> {
  const name = resolveLocalized(app.name, locale);
  const headline = resolveLocalized(app.og?.headline ?? app.tagline, locale);
  const [icon, ...shots] = await Promise.all([
    app.icon ? iconDataUri(app.icon, 168) : Promise.resolve(undefined),
    // 手前の端末は表示幅 300px、奥は 260px。どちらも 2 倍の解像度で埋め込む
    ...shotsFor(app, locale)
      .slice(0, 2)
      .map((shot, i) => prepareShot(shot, i === 0 ? 576 : 500)),
  ]);

  return renderOgPng(
    appOgTree({
      name,
      headline: headline.split('\n').filter(Boolean),
      kicker: app.og?.kicker ? resolveLocalized(app.og.kicker, locale) : t(locale, 'og.kicker'),
      badge: app.appStoreUrl ? t(locale, 'og.available') : t(locale, 'og.comingSoon'),
      url: `${host}/${app.slug}`,
      palette: paletteFor(app),
      icon,
      shots,
    }),
  );
}

async function renderHub(locale: Locale): Promise<Buffer> {
  const appIcons = await Promise.all(
    apps.map(async (app) => ({
      name: resolveLocalized(app.name, locale),
      icon: app.icon ? await iconDataUri(app.icon, 264) : undefined,
      brand: app.og?.brand ?? app.theme.accent,
    })),
  );
  return renderOgPng(
    hubOgTree({
      title: t(locale, 'og.hubTitle'),
      subtitle: t(locale, 'hub.description'),
      url: host,
      palette: { ...defaultTheme, brand: defaultTheme.accent },
      apps: appIcons,
    }),
  );
}

export const GET: APIRoute<Props> = async ({ props }) => {
  const png = props.app ? await renderApp(props.app, props.locale) : await renderHub(props.locale);
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
};
