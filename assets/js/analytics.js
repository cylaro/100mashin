/**
 * analytics.js — цели Яндекс.Метрики через ОДИН делегированный слушатель клика
 * на фазе перехвата. Всё безопасно превращается в no-op, если METRIKA_ID === 0
 * или window.ym отсутствует (например, блокировщик рекламы).
 */
import { METRIKA_ID, hasMetrika } from './config.js';

/** Полный список целей. Их же нужно создать в интерфейсе Метрики. */
export const GOALS = {
  PHONE_CLICK: 'PHONE_CLICK',
  WHATSAPP_CLICK: 'WHATSAPP_CLICK',
  VK_CLICK: 'VK_CLICK',
  MAP_OPEN: 'MAP_OPEN',
  FORM_START: 'FORM_START',
  FORM_SUBMIT: 'FORM_SUBMIT',
  BOOKING_SEND: 'BOOKING_SEND',
  CALC_USE: 'CALC_USE',
  PRICE_VIEW: 'PRICE_VIEW',
  ROUTE_CLICK: 'ROUTE_CLICK'
};

/** Ближайший родительский [data-section] — чтобы понимать, где именно кликнули. */
export const placeOf = (el) => el?.closest?.('[data-section]')?.dataset.section || 'page';

/**
 * Отправить цель. Безопасный no-op без Метрики.
 * @param {string} name  имя цели из GOALS
 * @param {object} [params]  дополнительные параметры визита
 */
export function goal(name, params = {}) {
  if (!name || !hasMetrika()) return;
  try {
    window.ym?.(METRIKA_ID, 'reachGoal', name, params);
  } catch {
    /* трекинг никогда не должен ломать страницу */
  }
}

/** Цели, которые срабатывают ровно один раз за сессию (страницу). */
const once = new Set();
export function goalOnce(name, params = {}) {
  if (once.has(name)) return;
  once.add(name);
  goal(name, params);
}

/** Определяем цель по кликнутой ссылке. */
function goalForLink(a) {
  const href = (a.getAttribute('href') || '').toLowerCase();
  if (href.startsWith('tel:')) return GOALS.PHONE_CLICK;
  if (href.includes('wa.me') || href.includes('api.whatsapp.com')) return GOALS.WHATSAPP_CLICK;
  if (href.includes('vk.com')) return GOALS.VK_CLICK;
  if (a.hasAttribute('data-route') || href.includes('yandex.ru/maps')) return GOALS.ROUTE_CLICK;
  return null;
}

/** Один слушатель на весь документ, capture — ловим даже при stopPropagation. */
function onClick(e) {
  const t = e.target;
  if (!(t instanceof Element)) return;
  const a = t.closest('a[href], [data-goal]');
  if (!a) return;

  const explicit = a.dataset?.goal;
  const name = explicit || (a.tagName === 'A' ? goalForLink(a) : null);
  if (!name) return;

  goal(name, { place: placeOf(a) });
}

/** FORM_START — на первый focusin в каждой форме. */
function initFormStart(root) {
  for (const form of root.querySelectorAll('[data-form], [data-booking]')) {
    let fired = false;
    form.addEventListener(
      'focusin',
      () => {
        if (fired) return;
        fired = true;
        goal(GOALS.FORM_START, { place: placeOf(form) });
      },
      { passive: true }
    );
  }
}

/**
 * PRICE_VIEW — когда пользователь дочитал прайс до середины.
 * Вызывается повторно из prices.js: разметка прайса появляется асинхронно,
 * уже после initAnalytics().
 */
export function watchPriceView(root = document) {
  const marks = root.querySelectorAll('[data-price-mid]:not([data-price-watched])');
  if (!marks.length || typeof IntersectionObserver !== 'function') return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        goalOnce(GOALS.PRICE_VIEW, { place: placeOf(entry.target) });
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.4 }
  );
  for (const m of marks) {
    m.setAttribute('data-price-watched', '');
    io.observe(m);
  }
}

/** Инициализация. Слушатели ставим всегда — goal() сам решает, отправлять ли. */
export function initAnalytics(root = document) {
  document.addEventListener('click', onClick, true);
  initFormStart(root);
  watchPriceView(root);
}