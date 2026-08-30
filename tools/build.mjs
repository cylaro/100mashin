/**
 * Сборка статического сайта из партиалов и страниц.
 *
 * Шапка и подвал должны физически присутствовать в каждом HTML-файле,
 * потому что Яндекс плохо исполняет JS. Поддерживать их копии руками —
 * гарантированный рассинхрон, поэтому здесь один источник правды.

 * Что делает:
 *   src/partials/*.html  +  src/pages/*.js  →  готовые .html в корне
 *   плюс sitemap.xml по фактически собранным страницам.
 *
 * Запуск:  node tools/build.mjs
 * Проверка: node tools/build.mjs --check   (ничего не пишет, только валидирует)
 *
 * Зависимостей нет. Только стандартная библиотека Node.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://100mashin.ru';
const CHECK_ONLY = process.argv.includes('--check');

const read = (rel) => readFile(path.join(ROOT, rel), 'utf8');

/** Убирает служебные комментарии {{!-- ... --}} из партиалов. */
const stripComments = (s) => s.replace(/\{\{!--[\s\S]*?--\}\}\s*/g, '');

/**
 * Отмечает активный пункт меню.
 * В шапке стоят метки {{CUR_<key>}}; для текущей страницы подставляем
 * aria-current="page", для остальных — пустоту.
 */
function applyCurrent(header, navKey) {
  return header.replace(/\{\{CUR_([a-z_]+)\}\}/g, (_, key) =>
    key === navKey ? ' aria-current="page"' : ''
  );
}

/** Экранирование для значений атрибутов и текста. */
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Хлебные крошки: видимые + микроразметка BreadcrumbList. */
function breadcrumbs(trail, url) {
  if (!trail?.length) return { html: '', jsonld: '' };

  const items = [{ name: 'Главная', href: '/' }, ...trail];
  const lis = items
    .map((it, i) => {
      const last = i === items.length - 1;
      return last
        ? `        <li><span aria-current="page">${esc(it.name)}</span></li>`
        : `        <li><a href="${esc(it.href)}">${esc(it.name)}</a></li>`;
    })
    .join('\n');

  const html = `    <nav class="breadcrumbs container" aria-label="Хлебные крошки">
      <ol>
${lis}
      </ol>
    </nav>`;

  const listElements = items.map((it, i) => {
    const entry = {
      '@type': 'ListItem',
      position: i + 1,
      name: it.name
    };
    // У последнего элемента item не указываем — так требует спецификация.
    if (i < items.length - 1) entry.item = `${SITE}${it.href}`;
    return entry;
  });

  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: listElements
  });

  return { html, jsonld: `<script type="application/ld+json">${jsonld}</script>` };
}

/** Собирает одну страницу в полный HTML-документ. */
function render({ page, head, header, footer }) {
  const url = `${SITE}${page.url}`;
  const crumbs = breadcrumbs(page.trail, page.url);

  const extras = [page.jsonld || '', crumbs.jsonld]
    .filter(Boolean)
    .map((s) => `\n${s}`)
    .join('');

  const filledHead = head
    .replace(/\{\{TITLE\}\}/g, esc(page.title))
    .replace(/\{\{DESC\}\}/g, esc(page.description))
    .replace(/\{\{CANONICAL\}\}/g, esc(url))
    .replace(/\{\{OG_IMAGE\}\}/g, esc(page.ogImage || `${SITE}/assets/img/og-cover.jpg`))
    .replace(/\{\{ROBOTS\}\}/g, esc(page.robots || 'index, follow, max-image-preview:large'))
    .replace(/\{\{HEAD_EXTRA\}\}/g, extras);

  const indent = (block, pad) =>
    block
      .split('\n')
      .map((l) => (l.trim() ? pad + l : l))
      .join('\n');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
${indent(filledHead, '  ')}
</head>
<body>
${indent(applyCurrent(header, page.navKey), '  ')}

  <main id="main">
${crumbs.html ? crumbs.html + '\n' : ''}${page.body}
  </main>

${indent(footer, '  ')}
</body>
</html>
`;
}

/**
 * Куда писать файл: '/' → index.html, '/ceny/' → ceny/index.html.
 * Страницы, чей url заканчивается на .html, пишутся в корень как есть —
 * это нужно для 404.html, который GitHub Pages ищет именно там.
 */
const outPathFor = (url) => {
  if (url === '/') return 'index.html';
  if (url.endsWith('.html')) return url.replace(/^\//, '');
  return path.join(url.replace(/^\/|\/$/g, ''), 'index.html');
};

async function loadPages() {
  const dir = path.join(ROOT, 'src', 'pages');
  // Файлы с подчёркиванием — вспомогательные (_shared.js), не страницы.
  const files = (await readdir(dir))
    .filter((f) => f.endsWith('.js') && !f.startsWith('_'))
    .sort();
  const pages = [];

  for (const file of files) {
    const mod = await import(new URL(`../src/pages/${file}`, import.meta.url).href);
    const list = Array.isArray(mod.default) ? mod.default : [mod.default];
    for (const p of list) {
      if (!p?.url) throw new Error(`${file}: у страницы нет url`);
      pages.push(p);
    }
  }
  return pages;
}

/** Проверки, которые ловят типовые ошибки до публикации. */
function validate(pages) {
  const problems = [];
  const seen = new Set();

  for (const p of pages) {
    if (seen.has(p.url)) problems.push(`Дубль url: ${p.url}`);
    seen.add(p.url);

    if (!p.url.startsWith('/')) problems.push(`${p.url}: url должен начинаться со /`);
    if (p.url !== '/' && !p.url.endsWith('/') && !p.url.endsWith('.html')) {
      problems.push(`${p.url}: url должен кончаться на / либо на .html`);
    }
    if (!p.title) problems.push(`${p.url}: нет title`);
    if (!p.description) problems.push(`${p.url}: нет description`);
    if (p.title && p.title.length > 70) {
      problems.push(`${p.url}: title длинный (${p.title.length} зн., лучше до 70)`);
    }
    if (p.description && p.description.length > 180) {
      problems.push(`${p.url}: description длинный (${p.description.length} зн., лучше до 180)`);
    }
    if (!p.body?.trim()) problems.push(`${p.url}: пустое тело страницы`);
    const h1 = (p.body?.match(/<h1[\s>]/g) || []).length;
    if (h1 !== 1) problems.push(`${p.url}: должен быть ровно один <h1>, найдено ${h1}`);
    if (p.jsonld) {
      const blocks = p.jsonld.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
      for (const b of blocks) {
        const raw = b.replace(/<\/?script[^>]*>/g, '');
        try {
          JSON.parse(raw);
        } catch (e) {
          problems.push(`${p.url}: невалидный JSON-LD (${e.message})`);
        }
      }
    }
  }
  return problems;
}

/** sitemap.xml по собранным страницам, без noindex. */
function sitemap(pages) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages
    .filter((p) => !/noindex/.test(p.robots || ''))
    .map((p) => {
      const priority = p.url === '/' ? '1.0' : p.priority || '0.7';
      const freq = p.changefreq || (p.url === '/' ? 'weekly' : 'monthly');
      return `  <url>
    <loc>${SITE}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/** Проверяет, что все внутренние ссылки ведут на существующие страницы. */
function checkLinks(pages, htmlByUrl) {
  const known = new Set(pages.map((p) => p.url));
  // Файлы, которые лежат в репозитории вне системы страниц.
  const staticOk = new Set([
    '/404.html',
    '/sitemap.xml',
    '/robots.txt',
    '/manifest.webmanifest',
    '/favicon.ico'
  ]);
  const problems = [];

  for (const [url, html] of htmlByUrl) {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    for (const href of hrefs) {
      if (/^(https?:|tel:|mailto:|viber:|#|data:)/i.test(href)) continue;
      const clean = href.split('#')[0].split('?')[0];
      if (!clean || clean.startsWith('/assets/') || staticOk.has(clean)) continue;
      if (!known.has(clean)) problems.push(`${url} → битая ссылка ${href}`);
    }
  }
  return problems;
}

async function main() {
  const [headRaw, headerRaw, footerRaw] = await Promise.all([
    read('src/partials/head.html'),
    read('src/partials/header.html'),
    read('src/partials/footer.html')
  ]);

  const head = stripComments(headRaw).trim();
  const header = stripComments(headerRaw).trim();
  const footer = stripComments(footerRaw).trim();

  const pages = await loadPages();

  const problems = validate(pages);
  const htmlByUrl = new Map();
  for (const page of pages) {
    htmlByUrl.set(page.url, render({ page, head, header, footer }));
  }
  problems.push(...checkLinks(pages, htmlByUrl));

  if (problems.length) {
    console.error(`\nНайдено проблем: ${problems.length}\n`);
    for (const p of problems) console.error(`  • ${p}`);
    console.error('');
    process.exitCode = 1;
    if (!CHECK_ONLY) return;
  }

  if (CHECK_ONLY) {
    if (!problems.length) console.log(`Проверка пройдена: ${pages.length} страниц, ошибок нет.`);
    return;
  }

  for (const [url, html] of htmlByUrl) {
    const out = path.join(ROOT, outPathFor(url));
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, html, 'utf8');
  }

  await writeFile(path.join(ROOT, 'sitemap.xml'), sitemap(pages), 'utf8');

  console.log(`Собрано страниц: ${pages.length}`);
  console.log('sitemap.xml обновлён.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
