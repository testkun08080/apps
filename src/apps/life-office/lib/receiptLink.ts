/**
 * LIFE OFFICE のレシート QR / バーコードを、表示用のレシートデータに戻す。
 *
 * - QR（v1 以降）: `https://apps.testkun.net/life-office/r/#1.<base64url(JSON)>`
 *   エンコード側は shukkin-kidou の `src/utils/receiptLink.ts`。キーを変えるときは両方を更新する。
 * - CODE128 / 旧 QR: `YYYYMMDDHHMMSS` / `NAME_YYYYMMDDHHMMSS` / `NAME`（日時・名前だけの簡易レシート）
 */

export const RECEIPT_LINK_VERSION = 1;

/** 読み取り結果として受け入れる自サイトのホスト（開発サーバーも含む）。 */
const TRUSTED_HOSTS = new Set(['apps.testkun.net', 'localhost', '127.0.0.1']);

export type ReceiptLinkPayload = {
  k: 'i' | 'o';
  d: string;
  i: string;
  o?: string;
  x?: 1;
  w?: number;
  u?: string;
  m?: string;
  b: string;
};

export type ReceiptView = {
  /** in / out。簡易レシートで種別が分からないときは null。 */
  kind: 'in' | 'out' | null;
  /** 簡易レシート（CODE128 など、日時・名前しか分からない） */
  simple: boolean;
  name?: string;
  /** YYYY/MM/DD */
  date?: string;
  /** 出勤（簡易レシートでは読み取った時刻） HH:MM */
  timeIn?: string;
  /** 退勤 HH:MM */
  timeOut?: string;
  outNextDay?: boolean;
  /** 勤務時間（分） */
  workMinutes?: number;
  message?: string;
  /** 印字されていたバーコード文字列 */
  code?: string;
};

export type ParseResult =
  | { status: 'ok'; receipt: ReceiptView }
  | { status: 'error'; reason: 'empty' | 'invalid' | 'version' | 'foreignUrl' };

// --- base64url ----------------------------------------------------------------

const fromBase64Url = (encoded: string): string => {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
};

const isDigits = (value: unknown, length: number): value is string =>
  typeof value === 'string' && value.length === length && /^\d+$/.test(value);

const optionalString = (value: unknown, max: number): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? Array.from(value).slice(0, max).join('') : undefined;

const formatYmd = (ymd: string): string => `${ymd.slice(0, 4)}/${ymd.slice(4, 6)}/${ymd.slice(6, 8)}`;
const formatHm = (hhmmss: string): string => `${hhmmss.slice(0, 2)}:${hhmmss.slice(2, 4)}`;

/** フラグメント（`1.xxxx`、先頭の `#` は任意）をレシートへ。 */
export const parseReceiptFragment = (fragment: string): ParseResult => {
  const raw = fragment.replace(/^#/, '').trim();
  if (raw === '') return { status: 'error', reason: 'empty' };
  const match = raw.match(/^(\d+)\.([A-Za-z0-9_-]+)$/);
  if (!match) return { status: 'error', reason: 'invalid' };
  if (Number(match[1]) !== RECEIPT_LINK_VERSION) return { status: 'error', reason: 'version' };

  let data: Partial<ReceiptLinkPayload>;
  try {
    data = JSON.parse(fromBase64Url(match[2]!));
  } catch {
    return { status: 'error', reason: 'invalid' };
  }
  if (
    data == null ||
    typeof data !== 'object' ||
    (data.k !== 'i' && data.k !== 'o') ||
    !isDigits(data.d, 8) ||
    !isDigits(data.i, 6)
  ) {
    return { status: 'error', reason: 'invalid' };
  }

  const receipt: ReceiptView = {
    kind: data.k === 'o' ? 'out' : 'in',
    simple: false,
    date: formatYmd(data.d),
    timeIn: formatHm(data.i),
    name: optionalString(data.u, 64),
    message: optionalString(data.m, 400),
    code: optionalString(data.b, 80),
  };
  if (data.k === 'o' && isDigits(data.o, 6)) {
    receipt.timeOut = formatHm(data.o);
    receipt.outNextDay = data.x === 1;
    if (typeof data.w === 'number' && Number.isFinite(data.w) && data.w >= 0) {
      receipt.workMinutes = Math.floor(data.w);
    }
  }
  return { status: 'ok', receipt };
};

/** 14 桁の日時が実在する日時か（20261399… のような値を弾く）。 */
const parseTimestamp = (ts: string): { date: string; time: string } | null => {
  const y = Number(ts.slice(0, 4));
  const mo = Number(ts.slice(4, 6));
  const d = Number(ts.slice(6, 8));
  const h = Number(ts.slice(8, 10));
  const mi = Number(ts.slice(10, 12));
  const s = Number(ts.slice(12, 14));
  const probe = new Date(y, mo - 1, d, h, mi, s);
  if (
    probe.getFullYear() !== y ||
    probe.getMonth() !== mo - 1 ||
    probe.getDate() !== d ||
    probe.getHours() !== h ||
    probe.getMinutes() !== mi
  ) {
    return null;
  }
  return { date: formatYmd(ts.slice(0, 8)), time: formatHm(ts.slice(8, 14)) };
};

/** CODE128 / 旧 QR の文字列を簡易レシートへ。 */
export const parseLegacyCode = (value: string): ParseResult => {
  const code = value.trim();
  if (code === '') return { status: 'error', reason: 'empty' };

  const withTs = code.match(/^(?:([A-Z0-9-]{1,24})_)?(\d{14})$/);
  if (withTs) {
    const parsed = parseTimestamp(withTs[2]!);
    if (!parsed) return { status: 'error', reason: 'invalid' };
    return {
      status: 'ok',
      receipt: {
        kind: null,
        simple: true,
        name: withTs[1],
        date: parsed.date,
        timeIn: parsed.time,
        code,
      },
    };
  }

  // 「名前のみ」テンプレート。アプリは A-Z / 0-9 / `-` に矯正して印字する。
  if (/^[A-Z][A-Z0-9-]{0,23}$/.test(code)) {
    return { status: 'ok', receipt: { kind: null, simple: true, name: code, code } };
  }
  return { status: 'error', reason: 'invalid' };
};

/**
 * スキャン・貼り付けた文字列を解釈する。
 * 自サイトの `/r/#…` URL ならフル、それ以外の URL は表示しない（任意サイトへは遷移しない）。
 */
export const parseScannedValue = (value: string): ParseResult => {
  const text = value.trim();
  if (text === '') return { status: 'error', reason: 'empty' };

  if (/^https?:\/\//i.test(text)) {
    let url: URL;
    try {
      url = new URL(text);
    } catch {
      return { status: 'error', reason: 'invalid' };
    }
    if (!TRUSTED_HOSTS.has(url.hostname) || !/\/life-office\/r\/?$/.test(url.pathname)) {
      return { status: 'error', reason: 'foreignUrl' };
    }
    return parseReceiptFragment(url.hash);
  }

  // URL の `#` 以降だけを貼られた場合。
  if (/^#?\d+\.[A-Za-z0-9_-]+$/.test(text)) return parseReceiptFragment(text);

  return parseLegacyCode(text);
};

/** 勤務時間（分）をアプリのレシートと同じ表記に。 */
export const formatDuration = (minutes: number, locale: 'ja' | 'en'): string => {
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, '0');
  return locale === 'ja' ? `${h}時間${m}分` : `${h}h ${m}m`;
};
