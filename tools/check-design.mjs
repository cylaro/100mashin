/**
 * check-design.mjs — объективные метрики визуальной согласованности.
 *
 * Заменяет «посмотреть глазами» там, где это возможно измерить: выравнивание
 * колонок, единообразие отступов и радиусов, контраст текста, соответствие
 * заявленной сетке. Ловит именно те дефекты, которые читаются как
 * «сделано небрежно»: разъехавшиеся края, случайные размеры, пустоты.
 *
 * Запуск: node tools/check-design.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8895;
const CDP = 9474;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('Не найден Chrome или Edge.');
  process.exit(1);
}

const PAGES = [
  '/',
  '/uslugi/',
  '/ceny/',
  '/garantiya/',
  '/raboty/',
  '/otzyvy/',
  '/gruzovoy-servis/',
  '/yuridicheskim-licam/',
  '/o-nas/',
  '/kontakty/',
  '/uslugi/remont-gbc/',
  '/uslugi/diagnostika/'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Скрипт-измеритель, исполняется внутри страницы. */
const PROBE = `(() => {
  const R = { problems: [], stats: {} };
  const px = (v) => Math.round(parseFloat(v) || 0);

  // --- 1. Левый край: всё содержимое должно начинаться по одной линии ---
  const lefts = new Map();
  for (const c of document.querySelectorAll('main .container')) {
    const l = Math.round(c.getBoundingClientRect().left);
    lefts.set(l, (lefts.get(l) || 0) + 1);
  }
  R.stats.containerLefts = [...lefts.keys()];
  if (lefts.size > 1) {
    R.problems.push('Контейнеры начинаются с разных отступов: ' + [...lefts.keys()].join(', ') + 'px');
  }

  // --- 2. Колонки в сетках не должны заканчиваться вразнобой ---
  for (const g of document.querySelectorAll('.split, .sites, .dirs, .quotes, .themes, .warranty-cards')) {
    const kids = [...g.children].filter(k => k.getBoundingClientRect().height > 0);
    if (kids.length < 2) continue;
    const rects = kids.map(k => k.getBoundingClientRect());
    // Считаем только для элементов в одном ряду
    const firstTop = Math.round(rects[0].top);
    const sameRow = rects.filter(r => Math.abs(Math.round(r.top) - firstTop) < 4);
    if (sameRow.length < 2) continue;
    const hs = sameRow.map(r => Math.round(r.height));
    const spread = Math.max(...hs) - Math.min(...hs);
    if (spread > 24) {
      R.problems.push('Колонки в .' + String(g.className).split(' ')[0] + ' разной высоты: ' + hs.join('/') + 'px (разброс ' + spread + ')');
    }
  }

  // --- 3. Радиусы: их должно быть немного, из набора токенов ---
  const radii = new Set();
  for (const el of document.querySelectorAll('main *')) {
    const r = px(getComputedStyle(el).borderTopLeftRadius);
    if (r > 0 && r < 500) radii.add(r);
  }
  R.stats.radii = [...radii].sort((a, b) => a - b);
  if (radii.size > 7) {
    R.problems.push('Слишком много разных радиусов: ' + R.stats.radii.join(', '));
  }

  // --- 4. Кегли шрифта: разнобой выдаёт отсутствие системы ---
  const sizes = new Set();
  for (const el of document.querySelectorAll('main p, main li, main h1, main h2, main h3, main span, main a, main dd, main dt')) {
    if (!el.textContent.trim()) continue;
    sizes.add(px(getComputedStyle(el).fontSize));
  }
  R.stats.fontSizes = [...sizes].sort((a, b) => a - b);
  if (sizes.size > 12) {
    R.problems.push('Слишком много кеглей (' + sizes.size + '): ' + R.stats.fontSizes.join(', '));
  }

  // --- 5. Контраст основного текста ---
  const lum = (c) => {
    const m = c.match(/[\\d.]+/g);
    if (!m) return null;
    const [r, g, b] = m.slice(0, 3).map(Number);
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const bgOf = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const bg = getComputedStyle(e).backgroundColor;
      if (bg && !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent') return bg;
    }
    return 'rgb(255,255,255)';
  };
  let lowContrast = 0;
  const checked = [...document.querySelectorAll('main p, main li, main dd, main a')].slice(0, 220);
  for (const el of checked) {
    if (!el.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    const l1 = lum(cs.color), l2 = lum(bgOf(el));
    if (l1 === null || l2 === null) continue;
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const big = px(cs.fontSize) >= 24 || (px(cs.fontSize) >= 19 && Number(cs.fontWeight) >= 700);
    if (ratio < (big ? 3 : 4.5)) lowContrast++;
  }
  R.stats.lowContrast = lowContrast;
  if (lowContrast > 0) R.problems.push('Текст с недостаточным контрастом: ' + lowContrast + ' элементов');

  // --- 6. Пустота справа в первом экране ---
  const inner = document.querySelector('.hero__inner');
  const body = document.querySelector('.hero__body');
  if (inner && body && window.innerWidth >= 992) {
    const ib = inner.getBoundingClientRect(), bb = body.getBoundingClientRect();
    const card = document.querySelector('.hero .hero-card');
    const gap = Math.round(ib.right - bb.right);
    R.stats.heroGap = gap;
    if (!card && gap > 200) {
      R.problems.push('В первом экране справа пусто: ' + gap + 'px без содержимого');
    }
  }

  // --- 7. Одинаковые отступы у всех секций = монотонный ритм ---
  const pads = new Set();
  for (const s of document.querySelectorAll('main > section')) {
    const p = px(getComputedStyle(s).paddingTop);
    if (p > 0) pads.add(p);
  }
  R.stats.sectionPads = [...pads].sort((a, b) => a - b);
  if (pads.size === 1 && document.querySelectorAll('main > section').length > 4) {
    R.problems.push('Все секции с одинаковым отступом ' + [...pads][0] + 'px — ритм монотонный');
  }

  // --- 8. Сироты: заголовок, у которого последнее слово упало на строку ---
  R.stats.h1w = 0;
  const h1 = document.querySelector('h1');
  if (h1) R.stats.h1w = Math.round(h1.getBoundingClientRect().width);

  return R;
})()`;

async function main() {
  const server = spawn('python', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT,
    stdio: 'ignore'
  });
  await sleep(1500);

  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      `--remote-debugging-port=${CDP}`,
      `--user-data-dir=${path.join(process.env.TEMP || '.', 'kilo', 'designcheck')}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  await sleep(2500);

  const all = [];
  try {
    const list = await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json();
    const target = list.find((t) => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    };
    const send = (method, params = {}) =>
      new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });

    await send('Page.enable');
    await send('Runtime.enable');
    // Без этого браузер держит styles.css в кеше между переходами, и проверка
    // показывает состояние до правок — легко принять за «правка не помогла».
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });

    for (const w of [1440, 390]) {
      for (const page of PAGES) {
        await send('Emulation.setDeviceMetricsOverride', {
          width: w, height: 900, deviceScaleFactor: 1, mobile: false
        });
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}${page}` });
        await sleep(1600);
        const r = await send('Runtime.evaluate', { expression: PROBE, returnByValue: true });
        const v = r?.result?.result?.value;
        if (v) all.push({ w, page, ...v });
      }
    }
    ws.close();
  } finally {
    chrome.kill();
    server.kill();
  }

  const withProblems = all.filter((a) => a.problems.length);

  console.log('=== Сводка по системе ===');
  const wide = all.find((a) => a.w === 1440);
  if (wide) {
    console.log('  радиусы:  ' + wide.stats.radii.join(', ') + 'px');
    console.log('  кегли:    ' + wide.stats.fontSizes.join(', ') + 'px');
    console.log('  отступы секций: ' + wide.stats.sectionPads.join(', ') + 'px');
  }

  console.log('\n=== Замечания ===');
  if (!withProblems.length) {
    console.log('  не найдено');
  } else {
    const grouped = new Map();
    for (const a of withProblems) {
      for (const p of a.problems) {
        const key = p;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(`${a.w}px ${a.page}`);
      }
    }
    for (const [problem, where] of grouped) {
      console.log(`  • ${problem}`);
      console.log(`      ${where.length > 3 ? where.slice(0, 3).join(', ') + ` … (+${where.length - 3})` : where.join(', ')}`);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
