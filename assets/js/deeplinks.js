/**
 * Сборка ссылок WhatsApp и вспомогательных tel:.
 * WhatsApp — основной канал: он работает без бэкенда и без регистраций.
 */
import { WA_NUMBER, SITE } from './config.js';

/** Текст по умолчанию, если у элемента нет data-wa-text. */
export const WA_DEFAULT_TEXT =
  'Здравствуйте! Пишу с сайта 100mashin.ru. Хочу записаться на ремонт. Авто: ';

/**
 * Ссылка на WhatsApp с предзаполненным текстом.
 * @param {string} [text] текст сообщения (русский, без экранирования)
 * @returns {string} готовый https://wa.me/... URL
 */
export function waLink(text) {
  const msg = typeof text === 'string' && text.length ? text : WA_DEFAULT_TEXT;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

/**
 * Из отображаемого телефона делает корректный tel:-href.
 * '+7 (906) 680-00-01' → 'tel:+79066800001'
 * @param {string} display
 * @returns {string}
 */
export function formatPhoneHref(display) {
  const raw = String(display ?? '');
  const digits = raw.replace(/\D+/g, '');
  if (!digits) return '';
  let n = digits;
  if (n.length === 11 && n.startsWith('8')) n = `7${n.slice(1)}`;
  if (n.length === 10) n = `7${n}`;
  return `tel:+${n}`;
}

/** Ссылка на маршрут в Яндекс.Картах до точки. */
export function routeLink({ lat, lon }) {
  return `https://yandex.ru/maps/?rtext=~${lat}%2C${lon}&rtt=auto`;
}

/** Аккуратно склеивает строки сообщения, выкидывая пустые. */
export const composeMessage = (lines) =>
  lines.filter((l) => typeof l === 'string' && l.trim().length).join('\n');

/** Строка «Страница: …» для контекста заявки. */
export const pageLine = () => {
  const href = typeof location !== 'undefined' ? location.href : SITE;
  return `Страница: ${href}`;
};

/**
 * Прописывает href всем [data-wa] на странице.
 * Ничего не ломает, если элементов нет.
 */
export function initDeeplinks(root = document) {
  for (const el of root.querySelectorAll('[data-wa]')) {
    const text = el.dataset.waText;
    el.setAttribute('href', waLink(text));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  }
}