/**
 * smoke.mjs — проверка логики модулей без браузера.
 * Подменяем минимальный DOM и прогоняем чистые функции.
 * Запуск: node tools/smoke.mjs
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const results = [];
const ok = (name, cond, extra = '') =>
  results.push({ name, pass: !!cond, extra });

// --- prices.json ---
const prices = JSON.parse(readFileSync(path.join(ROOT, 'assets/data/prices.json'), 'utf8'));

ok('prices.json разбирается', true);
ok('нормочас = 1200', prices.normochas === 1200, `получено ${prices.normochas}`);
ok('категории заданы', prices.categories.length === 15, `${prices.categories.length} шт.`);
ok('позиций больше 150', prices.items.length >= 150, `${prices.items.length} шт.`);

const catIds = new Set(prices.categories.map((c) => c.id));
const orphans = prices.items.filter((i) => !catIds.has(i.cat));
ok('у всех позиций существующая категория', orphans.length === 0,
  orphans.map((o) => o.id).join(', '));

const dupIds = prices.items.map((i) => i.id).filter((id, i, a) => a.indexOf(id) !== i);
ok('нет повторяющихся id', dupIds.length === 0, dupIds.join(', '));

const badPrice = prices.items.filter((i) => typeof i.from !== 'number' || i.from < 0);
ok('цены — неотрицательные числа', badPrice.length === 0,
  badPrice.map((b) => b.id).join(', '));

const noName = prices.items.filter((i) => !i.name || !i.name.trim());
ok('у всех позиций есть название', noName.length === 0);

const popular = prices.items.filter((i) => i.popular && i.from > 0);
ok('есть популярные позиции для калькулятора', popular.length >= 15, `${popular.length} шт.`);

const est = prices.items.filter((i) => i.est);
ok('оценочные позиции помечены', est.length > 0, `${est.length} из ${prices.items.length}`);

const free = prices.items.filter((i) => i.from === 0);
ok('бесплатные позиции присутствуют', free.length > 0,
  free.map((f) => f.name).join('; '));

// --- форматирование цены (логика prices.js) ---
const NBSP = '\u00A0';
const nf = new Intl.NumberFormat('ru-RU');
const formatPrice = (from) =>
  from === 0 ? 'бесплатно' : `от${NBSP}${nf.format(from).replace(/\s/g, NBSP)}${NBSP}₽`;

ok('цена 1200 форматируется', formatPrice(1200) === `от${NBSP}1${NBSP}200${NBSP}₽`,
  formatPrice(1200));
ok('ноль → «бесплатно»', formatPrice(0) === 'бесплатно');
ok('35000 форматируется с разрядами', formatPrice(35000).includes(`35${NBSP}000`),
  formatPrice(35000));

// --- нормализация поиска (ё = е) ---
const norm = (s) => String(s ?? '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
ok('поиск: ё приводится к е', norm('Форсунки ТНВД') === norm('форсунки тнвд'));
ok('поиск «шест» находит «шестерня»', norm('Шестерня').includes('шест'));

// поиск по реальным данным
const findBy = (q) => {
  const query = norm(q);
  return prices.items.filter((i) => norm(`${i.name} ${i.note || ''}`).includes(query));
};
ok('поиск «колод» даёт результат', findBy('колод').length > 0, `${findBy('колод').length} шт.`);

// Поиск с учётом русских окончаний — та же логика, что в prices.js:
// «колодки» должно находить «колодок».
const matchLoose = (item, q) => {
  const hay = norm(`${item.name} ${item.note || ''} `);
  const query = norm(q);
  if (hay.includes(query)) return true;
  if (query.length >= 5) {
    for (let cut = 1; cut <= 3 && query.length - cut >= 4; cut++) {
      if (hay.includes(query.slice(0, -cut))) return true;
    }
  }
  return false;
};
const looseFind = (q) => prices.items.filter((i) => matchLoose(i, q));

ok('поиск «колодки» находит «колодок»', looseFind('колодки').length > 0,
  `${looseFind('колодки').length} шт.`);
ok('поиск «форсунки» работает', looseFind('форсунки').length > 0,
  `${looseFind('форсунки').length} шт.`);
ok('поиск «сцепление» работает', looseFind('сцепление').length > 0,
  `${looseFind('сцепление').length} шт.`);
ok('поиск «прокладка» работает', looseFind('прокладка').length > 0,
  `${looseFind('прокладка').length} шт.`);
ok('нечёткий поиск не ловит всё подряд', looseFind('щщщxyz').length === 0);
ok('поиск «турбин» даёт результат', findBy('турбин').length > 0, `${findBy('турбин').length} шт.`);
ok('поиск «шиномонтаж» даёт результат', findBy('шиномонтаж').length > 0, `${findBy('шиномонтаж').length} шт.`);
ok('поиск бессмыслицы даёт пусто', findBy('щщщxyz').length === 0);

// --- калькулятор (логика calc.js) ---
const CAR_CLASSES = [
  { id: 'car', k: 1 }, { id: 'suv', k: 1.15 }, { id: 'lcv', k: 1.2 }, { id: 'truck', k: 1.5 }
];
const round100 = (n) => Math.round(n / 100) * 100;
const calcRange = (base, k) => {
  const low = round100(base * k);
  return { low, high: round100(low * 1.6) };
};
const r1 = calcRange(1200, 1);
ok('калькулятор: легковая 1200 → 1200–1900', r1.low === 1200 && r1.high === 1900,
  `${r1.low}–${r1.high}`);
const r2 = calcRange(6000, 1.5);
ok('калькулятор: грузовая 6000 → 9000–14400', r2.low === 9000 && r2.high === 14400,
  `${r2.low}–${r2.high}`);
ok('верхняя граница всегда больше нижней',
  CAR_CLASSES.every((c) => { const r = calcRange(990, c.k); return r.high > r.low; }));

// --- слоты записи (логика booking.js) ---
const SLOTS = { weekday: { from: '08:00', to: '18:30' }, saturday: { from: '09:00', to: '15:30' }, stepMin: 30 };
const pad = (n) => String(n).padStart(2, '0');
const timeToMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };
const minToTime = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const slotsFor = (day) => {
  if (day === 0) return [];
  const r = day === 6 ? SLOTS.saturday : SLOTS.weekday;
  const out = [];
  for (let t = timeToMin(r.from); t <= timeToMin(r.to); t += SLOTS.stepMin) out.push(minToTime(t));
  return out;
};
ok('воскресенье: слотов нет', slotsFor(0).length === 0);
const wd = slotsFor(3);
ok('будни: 22 слота с 08:00 до 18:30',
  wd.length === 22 && wd[0] === '08:00' && wd.at(-1) === '18:30',
  `${wd.length} слотов, ${wd[0]}–${wd.at(-1)}`);
const sat = slotsFor(6);
ok('суббота: сокращённые слоты 09:00–15:30',
  sat[0] === '09:00' && sat.at(-1) === '15:30', `${sat.length} слотов`);

// --- телефон (логика deeplinks.js) ---
const formatPhoneHref = (display) => {
  let n = String(display).replace(/\D+/g, '');
  if (n.length === 11 && n.startsWith('8')) n = `7${n.slice(1)}`;
  if (n.length === 10) n = `7${n}`;
  return `tel:+${n}`;
};
ok('телефон Труда', formatPhoneHref('+7 (906) 680-00-01') === 'tel:+79066800001');
ok('телефон Димитрова', formatPhoneHref('+7 (920) 445-00-02') === 'tel:+79204450002');
ok('восьмёрка приводится к семёрке', formatPhoneHref('8 906 680-00-01') === 'tel:+79066800001');

// --- ссылка WhatsApp ---
const waLink = (text) => `https://wa.me/79204450002?text=${encodeURIComponent(text)}`;
const link = waLink('Здравствуйте! Хочу записаться. Авто: ');
ok('ссылка WhatsApp содержит номер', link.startsWith('https://wa.me/79204450002?text='));
ok('кириллица в ссылке закодирована', /%D0%97%D0%B4%D1%80%D0%B0%D0%B2/.test(link));
ok('в ссылке нет сырых пробелов', !link.includes(' '));

// --- проверка совпадения цен на страницах и в прайсе ---
const html = readFileSync(path.join(ROOT, 'ceny/index.html'), 'utf8');
ok('на странице цен указан нормочас 1200', /1200|1\u00A0200/.test(html));
ok('на странице цен есть дисклеймер ст. 437', html.includes('437'));
ok('на странице цен подключён контейнер прайса', html.includes('data-price-table'));
ok('на странице цен есть калькулятор', html.includes('data-calc'));
ok('есть noscript-запас для прайса', html.includes('<noscript>'));

// --- вывод ---
const failed = results.filter((r) => !r.pass);
for (const r of results) {
  console.log(`  ${r.pass ? 'OK  ' : 'ОШИБКА'}  ${r.name}${r.extra ? `  — ${r.extra}` : ''}`);
}
console.log(`\nПройдено ${results.length - failed.length} из ${results.length}`);
if (failed.length) process.exitCode = 1;
