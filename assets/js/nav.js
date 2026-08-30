/**
 * nav.js — мобильное меню и отметка текущей страницы.
 * Панель скрывается/показывается атрибутом hidden, на <html> вешается .is-nav-open
 * (за прокрутку и анимацию отвечает CSS).
 */

/* Совпадает с контрольной точкой меню в styles.css: ниже — гамбургер
   и выпадающая панель, выше — горизонтальный список. */
const BREAKPOINT = '(min-width: 64rem)';
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
const focusables = (panel) => Array.from(panel.querySelectorAll(FOCUSABLE)).filter(visible);

/** Нормализуем путь: убираем index.html и хвостовой слэш. */
function normalizePath(pathname) {
  let p = String(pathname || '/');
  try {
    p = decodeURI(p);
  } catch {
    /* оставляем как есть */
  }
  p = p.replace(/\/index\.html?$/i, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p.toLowerCase() || '/';
}

/** Ставит aria-current="page" на ссылки, ведущие на текущую страницу. */
export function markCurrent(nav) {
  const here = normalizePath(location.pathname);
  for (const a of nav.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    // Телефоны, почта и чистые анкоры текущей страницей не считаются.
    if (!href || href.startsWith('#') || /^(tel:|mailto:)/i.test(href)) continue;
    let url;
    try {
      url = new URL(href, location.href);
    } catch {
      continue;
    }
    if (url.origin !== location.origin) continue;
    if (normalizePath(url.pathname) === here) {
      a.setAttribute('aria-current', 'page');
    } else {
      a.removeAttribute('aria-current');
    }
  }
}

export function initNav(root = document) {
  const nav = root.querySelector('[data-nav]');
  if (!nav) return;

  markCurrent(nav);

  const toggle = nav.querySelector('[data-nav-toggle]');
  const panel = nav.querySelector('[data-nav-panel]');
  if (!toggle || !panel) return;

  const html = document.documentElement;
  const mq = window.matchMedia?.(BREAKPOINT);

  /** На широком экране меню всегда развёрнуто — гамбургера там нет. */
  const isDesktop = () => !!mq?.matches;
  const isOpen = () => !panel.hasAttribute('hidden');

  function open() {
    if (isOpen()) return;
    panel.removeAttribute('hidden');
    toggle.setAttribute('aria-expanded', 'true');
    html.classList.add('is-nav-open');
    const first = focusables(panel)[0];
    (first || panel).focus?.({ preventScroll: true });
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen()) return;
    panel.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
    html.classList.remove('is-nav-open');
    if (restoreFocus) toggle.focus?.({ preventScroll: true });
  }

  /**
   * Синхронизация с контрольной точкой.
   *
   * На широком экране hidden обязан быть снят: в reset действует
   * [hidden]{display:none!important}, иначе меню исчезнет целиком.
   *
   * На старте isOpen() возвращает true, потому что hidden ещё не выставлен,
   * поэтому при initial закрываем панель принудительно.
   */
  function syncViewport({ initial = false } = {}) {
    if (isDesktop()) {
      panel.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      html.classList.remove('is-nav-open');
      return;
    }
    if (initial || !isOpen()) {
      panel.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      html.classList.remove('is-nav-open');
    }
  }

  // Стартовое состояние: связка кнопка ↔ панель объявлена.
  toggle.setAttribute('aria-expanded', 'false');
  if (!toggle.hasAttribute('aria-controls')) {
    if (!panel.id) panel.id = 'nav-panel';
    toggle.setAttribute('aria-controls', panel.id);
  }
  if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
  syncViewport({ initial: true });

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    if (isDesktop()) return;
    isOpen() ? close() : open();
  });

  // Escape закрывает, Tab держится внутри панели (осознанная ловушка фокуса).
  document.addEventListener('keydown', (e) => {
    if (isDesktop() || !isOpen()) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key !== 'Tab') return;

    const items = focusables(panel);
    if (!items.length) {
      e.preventDefault();
      panel.focus?.({ preventScroll: true });
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && (active === first || active === panel || !panel.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Клик вне меню.
  document.addEventListener('click', (e) => {
    if (isDesktop() || !isOpen()) return;
    const t = e.target;
    if (!(t instanceof Node)) return;
    if (panel.contains(t) || toggle.contains(t)) return;
    close({ restoreFocus: false });
  });

  // Клик по ссылке внутри меню — уходим на страницу, меню закрываем.
  panel.addEventListener('click', (e) => {
    if (isDesktop()) return;
    const t = e.target;
    if (t instanceof Element && t.closest('a[href]')) close({ restoreFocus: false });
  });

  // Переход через контрольную точку в обе стороны.
  mq?.addEventListener?.('change', syncViewport);
}