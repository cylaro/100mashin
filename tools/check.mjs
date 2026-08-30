/**
 * check.mjs — проверка собранного сайта.
 * Валидирует JSON-LD, считает вес страниц, ищет типовые проблемы разметки.
 * Запуск: node tools/check.mjs
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['src', '.git', 'node_modules', 'tools', '.kilo']);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name) || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(ROOT).sort();
const problems = [];
const types = {};
let blocks = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const html = readFileSync(file, 'utf8');

  // --- JSON-LD ---
  const found = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  for (const b of found) {
    blocks++;
    const raw = b.replace(/<\/?script[^>]*>/g, '');
    try {
      const obj = JSON.parse(raw);
      const collect = (x) => {
        if (!x || typeof x !== 'object') return;
        if (Array.isArray(x)) return x.forEach(collect);
        if (x['@graph']) collect(x['@graph']);
        if (typeof x['@type'] === 'string') types[x['@type']] = (types[x['@type']] || 0) + 1;
      };
      collect(obj);
    } catch (e) {
      problems.push(`${rel}: невалидный JSON-LD — ${e.message}`);
    }
  }

  // --- разметка ---
  const count = (re) => (html.match(re) || []).length;

  if (count(/<h1[\s>]/g) !== 1) problems.push(`${rel}: <h1> должен быть один`);
  if (!/<html lang="ru">/.test(html)) problems.push(`${rel}: нет lang="ru"`);
  if (!/<link rel="canonical"/.test(html)) problems.push(`${rel}: нет canonical`);
  if (!/<main id="main">/.test(html)) problems.push(`${rel}: нет <main id="main">`);
  if (!/class="skip-link"/.test(html)) problems.push(`${rel}: нет skip-link`);
  if (/<img(?![^>]*\balt=)/.test(html)) problems.push(`${rel}: <img> без alt`);
  if (/<iframe(?![^>]*\btitle=)/.test(html)) problems.push(`${rel}: <iframe> без title`);
  if (/outline:\s*none/.test(html)) problems.push(`${rel}: outline:none в разметке`);
  if (/\{\{[A-Z_]+\}\}/.test(html)) problems.push(`${rel}: осталась незаполненная метка {{...}}`);
  if (/\{\{!--/.test(html)) problems.push(`${rel}: остался служебный комментарий партиала`);

  // таблицы должны иметь подпись
  const tables = count(/<table/g);
  const captions = count(/<caption/g);
  if (tables > captions) problems.push(`${rel}: таблиц ${tables}, подписей ${captions}`);

  // парность основных блоков
  for (const tag of ['section', 'div', 'nav', 'main', 'header', 'footer', 'table', 'form']) {
    const open = count(new RegExp(`<${tag}[\\s>]`, 'g'));
    const close = count(new RegExp(`</${tag}>`, 'g'));
    if (open !== close) problems.push(`${rel}: <${tag}> — открыто ${open}, закрыто ${close}`);
  }

  // язык-заглушки, которых не должно быть в готовом тексте
  for (const bad of ['Lorem', 'TODO', 'PLACEHOLDER', 'ЗАГЛУШКА', 'undefined', 'NaN']) {
    if (html.includes(bad)) problems.push(`${rel}: найдено «${bad}»`);
  }

  // Telegram упоминать нельзя: аккаунта нет
  if (/t\.me\//.test(html)) problems.push(`${rel}: ссылка на Telegram, которого нет`);
}

// --- вес страниц ---
const sizes = files
  .map((f) => ({ rel: path.relative(ROOT, f).replace(/\\/g, '/'), kb: statSync(f).size / 1024 }))
  .sort((a, b) => b.kb - a.kb);

const css = statSync(path.join(ROOT, 'assets/css/styles.css')).size / 1024;
const jsFiles = readdirSync(path.join(ROOT, 'assets/js'));
const js = jsFiles.reduce((s, f) => s + statSync(path.join(ROOT, 'assets/js', f)).size, 0) / 1024;

console.log('=== Страницы ===');
console.log(`  всего: ${files.length}`);
console.log(`  самая тяжёлая: ${sizes[0].rel} — ${sizes[0].kb.toFixed(1)} КБ`);
console.log(`  самая лёгкая:  ${sizes.at(-1).rel} — ${sizes.at(-1).kb.toFixed(1)} КБ`);
console.log(`  средний вес:   ${(sizes.reduce((s, x) => s + x.kb, 0) / sizes.length).toFixed(1)} КБ`);

console.log('\n=== Ресурсы ===');
console.log(`  CSS: ${css.toFixed(1)} КБ (один файл)`);
console.log(`  JS:  ${js.toFixed(1)} КБ (${jsFiles.length} модулей, без зависимостей)`);

console.log('\n=== Микроразметка ===');
console.log(`  блоков JSON-LD: ${blocks}`);
for (const [t, n] of Object.entries(types).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}: ${n}`);
}

console.log('\n=== Проблемы ===');
if (problems.length) {
  for (const p of problems) console.log(`  • ${p}`);
  process.exitCode = 1;
} else {
  console.log('  не найдено');
}
