/**
 * Локальная проверка раскладки ссылок как на GitHub Pages:
 * сайт мысленно размещается в /100mashin/, каждый относительный
 * href/src из собранного HTML разрешается и проверяется на наличие файла.
 * Запуск: node tools/check-pages-path.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '/100mashin/'; // как в cylaro.github.io/100mashin/

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'src' || e.name === 'tools') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
const problems = [];
let checked = 0;

for (const file of files) {
  const siteDir = path.dirname(path.relative(ROOT, file)).replace(/\\/g, '/');
  const pagePath = BASE + (siteDir === '.' ? '' : siteDir + '/');
  const html = readFileSync(file, 'utf8');

  for (const [, attr, raw] of html.matchAll(/\b(href|src)="([^"]+)"/g)) {
    if (/^(https?:|tel:|mailto:|data:|#)/i.test(raw)) continue;
    if (raw.startsWith('//')) continue;
    const resolved = new URL(raw, 'http://x' + pagePath).pathname;
    checked++;
    if (!resolved.startsWith(BASE)) {
      problems.push(`${pagePath}  ${attr}="${raw}"  →  ${resolved}  ВНЕ БАЗЫ САЙТА`);
      continue;
    }
    const inSite = resolved.slice(BASE.length - 1); // '/uslugi/' и т.п.
    const finalTarget = path.join(ROOT, decodeURIComponent(inSite), inSite.endsWith('/') ? 'index.html' : '');
    if (!existsSync(finalTarget)) {
      problems.push(`${pagePath}  ${attr}="${raw}"  →  ${resolved}  НЕТ ФАЙЛА`);
    }
  }
}

console.log(`Проверено ссылок: ${checked} на ${files.length} страницах (база ${BASE})`);
if (problems.length) {
  console.log(`Битых: ${problems.length}`);
  for (const p of problems) console.log('  • ' + p);
  process.exitCode = 1;
} else {
  console.log('Битых ссылок нет — сайт корректно работает из подкаталога.');
}
