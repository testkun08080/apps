/**
 * SNS シェア用の OGP 画像（1200×630）をビルド時に生成します。
 *
 * Satori でレイアウトを SVG にし、resvg で PNG に書き出します。
 * 日本語は @fontsource/noto-sans-jp の WOFF を、画像内で使う文字を含むサブセットだけ読み込みます。
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { ImageMetadata } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import type { AppOgShot } from '@/apps/types';
import { OG_HEIGHT, OG_WIDTH } from '@/lib/og-size';

const FONT_FAMILY = 'Noto Sans JP';
const FONT_WEIGHTS = [500, 700, 900] as const;

// ---------------------------------------------------------------------------
// Satori 用の最小限の要素ヘルパー（JSX を使わずにツリーを組み立てる）
// ---------------------------------------------------------------------------

type Style = Record<string, string | number>;
type Child = OgNode | string | false | null | undefined;
export type OgNode = { type: string; props: Record<string, unknown> };

function h(type: string, props: Record<string, unknown> & { style?: Style }, ...children: Child[]): OgNode {
  const kids = children.filter((c): c is OgNode | string => c !== false && c != null);
  return { type, props: { ...props, children: kids.length === 1 ? kids[0] : kids } };
}

const box = (style: Style, ...children: Child[]) => h('div', { style: { display: 'flex', ...style } }, ...children);

// ---------------------------------------------------------------------------
// 色
// ---------------------------------------------------------------------------

function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? [...raw].map((c) => c + c).join('') : raw.slice(0, 6);
  const n = Number.parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** 面の色に対して読みやすいほうの文字色を返す */
function onColor(bg: string, dark: string): string {
  return contrast(bg, '#ffffff') >= contrast(bg, dark) ? '#ffffff' : dark;
}

// ---------------------------------------------------------------------------
// フォント
// ---------------------------------------------------------------------------

const require = createRequire(import.meta.url);
const fontDir = path.join(path.dirname(require.resolve('@fontsource/noto-sans-jp/LICENSE')), 'files');
const unicodeRanges: Record<string, string> = JSON.parse(
  await readFile(path.join(fontDir, '..', 'unicode.json'), 'utf8'),
);

function parseRanges(spec: string): Array<[number, number]> {
  return spec.split(',').map((part) => {
    const [start, end] = part.trim().replace(/^U\+/i, '').split('-');
    const s = Number.parseInt(start, 16);
    return [s, end ? Number.parseInt(end, 16) : s];
  });
}

const subsets = Object.entries(unicodeRanges).map(([key, spec]) => ({
  // "[12]" → "12"、"latin" → "latin"
  name: key.replace(/^\[(\d+)\]$/, '$1'),
  ranges: parseRanges(spec),
}));

const fontCache = new Map<string, Promise<Buffer>>();

function loadFontFile(subset: string, weight: number): Promise<Buffer> {
  const file = path.join(fontDir, `noto-sans-jp-${subset}-${weight}-normal.woff`);
  let cached = fontCache.get(file);
  if (!cached) {
    cached = readFile(file);
    fontCache.set(file, cached);
  }
  return cached;
}

/**
 * 文字列に含まれる文字をカバーするサブセットだけを Satori 用フォントとして読み込む。
 * Satori は同じ名前のフォントを 1 つにまとめてしまうので、サブセットごとに別名を付け、
 * それらを fontFamily に並べてフォールバックさせる。
 */
async function fontsFor(text: string) {
  const codePoints = new Set([...text].map((c) => c.codePointAt(0)!));
  const needed = subsets.filter(
    ({ name, ranges }) =>
      // latin は常に入れておく（数字・記号のフォールバック用）
      name === 'latin' || [...codePoints].some((cp) => ranges.some(([s, e]) => cp >= s && cp <= e)),
  );
  // 欧文を和文サブセットの約物より優先する
  needed.sort((a, b) => Number(b.name === 'latin') - Number(a.name === 'latin'));

  const fonts = await Promise.all(
    needed.flatMap(({ name }) =>
      FONT_WEIGHTS.map(async (weight) => ({
        name: `${FONT_FAMILY} ${name}`,
        data: await loadFontFile(name, weight),
        weight,
        style: 'normal' as const,
      })),
    ),
  );
  const family = needed.map(({ name }) => `'${FONT_FAMILY} ${name}'`).join(', ');
  return { fonts, family };
}

/** ツリー内の文字列をすべて集める（フォントのサブセット選択用） */
function collectText(node: Child | Child[]): string {
  if (Array.isArray(node)) return node.map(collectText).join('');
  if (node == null || node === false) return '';
  if (typeof node === 'string') return node;
  return collectText(node.props.children as Child | Child[]);
}

// ---------------------------------------------------------------------------
// 画像
// ---------------------------------------------------------------------------

/** astro:assets の ImageMetadata から元ファイルのパスを得る（ビルド時のみ利用） */
function imagePath(image: ImageMetadata): string {
  const fsPath = (image as ImageMetadata & { fsPath?: string }).fsPath;
  if (!fsPath) {
    throw new Error(`OG 画像の生成で画像ファイルのパスを解決できませんでした: ${image.src}`);
  }
  return fsPath;
}

async function toDataUri(buffer: Buffer, mime: string): Promise<string> {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

/** 正方形のアイコンを指定サイズの PNG データ URI にする */
export async function iconDataUri(image: ImageMetadata, size: number): Promise<string> {
  const buffer = await sharp(imagePath(image)).resize(size, size).png().toBuffer();
  return toDataUri(buffer, 'image/png');
}

export type PreparedShot = { src: string; aspect: number };

/** スクリーンショットを切り出し・縮小して、Satori に渡せる形にする */
export async function prepareShot(shot: AppOgShot, width: number): Promise<PreparedShot> {
  let pipeline = sharp(imagePath(shot.image));
  let sourceWidth = shot.image.width;
  let sourceHeight = shot.image.height;
  if (shot.crop) {
    pipeline = pipeline.extract(shot.crop);
    sourceWidth = shot.crop.width;
    sourceHeight = shot.crop.height;
  }
  const buffer = await pipeline.resize({ width }).flatten({ background: '#000000' }).jpeg({ quality: 88 }).toBuffer();
  return { src: await toDataUri(buffer, 'image/jpeg'), aspect: sourceHeight / sourceWidth };
}

// ---------------------------------------------------------------------------
// レイアウト
// ---------------------------------------------------------------------------

export type OgPalette = {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  /** 装飾・バッジに使う色 */
  brand: string;
};

export type AppOgInput = {
  name: string;
  /** 見出しの各行（`\n` 区切りをあらかじめ分割したもの）。1 要素なら自動で折り返す */
  headline: string[];
  /** 左下のバッジ文言（例: 「App Store で配信中」） */
  badge: string;
  /** バッジ横の補足（例: 「iPhone アプリ」） */
  kicker: string;
  /** 右下に出す URL（スキームなし） */
  url: string;
  palette: OgPalette;
  /** アイコンのデータ URI（無ければ頭文字） */
  icon?: string;
  /** 右側の端末（先頭が手前）。空ならアイコンを大きく置く */
  shots: PreparedShot[];
};

const PAD_X = 72;
const TEXT_WIDTH = 560;

/** おおよその表示幅（em）。和文は全角、欧文は半角強として数える */
function emWidth(text: string): number {
  let w = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (cp > 0x2e80) w += 1;
    else if (ch === ' ') w += 0.26;
    else if (/[mwMW]/.test(ch)) w += 0.9;
    else if (/[A-Z0-9]/.test(ch)) w += 0.7;
    else if (/[iljtfr.,'!]/.test(ch)) w += 0.34;
    else w += 0.6;
  }
  return w;
}

function headlineSize(lines: string[]): number {
  if (lines.length > 1) {
    const widest = Math.max(...lines.map(emWidth));
    return Math.max(40, Math.min(66, Math.floor((TEXT_WIDTH * 0.96) / widest)));
  }
  // 1 行指定のときは折り返し前提で、3 行以内に収まる大きさにする
  const total = emWidth(lines[0] ?? '');
  for (const size of [68, 62, 56, 52, 48, 44, 40]) {
    if ((total * size) / TEXT_WIDTH <= (size >= 56 ? 2.6 : 2.85)) return size;
  }
  return 40;
}

/*
 * 影のぼかしは 60px 程度までにしてください。Satori はぼかし量の 2 乗に比例してフィルタ範囲を広げるため、
 * 80px あたりから resvg がパニックして（プロセスごと）ビルドが落ちます。
 */
function phone(shot: PreparedShot, width: number, style: Style): OgNode {
  const bezel = Math.round(width * 0.038);
  const screenWidth = width - bezel * 2;
  const screenHeight = Math.round(screenWidth * shot.aspect);
  const radius = Math.round(width * 0.16);
  return box(
    {
      position: 'absolute',
      flexShrink: 0,
      padding: bezel,
      backgroundColor: '#121212',
      borderRadius: radius,
      boxShadow: '0 30px 60px rgba(0, 0, 0, 0.28), 0 8px 18px rgba(0, 0, 0, 0.16)',
      border: '2px solid rgba(255, 255, 255, 0.12)',
      ...style,
    },
    h('img', {
      src: shot.src,
      width: screenWidth,
      height: screenHeight,
      style: { flexShrink: 0, borderRadius: radius - bezel, objectFit: 'cover' },
    }),
  );
}

/** アイコンが無いアプリ用の、頭文字のタイル */
function letterTile(name: string, size: number, brand: string, dark: string, style: Style = {}): OgNode {
  return box(
    { width: size, height: size, borderRadius: Math.round(size * 0.225), backgroundColor: brand, ...style },
    box(
      {
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        color: onColor(brand, dark),
        fontSize: Math.round(size * 0.5),
        fontWeight: 900,
      },
      [...name][0] ?? '',
    ),
  );
}

function deviceArea(input: AppOgInput): OgNode {
  const { shots, palette } = input;

  if (shots.length === 0) {
    // スクリーンショットが無いアプリは、アイコン（または頭文字）を大きく置く
    const size = 300;
    return box(
      { position: 'absolute', left: 760, top: (OG_HEIGHT - size) / 2 - 8, width: size, height: size },
      input.icon
        ? h('img', {
            src: input.icon,
            width: size,
            height: size,
            style: {
              borderRadius: size * 0.225,
              boxShadow: `0 28px 56px ${alpha(palette.text, 0.22)}`,
            },
          })
        : letterTile(input.name, size, palette.brand, palette.text, {
            boxShadow: `0 28px 56px ${alpha(palette.text, 0.22)}`,
          }),
    );
  }

  const [front, back] = shots;
  return box(
    { position: 'absolute', left: 0, top: 0, width: OG_WIDTH, height: OG_HEIGHT },
    back && phone(back, 260, { left: 935, top: 118, transform: 'rotate(7deg)' }),
    phone(front, 300, { left: back ? 690 : 780, top: 78, transform: back ? 'rotate(-4deg)' : 'rotate(0deg)' }),
  );
}

function iconTile(input: AppOgInput, size: number): OgNode {
  const { palette } = input;
  const radius = Math.round(size * 0.225);
  if (input.icon) {
    return h('img', {
      src: input.icon,
      width: size,
      height: size,
      style: {
        borderRadius: radius,
        border: `1px solid ${alpha(palette.text, 0.08)}`,
        boxShadow: `0 10px 24px ${alpha(palette.text, 0.16)}`,
      },
    });
  }
  return letterTile(input.name, size, palette.brand, palette.text);
}

export function appOgTree(input: AppOgInput): OgNode {
  const { palette } = input;
  const size = headlineSize(input.headline);
  const badgeText = onColor(palette.brand, palette.text);

  return box(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: palette.bg,
      fontFamily: FONT_FAMILY,
      color: palette.text,
    },
    // 背景の光だまり（端末の後ろ）と、左下の淡いにじみ
    box({
      position: 'absolute',
      left: 560,
      top: -260,
      width: 900,
      height: 900,
      borderRadius: 9999,
      backgroundImage: `radial-gradient(circle at center, ${alpha(palette.brand, 0.34)} 0%, ${alpha(palette.brand, 0.12)} 42%, ${alpha(palette.brand, 0)} 70%)`,
    }),
    box({
      position: 'absolute',
      left: -260,
      top: 330,
      width: 640,
      height: 640,
      borderRadius: 9999,
      backgroundImage: `radial-gradient(circle at center, ${alpha(palette.brand, 0.14)} 0%, ${alpha(palette.brand, 0)} 70%)`,
    }),
    // 細いドットのグリッドで面に質感を出す
    box({
      position: 'absolute',
      left: 0,
      top: 0,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      backgroundImage: `radial-gradient(${alpha(palette.text, 0.07)} 1.2px, transparent 1.4px)`,
      backgroundSize: '22px 22px',
    }),

    deviceArea(input),

    // 左側のテキスト
    box(
      {
        position: 'absolute',
        left: PAD_X,
        top: 64,
        bottom: 60,
        width: TEXT_WIDTH,
        flexDirection: 'column',
        justifyContent: 'space-between',
      },
      box(
        { alignItems: 'center', gap: 22 },
        iconTile(input, 84),
        box(
          { flexDirection: 'column', gap: 2 },
          box({ fontSize: 36, fontWeight: 900, letterSpacing: '0.01em', lineHeight: 1.15 }, input.name),
          box({ fontSize: 19, fontWeight: 500, color: palette.muted, letterSpacing: '0.04em' }, input.kicker),
        ),
      ),
      box(
        { flexDirection: 'column' },
        box({ width: 56, height: 6, borderRadius: 3, backgroundColor: palette.brand, marginBottom: 26 }),
        ...input.headline.map((line) =>
          box(
            {
              fontSize: size,
              fontWeight: 900,
              lineHeight: 1.28,
              letterSpacing: '-0.01em',
              color: palette.text,
              ...(input.headline.length > 1 ? { whiteSpace: 'nowrap' } : {}),
            },
            line,
          ),
        ),
      ),
      box(
        { alignItems: 'center', gap: 18 },
        box(
          {
            alignItems: 'center',
            flexShrink: 0,
            whiteSpace: 'nowrap',
            padding: '10px 22px',
            borderRadius: 999,
            backgroundColor: palette.brand,
            color: badgeText,
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: '0.02em',
          },
          input.badge,
        ),
        box({ fontSize: 19, fontWeight: 500, color: palette.muted, letterSpacing: '0.02em', whiteSpace: 'nowrap' }, input.url),
      ),
    ),
  );
}

export type HubOgInput = {
  title: string;
  subtitle: string;
  url: string;
  palette: OgPalette;
  apps: Array<{ name: string; icon?: string; brand: string }>;
};

/** サイトトップ（アプリ一覧）用 */
export function hubOgTree(input: HubOgInput): OgNode {
  const { palette } = input;
  const size = 132;
  return box(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: palette.bg,
      fontFamily: FONT_FAMILY,
      color: palette.text,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    box({
      position: 'absolute',
      left: 0,
      top: 0,
      width: OG_WIDTH,
      height: OG_HEIGHT,
      backgroundImage: `radial-gradient(${alpha(palette.text, 0.07)} 1.2px, transparent 1.4px)`,
      backgroundSize: '22px 22px',
    }),
    box(
      { gap: 36, marginBottom: 56 },
      ...input.apps.map((app) =>
        box(
          { flexDirection: 'column', alignItems: 'center', gap: 16 },
          app.icon
            ? h('img', {
                src: app.icon,
                width: size,
                height: size,
                style: {
                  borderRadius: size * 0.225,
                  border: `1px solid ${alpha(palette.text, 0.08)}`,
                  boxShadow: `0 24px 48px ${alpha(app.brand, 0.32)}`,
                },
              })
            : letterTile(app.name, size, app.brand, palette.text),
          box({ fontSize: 22, fontWeight: 700, color: palette.text }, app.name),
        ),
      ),
    ),
    box({ fontSize: 56, fontWeight: 900, letterSpacing: '0.01em' }, input.title),
    box({ fontSize: 24, fontWeight: 500, color: palette.muted, marginTop: 14 }, input.subtitle),
    box(
      { position: 'absolute', bottom: 40, fontSize: 19, fontWeight: 500, color: palette.muted, letterSpacing: '0.04em' },
      input.url,
    ),
  );
}

export async function renderOgPng(tree: OgNode): Promise<Buffer> {
  const { fonts, family } = await fontsFor(collectText(tree));
  const root = { ...tree, props: { ...tree.props, style: { ...(tree.props.style as Style), fontFamily: family } } };
  const svg = await satori(root as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng();
  // resvg の出力は無圧縮寄りなので、配信サイズを抑えるために再圧縮する
  return sharp(png).png({ compressionLevel: 9, palette: false }).toBuffer();
}
