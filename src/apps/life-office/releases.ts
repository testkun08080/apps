import type { Locale } from '@/config/i18n';

export type Release = {
  version: string;
  /** ISO 8601 (YYYY-MM-DD) */
  date: string;
  highlights: Record<Locale, string[]>;
};

/**
 * 公開済みリリースの一覧（新しい順）。
 * 文面の正本は shukkin-kidou の `docs/store-listing.md`（What's New）と
 * `docs/ads-deferred.md`（広告の配置方針）です。
 */
export const releases: Release[] = [
  {
    version: '1.5.0',
    date: '2026-09-19',
    highlights: {
      ja: [
        'ホーム画面の天井ライトを、紐を引いて揺らして遊べるようになりました',
        '打刻レシートや記録の詳細から、その日の打刻テキストを共有できるようになりました',
        'レシートの共有で、画像と打刻テキストを同じ共有シートに載せられるようになりました',
        '退勤レシートの行順を、出勤→退勤の時系列に揃えました（夜勤は退勤に +1 日を表示）',
        'レシートを写真に保存できないことがある不具合を修正しました',
      ],
      en: [
        'Play with the ceiling lamp on Home — pull the cord and watch it swing',
        'Share today’s punch text from the receipt or a day’s record detail',
        'Receipt share now includes both the image and punch text in one share sheet',
        'Clock-out receipts list clock-in before clock-out (overnight shifts show +1 on clock-out)',
        'Fixed cases where saving a receipt photo to the library could fail',
      ],
    },
  },
  {
    version: '1.4.4',
    date: '2026-09-18',
    highlights: {
      ja: [
        'CSV から複数月分をまとめて取り込めるようにしました',
        'Pro で iCloud にバックアップし、機種変更時に復元できるようにしました',
        'Pro 購入者のウィジェットが同期しない不具合を修正しました',
      ],
      en: [
        'Import several months of CSV files at once',
        'Pro: back up to iCloud and restore on a new device',
        'Fixed the widget not syncing for Pro purchasers',
      ],
    },
  },
  {
    version: '1.4.2',
    date: '2026-09-13',
    highlights: {
      ja: [
        'カレンダーで未記録・休日出勤が分かりやすくなりました。日付をタップして記録の追加・編集ができます',
        '検索で、出勤前メモと退勤コメントの有無でも絞り込めるようにしました',
        'Pro の機能をプレビューで見られるようにしました（購入は各画面の案内から）',
        '文字サイズ（Dynamic Type）に合わせて画面が読みやすくなりました',
        'タイ語の打刻表記を「ตอกบัตร」に更新しました',
        '未来の日付への後打刻をできないようにしました',
      ],
      en: [
        'Unrecorded and holiday-work days are clearer on the calendar. Tap a day to add or edit a record',
        'Search can filter by whether a clock-in or clock-out note exists',
        'Preview Pro features instead of a blank lock screen (upgrade from each screen)',
        'Layouts now follow iOS Dynamic Type',
        'Updated Thai punch copy to ตอกบัตร',
        'Manual punches can no longer be added for future dates',
      ],
    },
  },
  {
    version: '1.3.0',
    date: '2026-09-05',
    highlights: {
      ja: [
        '無料プランにバナー広告を追加しました（記録・検索・設定、およびレシート画面のカード外）',
        'LIFE OFFICE Pro で広告を非表示にできます',
        '出勤タブと打刻の儀式には広告を出しません',
        'ライト / ダークテーマの手動切り替えを Pro の機能にしました（無料プランはシステムの外観に追従します）',
        'アプリ内に FAQ を追加しました',
        'スワイプ打刻の画面で文字が重なる問題を修正しました',
      ],
      en: [
        'Banner ads on the free plan (Records, Search, Settings, and outside the receipt card)',
        'LIFE OFFICE Pro removes ads',
        'No ads on the home punch tab or during the punch ritual',
        'Manual light / dark theme switching is now a Pro feature (the free plan follows your system appearance)',
        'Added an in-app FAQ',
        'Fixed overlapping text on the swipe punch screen',
      ],
    },
  },
  {
    version: '1.1.0',
    date: '2026-08-27',
    highlights: {
      ja: [
        '日本語 / 英語に対応。端末の言語に追従し、設定からいつでも切り替えできます',
        'レシートのバーコードをテンプレート選択に変更（年月日時刻／名前＋日時／名前のみ）',
      ],
      en: [
        'Japanese and English — follows your device language, or switch anytime in Settings',
        'Receipt barcode is now chosen from templates (date & time / name + date & time / name only)',
      ],
    },
  },
  {
    version: '1.0.0',
    date: '2026-08-15',
    highlights: {
      ja: ['App Store で公開しました'],
      en: ['First release on the App Store'],
    },
  },
];
