/**
 * calc.js — калькулятор предварительной оценки работ.
 * Считает только работу: запчасти в оценку не входят и это сказано в выводе.
 */
import { PRICES_URL, CAR_CLASSES, PHONES } from './config.js';
import { waLink, composeMessage, pageLine } from './deeplinks.js';
import { goal, goalOnce, GOALS, placeOf } from './analytics.js';

const NBSP = '\u00A0';
const nf = new Intl.NumberFormat('ru-RU');

const money = (n) => `${nf.format(n).replace(/\s/g, NBSP)}${NBSP}₽`;
const round100 = (n) => Math.round(n / 100) * 100;

/** Верхняя граница диапазона — ×1.6 от нижней. */
export const UPPER_K = 1.6;

const DISCLAIMER =
  'Оценка только за работу. Запчасти считаются отдельно. Точная сумма — после диагностики.';

export async function initCalc(root = document) {
  const box = root.querySelector('[data-calc]');
  if (!box) return;

  const serviceEl = box.querySelector('[data-calc-service]');
  const classEl = box.querySelector('[data-calc-class]');
  const outEl = box.querySelector('[data-calc-out]');
  const sendEl = box.querySelector('[data-calc-send]');
  if (!serviceEl || !outEl) return;

  if (!outEl.hasAttribute('role')) outEl.setAttribute('role', 'status');
  if (!outEl.hasAttribute('aria-live')) outEl.setAttribute('aria-live', 'polite');

  let items = [];
  try {
    const res = await fetch(PRICES_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    items = (data.items || []).filter((i) => i.popular && i.from > 0);
  } catch {
    outEl.textContent = `Не удалось загрузить прайс. Позвоните нам: ${PHONES.booking.display} — посчитаем сразу.`;
    return;
  }
  if (!items.length) return;

  // Список услуг: только популярные позиции с ненулевой ценой.
  if (serviceEl.options.length === 0 || serviceEl.dataset.autofill !== undefined) {
    serviceEl.textContent = '';
    const ph = new Option('Выберите услугу', '');
    ph.disabled = true;
    ph.selected = true;
    serviceEl.add(ph);
    for (const it of items) {
      const o = new Option(`${it.name} — ${money(it.from)}`, it.id);
      serviceEl.add(o);
    }
  }

  // Классы авто с множителями.
  if (classEl && (classEl.options.length === 0 || classEl.dataset.autofill !== undefined)) {
    classEl.textContent = '';
    for (const c of CAR_CLASSES) {
      const label = c.k === 1 ? c.label : `${c.label} ×${c.k}`;
      classEl.add(new Option(label, c.id));
    }
  }

  const currentClass = () => CAR_CLASSES.find((c) => c.id === classEl?.value) || CAR_CLASSES[0];
  const currentItem = () => items.find((i) => i.id === serviceEl.value) || null;

  let last = null;

  function calc() {
    const it = currentItem();
    if (!it) {
      outEl.textContent = 'Выберите услугу — покажем ориентировочную вилку цены.';
      last = null;
      return;
    }
    const cls = currentClass();
    const low = round100(it.from * cls.k);
    const high = round100(low * UPPER_K);
    last = { it, cls, low, high };

    outEl.innerHTML =
      `<p class="calc__range"><strong>от${NBSP}${money(low)} до ${money(high)}</strong></p>` +
      `<p class="calc__what">${it.name} · ${cls.label}${it.est ? ' · оценка по нормочасу' : ''}</p>` +
      `<p class="calc__note">${DISCLAIMER}</p>`;

    goalOnce(GOALS.CALC_USE, { place: placeOf(box) });
  }

  serviceEl.addEventListener('change', calc);
  classEl?.addEventListener('change', calc);
  calc();

  sendEl?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!last) {
      serviceEl.focus();
      return;
    }
    const text = composeMessage([
      'Расчёт с калькулятора на сайте',
      `Услуга: ${last.it.name}`,
      `Класс авто: ${last.cls.label}`,
      `Ориентир по работе: от ${money(last.low)} до ${money(last.high)}`,
      DISCLAIMER,
      '',
      'Авто (марка, модель, год): ',
      '',
      pageLine()
    ]);
    goal(GOALS.CALC_USE, { place: placeOf(box), action: 'send' });
    window.open(waLink(text), '_blank', 'noopener');
  });
}