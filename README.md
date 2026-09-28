# apps

アプリごとの専用ページと、App Store 提出用のプライバシーポリシー・利用規約・サポートページを公開する Astro サイトです。

各アプリは `src/apps/<slug>/` にテーマとランディングを持ち、法務ページは共通レイアウトにアプリの色を載せて表示します。

## 公開URL

現在の設定はカスタムドメイン運用です。

- サイト: `https://apps.testkun.net/`
- アプリページ: `https://apps.testkun.net/life-office/`
- サポート: `https://apps.testkun.net/life-office/support/`
- 例: `https://apps.testkun.net/life-office/privacy/`

> `astro.config.mjs` は `base: '/'` です。サブパス前提ではありません。

> 以前 `/<app>/` がサポートページでした。サポートは `/<app>/support/` に移しています。App Store のサポート URL を更新してください。

## 前提環境

- Node.js 22 以上（CI では Node.js 22 を利用）
- npm 10 以上を推奨

## 初回セットアップ

### 1. 依存関係をインストール

```bash
npm install
```

### 2. サイト設定を更新

[`src/config/site.ts`](src/config/site.ts) を開き、公開用の情報に置き換えてください。

```ts
export const site = {
  operatorName: 'Your Name or Brand',
  defaultSupportEmail: 'support@example.com',
  githubUsername: 'your-github-username',
  repoName: 'apps',
  publicBaseUrl: 'https://example.com',
  googleAnalyticsId: '',
} as const;
```

[`astro.config.mjs`](astro.config.mjs) の `site` も合わせて更新します。

```js
site: 'https://example.com',
base: '/',
```

`googleAnalyticsId` に GA4 の Measurement ID（`G-XXXXXXXXXX`）を入れると、本番ビルド時のみ gtag が注入されます。空文字のままならタグは出ません。アプリ別分析用に `content_group1` / `app_slug` / `page_kind` を送信します。

### 3. ローカル確認

```bash
npm run dev
```

`http://localhost:4321/` で確認できます。

### 4. GitHub Pages デプロイ

1. リポジトリを GitHub に push
2. **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. `main` ブランチへ push すると [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) がデプロイ

カスタムドメインを使う場合は [`public/CNAME`](public/CNAME) を実運用のドメインに合わせて設定してください。

### 5. `apps.testkun.net` 移行の手動チェックリスト

コード側のドメイン・GA タグ・リポ名メタはリポ内で揃えています。公開前に以下を手元で実施してください。

**GitHub**

1. リポを `apps` に Rename（必要なら local `git remote set-url`）
2. Pages の Custom domain を `apps.testkun.net` に設定し Enforce HTTPS
3. `main` へ push して Actions デプロイを確認

**Cloudflare（`testkun.net` ゾーン）**

1. DNS: `apps` CNAME → 既存 `legal` と同じターゲット（通常 `testkun08080.github.io`）、プロキシ設定も同じ
2. Redirect Rule: Host `legal.testkun.net` → `https://apps.testkun.net${uri.path}${uri.query}`（301）
3. Email Routing: サポート窓口は `support-app@testkun.net`（デフォルト）と、アプリごとのサブアドレス `support-app+<slug>@testkun.net`（例: `support-app+watcher@testkun.net`）を使用。個別ルールを増やさなくても、キャッチオール転送先が同じ宛先（自分のメール）になっていれば `+タグ` 付きのアドレスもそのまま届く。受信側（Gmail など）で `To:` に `+watcher` `+shitagaki` `+life-office` を含むかでフィルタ・ラベル分けすれば、どのアプリ宛の問い合わせかを自動判別できる

**GA4**

1. Web データストリーム `https://apps.testkun.net` を作成し Measurement ID（`G-…`）を取得
2. [`src/config/site.ts`](src/config/site.ts) の `googleAnalyticsId` に設定して再デプロイ
3. カスタム定義（イベント）: `app_slug` / `page_kind`
4. Realtime で `content_group1`（アプリ slug）と `page_kind` を確認

**App Store Connect**

- 各アプリの Privacy / Support / Terms URL を `https://apps.testkun.net/...` に更新
- 必要なら各 `privacy.md` に Google Analytics の記載を追記

## 構成

```
src/apps/<slug>/
  config.ts          # 名前・テーマ（色）
  theme.css          # 専用ページ向けの追加スタイル
  Landing.astro      # /<slug>/ の専用ページ（レイアウト自由）
  Landing.en.astro   # 任意: 英語版ランディング
  pages/*.astro      # 任意: /<slug>/<name>/ の追加ページ
src/content/legal/<slug>/
  ja/privacy.md
  ja/terms.md
  en/privacy.md      # 任意: 英語版（未作成時は ja にフォールバック）
  en/terms.md
```

法務ページ（`/privacy/` `/terms/` `/support/`）は共通の `LegalLayout` を使い、`config.ts` のテーマを CSS 変数として適用します。専用ページは `BaseLayout` だけ借りて、見た目はアプリごとに自由です。

## 多言語対応

デフォルト言語は **日本語** です。既存 URL（`/<slug>/` など）はそのまま日本語向けとして維持されます。

| 言語 | URL 例 |
|------|--------|
| 日本語（デフォルト） | `/`, `/life-office/privacy/` |
| 英語 | `/en/`, `/en/life-office/privacy/` |

設定は [`src/config/i18n.ts`](src/config/i18n.ts) に集約されています。共通 UI 文字列は [`src/i18n/ui.ts`](src/i18n/ui.ts) にあります。

### 新しい言語を追加する

1. [`src/config/i18n.ts`](src/config/i18n.ts) の `locales` に言語コードを追加
2. [`astro.config.mjs`](astro.config.mjs) の `i18n.locales` を同期
3. [`src/i18n/ui.ts`](src/i18n/ui.ts) に UI 翻訳を追加
4. `src/pages/<locale>/` にルートを追加（`en/` を参考）
5. 法務文書は `src/content/legal/<slug>/<locale>/` に markdown を配置

翻訳が未整備のページは **日本語へフォールバック** します（404 にはしません）。

### アプリ名・タグラインの多言語化

[`src/apps/types.ts`](src/apps/types.ts) の `name` / `tagline` は文字列または locale 別オブジェクトを指定できます。

```ts
export const app = {
  slug: 'my-app',
  name: { ja: 'マイアプリ', en: 'My App' },
  tagline: { ja: '説明文', en: 'Description' },
  // ...
};
```

## 新しいアプリを追加

```bash
npm run new-app <slug> "<表示名>" [support-email]
```

例:

```bash
npm run new-app my-app "My App Name" support@example.com
```

生成されるファイル:

- `src/apps/<slug>/config.ts`
- `src/apps/<slug>/theme.css`
- `src/apps/<slug>/Landing.astro`
- `src/content/legal/<slug>/ja/privacy.md`
- `src/content/legal/<slug>/ja/terms.md`

`src/apps/<slug>/config.ts` を置くと registry に自動登録されます。

サポートメールは `support-app+<slug>@testkun.net` の形式（サブアドレス）を指定すると、どのアプリからの問い合わせかを受信側で判別しやすくなります。

追加後の作業:

1. `Landing.astro` と `theme.css` で専用ページを調整
2. `privacy.md` / `terms.md` を編集
3. `npm run dev` で表示確認
4. `git push` でデプロイ

追加の専用ページは `src/apps/<slug>/pages/<name>.astro` を置くと `/<slug>/<name>/` になります（`support` / `privacy` / `terms` は予約済み）。

## コマンド

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバー |
| `npm run check` | 型/設定チェック |
| `npm run lint` | 静的チェック |
| `npm run test` | 現在は `check` を実行 |
| `npm run build` | 静的サイト生成（`dist/`） |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run new-app` | 新アプリ scaffold |

## 環境変数について

現状このテンプレートは `.env` 必須ではありません。  
必要になった場合は `.env` を使い、秘密情報は絶対にコミットしないでください。

## npm 公開について

`package.json` は `"private": true` のままです。  
これは npm パッケージとしての誤公開防止であり、GitHub リポジトリ公開とは独立した設定です。

## ライセンス

[MIT](LICENSE)
