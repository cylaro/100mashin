/**
 * map.js — фасад карты с загрузкой по клику.
 * Пока пользователь не нажал кнопку, iframe Яндекс.Карт не грузится:
 * это экономит ~1 МБ трафика и не тормозит первую отрисовку.
 *
 * Выбранная форма URL — ?oid=<org id>&ol=biz.
 * Проверено: виджет отдаёт карточку организации (название, адрес, отзывы,
 * кнопка «Как добраться»), а не просто точку на карте. Форма с ll/whatshere
 * оставлена как запасная — для точек без org id в Яндекс.Справочнике.
 */
import { POINTS } from './config.js';
import { goal, GOALS, placeOf } from './analytics.js';

/** Карточка организации по её id в Яндекс.Справочнике. */
export const orgWidgetUrl = (org) =>
  `https://yandex.ru/map-widget/v1/?oid=${encodeURIComponent(org)}&ol=biz&z=17`;

/** Запасной вариант: точка по координатам, если org id нет. */
export const pointWidgetUrl = (lat, lon) =>
  `https://yandex.ru/map-widget/v1/?ll=${lon}%2C${lat}&z=17&mode=whatshere` +
  `&whatshere%5Bpoint%5D=${lon}%2C${lat}&whatshere%5Bzoom%5D=17`;

/** Разбирает data-coords="51.681267,39.179218" (широта, долгота). */
function parseCoords(value) {
  const parts = String(value || '')
    .split(',')
    .map((s) => Number(s.trim()));
  if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null;
  return { lat: parts[0], lon: parts[1] };
}

function titleFor(org, coords) {
  const point = POINTS.find((p) => p.org === org) ||
    POINTS.find((p) => coords && Math.abs(p.coords.lat - coords.lat) < 0.001);
  return point
    ? `Карта: автосервис «100 Машин», ${point.title}, Воронеж`
    : 'Карта: автосервис «100 Машин», Воронеж';
}

function load(box, trigger) {
  const org = box.dataset.org?.trim();
  const coords = parseCoords(box.dataset.coords);
  const src = org ? orgWidgetUrl(org) : coords ? pointWidgetUrl(coords.lat, coords.lon) : null;
  if (!src) return;

  const frame = document.createElement('iframe');
  frame.src = src;
  frame.className = 'map__frame';
  frame.title = titleFor(org, coords);
  frame.loading = 'lazy';
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
  frame.setAttribute('frameborder', '0');

  trigger.replaceWith(frame);
  box.dataset.mapLoaded = '1';
  goal(GOALS.MAP_OPEN, { place: placeOf(box) });
  frame.focus?.({ preventScroll: true });
}

export function initMaps(root = document) {
  const boxes = root.querySelectorAll('[data-map]');
  if (!boxes.length) return;

  for (const box of boxes) {
    const trigger = box.querySelector('[data-map-trigger]');
    if (!trigger || box.dataset.mapLoaded === '1') continue;
    trigger.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        load(box, trigger);
      },
      { once: true }
    );
  }
}