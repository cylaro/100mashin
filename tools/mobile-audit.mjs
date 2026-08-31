/**
 * mobile-audit.mjs — проверка мобильной адаптации в реальном браузере.
 *
 * Открывает страницы в headless Chrome через протокол DevTools, эмулирует
 * узкие экраны и замеряет то, что нельзя проверить чтением CSS:
 * горизонтальную прокрутку, выходящие за экран элементы, размеры целей
 * нажатия, перекрытие контента липкой панелью.
 *
 * Запуск: node tools/mobile-audit.mjs
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8842;
const CDP_PORT = 9333;

const CHROME = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
].find((p) => existsSync(p));

if (!CHROME) {
  console.error('Не найден Chrome или Edge — проверку выполнить нельзя.');
  process.exit(1);
}

/** Экраны: от самого узкого реального до планшета. */
const VIEWPORTS = [
  { name: 'iPhone SE', w: 320, h: 568, dpr: 2 },
  { name: 'Android S', w: 360, h: 740, dpr: 3 },
  { name: 'iPhone 14', w: 390, h: 844, dpr: 3 },
  { name: 'iPhone Plus', w: 414, h: 896, dpr: 3 },
  { name: 'Планшет', w: 768, h: 1024, dpr: 2 }
];

const PAGES = [
  '/',
  '/ceny/',
  '/uslugi/',
  '/uslugi/avtostekla/',
  '/uslugi/diagnostika/',
  '/uslugi/elektrika/',
  '/uslugi/hodovaya-tormoza/',
  '/uslugi/konditsioner/',
  '/uslugi/kuzovnoy-remont/',
  '/uslugi/remont-dvigatelya/',
  '/uslugi/remont-forsunok/',
  '/uslugi/remont-gbc/',
  '/uslugi/remont-turbin/',
  '/uslugi/shinomontazh/',
  '/uslugi/to/',
  '/uslugi/transmissiya/',
  '/uslugi/udalenie-katalizatora/',
  '/uslugi/zamena-grm/',
  '/kontakty/',
  '/otzyvy/',
  '/garantiya/',
  '/gruzovoy-servis/',
  '/raboty/',
  '/o-nas/',
  '/spasibo/',
  '/yuridicheskim-licam/',
  '/politika/',
  '/404.html'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Скрипт, который исполняется внутри страницы и собирает замеры. */
const PROBE = `(() => {
  const de = document.documentElement;
  const vw = window.innerWidth;
  const res = {
    scrollW: de.scrollWidth,
    clientW: de.clientWidth,
    overflowX: de.scrollWidth - de.clientWidth,
    wide: [],
    smallTargets: [],
    tinyText: [],
    stickyOverlap: null,
    navPanelHidden: null,
    horizontalScrollers: []
  };

  // Элементы, выходящие за правый край экрана.
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    // Осознанно прокручиваемые по горизонтали контейнеры не считаем ошибкой.
    const scrollable = cs.overflowX === 'auto' || cs.overflowX === 'scroll';
    if (scrollable && el.scrollWidth > el.clientWidth) {
      res.horizontalScrollers.push(el.className || el.tagName);
    }

    if (r.right > vw + 1 && !scrollable) {
      let inScroller = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const pcs = getComputedStyle(p);
        if (pcs.overflowX === 'auto' || pcs.overflowX === 'scroll') { inScroller = true; break; }
      }
      if (!inScroller) {
        res.wide.push({
          tag: el.tagName.toLowerCase(),
          cls: String(el.className).slice(0, 60),
          right: Math.round(r.right),
          w: Math.round(r.width)
        });
      }
    }
  }

  // Цели нажатия меньше 44x44 (WCAG 2.5.5 / 2.5.8).
  for (const el of document.querySelectorAll('a[href], button, input, select, textarea, summary')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.type === 'hidden') continue;
    if (el.closest('.form__botcheck') || el.classList.contains('form__botcheck')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    // Ссылки внутри текста — исключение по WCAG (inline в потоке текста).
    const inline = cs.display === 'inline' && el.tagName === 'A';
    if (inline) continue;
    if (r.height < 44 || r.width < 24) {
      res.smallTargets.push({
        tag: el.tagName.toLowerCase(),
        cls: String(el.className).slice(0, 45),
        text: (el.textContent || '').trim().slice(0, 25),
        w: Math.round(r.width),
        h: Math.round(r.height)
      });
    }
  }

  // Слишком мелкий текст.
  for (const el of document.querySelectorAll('p, li, span, dd, dt, td, th, label, a, button')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none') continue;
    const fs = parseFloat(cs.fontSize);
    if (fs && fs < 12) {
      res.tinyText.push({ cls: String(el.className).slice(0, 40), fs: fs.toFixed(1) });
    }
  }

  // Перекрывает ли липкая панель конец страницы.
  const bar = document.querySelector('[data-sticky-bar]');
  if (bar) {
    const bcs = getComputedStyle(bar);
    const barVisible = bcs.display !== 'none';
    const barH = bar.getBoundingClientRect().height;
    const bodyPad = parseFloat(getComputedStyle(document.body).paddingBottom) || 0;
    res.stickyOverlap = {
      visible: barVisible,
      barH: Math.round(barH),
      bodyPadBottom: Math.round(bodyPad),
      ok: !barVisible || bodyPad >= barH - 1
    };
  }

  const panel = document.querySelector('[data-nav-panel]');
  if (panel) {
    res.navPanelHidden = panel.hasAttribute('hidden');
    res.navToggleVisible = getComputedStyle(
      document.querySelector('[data-nav-toggle]')
    ).display !== 'none';
  }

  return res;
})()`;

/** Регрессии, которые нельзя обнаружить одним замером в исходном состоянии. */
const INTERACTION_PROBE = `(async () => {
  const waitFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const panel = document.querySelector('[data-nav-panel]');
  const close = document.querySelector('[data-nav-close]');

  const closeMenu = async () => {
    if (panel && !panel.hidden) {
      close?.click();
      await waitFrame();
    }
  };

  const tryOpen = async (selector, y) => {
    await closeMenu();
    window.scrollTo(0, y);
    await waitFrame();
    const opener = document.querySelector(selector);
    if (!opener || getComputedStyle(opener).display === 'none') return null;
    const r = opener.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const hit = document.elementFromPoint(x, cy);
    const hittable = !!hit && (hit === opener || opener.contains(hit));
    opener.click();
    await waitFrame();
    const pr = panel?.getBoundingClientRect();
    const result = {
      hittable,
      open: !!panel && !panel.hidden,
      expanded: opener.hasAttribute('data-nav-toggle')
        ? opener.getAttribute('aria-expanded') === 'true'
        : document.documentElement.classList.contains('is-nav-open'),
      panelTop: pr ? Math.round(pr.top) : null,
      panelLeft: pr ? Math.round(pr.left) : null,
      panelRight: pr ? Math.round(pr.right) : null,
      panelHeight: pr ? Math.round(pr.height) : null
    };
    await closeMenu();
    return result;
  };

  const maxScroll = Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const deep = Math.min(maxScroll, 1200);
  const topStart = await tryOpen('[data-nav-toggle]', 0);
  const topAfterScroll = await tryOpen('[data-nav-toggle]', deep);
  const bottomAfterScroll = await tryOpen('[data-nav-open]', deep);

  let date = null;
  const dateEl = document.querySelector('[data-booking] input[type="date"]');
  if (dateEl) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const iso = [yesterday.getFullYear(), String(yesterday.getMonth() + 1).padStart(2, '0'),
      String(yesterday.getDate()).padStart(2, '0')].join('-');
    dateEl.value = iso;
    dateEl.dispatchEvent(new Event('input', { bubbles: true }));
    await waitFrame();
    const note = document.querySelector('[data-booking-note]');
    const time = document.querySelector('[data-booking] select[name="time"]');
    date = {
      min: dateEl.min,
      max: dateEl.max,
      value: dateEl.value,
      noteHidden: note?.hidden ?? null,
      noteText: note?.textContent || '',
      pastRejected: !!note && !note.hidden && /прошла/i.test(note.textContent),
      timeDisabled: !!time?.disabled
    };
    dateEl.value = '';
    dateEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  window.scrollTo(0, 0);
  return { topStart, topAfterScroll, bottomAfterScroll, date };
})()`;

async function main() {
  // Локальный сервер
  const server = spawn('python', ['-m', 'http.server', String(PORT)], {
    cwd: ROOT,
    stdio: 'ignore'
  });
  await sleep(1500);

  const userDir = path.join(process.env.TEMP || '.', 'kilo', 'mobile-audit');
  const chrome = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--no-first-run',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${userDir}`,
      'about:blank'
    ],
    { stdio: 'ignore' }
  );
  await sleep(2500);

  const findings = [];
  let checks = 0;

  try {
    const list = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
    const target = list.find((t) => t.type === 'page');
    if (!target) throw new Error('Не найдена вкладка для подключения');

    const { WebSocket } = await import('node:worker_threads').then(() => ({
      WebSocket: globalThis.WebSocket
    }));
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => {
      ws.onopen = res;
      ws.onerror = rej;
    });

    let id = 0;
    const pending = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
    };
    const send = (method, params = {}) =>
      new Promise((res) => {
        const myId = ++id;
        pending.set(myId, res);
        ws.send(JSON.stringify({ id: myId, method, params }));
      });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });

    for (const vp of VIEWPORTS) {
      for (const page of PAGES) {
        checks++;
        await send('Emulation.setDeviceMetricsOverride', {
          width: vp.w,
          height: vp.h,
          deviceScaleFactor: vp.dpr,
          mobile: vp.w < 768
        });
        await send('Page.navigate', { url: `http://127.0.0.1:${PORT}${page}` });
        await sleep(750);

        const r = await send('Runtime.evaluate', {
          expression: PROBE,
          returnByValue: true
        });
        const data = r?.result?.result?.value;
        if (!data) {
          findings.push({ vp: vp.name, page, kind: 'probe', detail: 'нет данных' });
          continue;
        }

        if (data.overflowX > 1) {
          findings.push({
            vp: vp.name,
            page,
            kind: 'overflow',
            detail: `горизонтальная прокрутка +${data.overflowX}px`,
            wide: data.wide.slice(0, 4)
          });
        }
        for (const t of data.smallTargets.slice(0, 6)) {
          findings.push({
            vp: vp.name,
            page,
            kind: 'target',
            detail: `${t.tag}.${t.cls} «${t.text}» ${t.w}x${t.h}`
          });
        }
        for (const t of data.tinyText.slice(0, 3)) {
          findings.push({ vp: vp.name, page, kind: 'font', detail: `.${t.cls} ${t.fs}px` });
        }
        if (data.stickyOverlap && !data.stickyOverlap.ok) {
          findings.push({
            vp: vp.name,
            page,
            kind: 'sticky',
            detail: `панель ${data.stickyOverlap.barH}px, отступ body ${data.stickyOverlap.bodyPadBottom}px`
          });
        }
        if (vp.w >= 768 && data.navPanelHidden === true && data.navToggleVisible === false) {
          findings.push({
            vp: vp.name,
            page,
            kind: 'nav',
            detail: 'меню скрыто, а кнопки-гамбургера нет — навигация недоступна'
          });
        }

        if (vp.w < 768) {
          const interactionResult = await send('Runtime.evaluate', {
            expression: INTERACTION_PROBE,
            awaitPromise: true,
            returnByValue: true
          });
          const interaction = interactionResult?.result?.result?.value;
          for (const [name, state] of Object.entries({
            'верхняя кнопка в начале страницы': interaction?.topStart,
            'верхняя кнопка после прокрутки': interaction?.topAfterScroll,
            'нижняя кнопка после прокрутки': interaction?.bottomAfterScroll
          })) {
            if (!state) continue;
            const fitsViewport = Math.abs(state.panelTop) <= 1 && Math.abs(state.panelLeft) <= 1 &&
              Math.abs(state.panelRight - vp.w) <= 1 && state.panelHeight >= vp.h - 1;
            if (!state.hittable || !state.open || !state.expanded || !fitsViewport) {
              findings.push({
                vp: vp.name,
                page,
                kind: 'interaction',
                detail: `${name}: hit=${state.hittable}, open=${state.open}, expanded=${state.expanded}, ` +
                  `panel=${state.panelLeft}..${state.panelRight} / top ${state.panelTop}, h ${state.panelHeight}`
              });
            }
          }
          if (interaction?.date && (!interaction.date.min || !interaction.date.max ||
              !interaction.date.pastRejected || !interaction.date.timeDisabled)) {
            findings.push({
              vp: vp.name,
              page,
              kind: 'date',
              detail: `min=${interaction.date.min || 'нет'}, max=${interaction.date.max || 'нет'}, ` +
                `value=${interaction.date.value || 'нет'}, noteHidden=${interaction.date.noteHidden}, ` +
                `note=${JSON.stringify(interaction.date.noteText)}, прошлая отклонена=${interaction.date.pastRejected}, ` +
                `время заблокировано=${interaction.date.timeDisabled}`
            });
          }
        }

      }
    }

    ws.close();
  } finally {
    chrome.kill();
    server.kill();
  }

  // --- отчёт ---
  console.log(`Проверок выполнено: ${checks} (${VIEWPORTS.length} экранов x ${PAGES.length} страниц)\n`);

  const byKind = {};
  for (const f of findings) (byKind[f.kind] ??= []).push(f);

  const titles = {
    overflow: 'ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА',
    target: 'МАЛЕНЬКИЕ ЦЕЛИ НАЖАТИЯ (<44px по высоте)',
    font: 'СЛИШКОМ МЕЛКИЙ ТЕКСТ (<12px)',
    sticky: 'ЛИПКАЯ ПАНЕЛЬ ПЕРЕКРЫВАЕТ КОНТЕНТ',
    nav: 'НЕДОСТУПНАЯ НАВИГАЦИЯ',
    interaction: 'МОБИЛЬНОЕ МЕНЮ НЕ ОТКРЫВАЕТСЯ',
    date: 'ОГРАНИЧЕНИЯ ДАТЫ НЕ РАБОТАЮТ',
    probe: 'ОШИБКА ЗАМЕРА'
  };

  if (!findings.length) {
    console.log('Проблем мобильной адаптации не обнаружено.');
    return;
  }

  for (const [kind, list] of Object.entries(byKind)) {
    console.log(`\n=== ${titles[kind] || kind} — ${list.length} ===`);
    // Группируем одинаковые детали, чтобы отчёт был читаемым.
    const grouped = {};
    for (const f of list) {
      const key = f.detail;
      (grouped[key] ??= []).push(`${f.vp} ${f.page}`);
    }
    for (const [detail, where] of Object.entries(grouped).slice(0, 25)) {
      console.log(`  • ${detail}`);
      console.log(`      ${where.length > 4 ? where.slice(0, 4).join(', ') + ` … (+${where.length - 4})` : where.join(', ')}`);
      const withWide = list.find((f) => f.detail === detail && f.wide?.length);
      if (withWide) {
        for (const w of withWide.wide) {
          console.log(`      выходит за экран: ${w.tag}.${w.cls} right=${w.right} w=${w.w}`);
        }
      }
    }
  }
  process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
