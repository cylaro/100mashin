/**
 * check-lazy.mjs — проверка предзагрузки карт через протокол DevTools.
 *
 * Зачем отдельный скрипт: под флагом --virtual-time-budget у Chrome
 * IntersectionObserver не срабатывает (виртуальное время не порождает
 * кадров прокрутки), поэтому обычный --dump-dom для этой проверки не годится.
 * Здесь мы подключаемся к живому браузеру, реально скроллим страницу
 * и читаем состояние DOM.
 *
 * Запуск: node tools/check-lazy.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8851;
const CDP = 9444;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('Не найден Chrome или Edge.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
      '--window-size=1280,900',
      `--remote-debugging-port=${CDP}`,
      `--user-data-dir=${path.join(process.env.TEMP || '.', 'kilo', 'lazycheck')}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  await sleep(2500);

  const out = [];
  let failed = false;

  try {
    const list = await (await fetch(`http://127.0.0.1:${CDP}/json/list`)).json();
    const target = list.find((t) => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        pending.get(m.id)(m);
        pending.delete(m.id);
      }
    };
    const send = (method, params = {}) =>
      new Promise((res) => {
        const myId = ++id;
        pending.set(myId, res);
        ws.send(JSON.stringify({ id: myId, method, params }));
      });
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true });
      return r?.result?.result?.value;
    };

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await sleep(2500);

    // 1. Вверху страницы карт быть не должно.
    const atTop = await evaluate(`document.querySelectorAll('.map__frame').length`);
    out.push(`Вверху страницы iframe карт: ${atTop} (ожидается 0)`);
    if (atTop !== 0) failed = true;

    // 2. Прокручиваем так, чтобы блок был ещё за экраном, но близко.
    await evaluate(`
      (() => {
        const b = document.querySelector('[data-map]');
        if (!b) return 0;
        const y = b.getBoundingClientRect().top + window.scrollY - 800;
        window.scrollTo(0, Math.max(0, y));
        return Math.round(window.scrollY);
      })()
    `);
    await sleep(1800);

    const nearby = await evaluate(`document.querySelectorAll('.map__frame').length`);
    const flag = await evaluate(`document.querySelector('[data-map]')?.dataset.mapPreloaded ?? 'нет'`);
    out.push(`Блок в ~800px под экраном: iframe = ${nearby}, метка предзагрузки = ${flag}`);
    if (nearby < 1) failed = true;

    // 3. Проверяем адрес виджета и атрибуты.
    const info = await evaluate(`
      (() => {
        const f = document.querySelector('.map__frame');
        if (!f) return null;
        return { src: f.src.slice(0, 60), loading: f.getAttribute('loading'), title: (f.getAttribute('title')||'').slice(0,48) };
      })()
    `);
    if (info) {
      out.push(`Виджет: ${info.src}…`);
      out.push(`  loading=${info.loading} · title="${info.title}"`);
    }

    // 4. Клик по второму триггеру должен по-прежнему работать.
    const afterClick = await evaluate(`
      (() => {
        const t = document.querySelector('[data-map-trigger]');
        if (!t) return 'триггеров не осталось — обе карты загружены';
        t.click();
        return 'клик выполнен';
      })()
    `);
    await sleep(900);
    const total = await evaluate(`document.querySelectorAll('.map__frame').length`);
    out.push(`Ручной клик: ${afterClick} · всего карт теперь ${total}`);

    ws.close();
  } finally {
    chrome.kill();
    server.kill();
  }

  console.log(out.map((l) => `  ${l}`).join('\n'));
  console.log(failed ? '\nРЕЗУЛЬТАТ: предзагрузка не работает' : '\nРЕЗУЛЬТАТ: предзагрузка работает');
  if (failed) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
