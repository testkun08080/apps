#!/usr/bin/env node
/**
 * Scaffold a new app: config, themed landing, and privacy/terms markdown.
 *
 * Usage:
 *   npm run new-app <slug> "<Display Name>" [support-email]
 *
 * Example:
 *   npm run new-app my-app "My App Name" support@example.com
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const [slug, name, supportEmailArg] = process.argv.slice(2);

if (!slug || !name) {
  console.error('Usage: npm run new-app <slug> "<Display Name>" [support-email]');
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error('Error: slug must be lowercase alphanumeric with hyphens (e.g. my-app)');
  process.exit(1);
}

const reserved = new Set(['support', 'privacy', 'terms', 'index', 'ja', 'en']);
if (reserved.has(slug)) {
  console.error(`Error: slug "${slug}" is reserved`);
  process.exit(1);
}

const appDir = join(root, 'src/apps', slug);
const contentDir = join(root, 'src/content/legal', slug, 'ja');

if (existsSync(appDir) || existsSync(join(root, 'src/content/legal', slug))) {
  console.error(`Error: app "${slug}" already exists`);
  process.exit(1);
}

// 値は TypeScript / Markdown のソースにそのまま埋め込まれるため、コードや構造を壊す文字を拒否する
if (/['"`\\$<>{}\r\n]/.test(name) || name.length > 100) {
  console.error('Error: display name must be under 100 chars and must not contain quotes, backslashes, $, <, >, { } or line breaks');
  process.exit(1);
}

const supportEmail = supportEmailArg ?? 'support@example.com';
if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(supportEmail)) {
  console.error(`Error: invalid support email "${supportEmail}"`);
  process.exit(1);
}
const tagline = `${name} のサポート・法務ページ`;
const updatedDate = new Date().toISOString().slice(0, 10);

const replacePlaceholders = (text) =>
  text
    .replaceAll('__APP_SLUG__', slug)
    .replaceAll('__APP_NAME__', name)
    .replaceAll('__APP_TAGLINE__', tagline)
    .replaceAll('__SUPPORT_EMAIL__', supportEmail)
    .replaceAll('__UPDATED_DATE__', updatedDate);

mkdirSync(appDir, { recursive: true });

for (const file of ['config.ts', 'theme.css', 'Landing.astro']) {
  const template = readFileSync(join(root, 'templates/app', file), 'utf8');
  writeFileSync(join(appDir, file), replacePlaceholders(template));
}

mkdirSync(contentDir, { recursive: true });
for (const file of ['privacy.md', 'terms.md']) {
  const template = readFileSync(join(root, 'templates/app', file), 'utf8');
  writeFileSync(join(contentDir, file), replacePlaceholders(template));
}

console.log(`\nCreated app "${name}" (${slug})\n`);
console.log('Files:');
console.log(`  src/apps/${slug}/config.ts`);
console.log(`  src/apps/${slug}/theme.css`);
console.log(`  src/apps/${slug}/Landing.astro`);
console.log(`  src/content/legal/${slug}/ja/privacy.md`);
console.log(`  src/content/legal/${slug}/ja/terms.md`);
console.log('\nNext steps:');
console.log('  1. Edit Landing.astro / theme.css for the app page');
console.log('  2. Edit privacy.md and terms.md');
console.log(`  3. npm run dev  →  http://localhost:4321/${slug}/`);
console.log('  4. git push to deploy via GitHub Actions');
console.log('\nPublic URLs (after deploy):');
console.log(`  App:     https://YOUR_DOMAIN/${slug}/`);
console.log(`  Support: https://YOUR_DOMAIN/${slug}/support/`);
console.log(`  Privacy: https://YOUR_DOMAIN/${slug}/privacy/`);
console.log(`  Terms:   https://YOUR_DOMAIN/${slug}/terms/`);
console.log('\nEnglish URLs (when UI translations are used):');
console.log(`  App:     https://YOUR_DOMAIN/en/${slug}/`);
console.log('\nOptional extra pages:');
console.log(`  src/apps/${slug}/pages/<name>.astro  →  /${slug}/<name>/`);
console.log('\nOptional localized landing:');
console.log(`  src/apps/${slug}/Landing.en.astro  →  English landing page`);
