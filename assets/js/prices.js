/**
 * prices.js — рендер и фильтрация прайса из assets/data/prices.json.
 * Поиск живой, с дебаунсом, дружелюбный к кириллице (ё = е).
 * Без JS страница обязана показывать <noscript>-таблицу — см. JS-CONTRACT.md.
 */
import { PRICES_URL, PHONES } from './config.js';
import { waLink } from './deeplinks.js';
import { watchPriceView } from './analytics.js';

const NBSP = '\u00A0';
const nf = new Intl.NumberFormat('ru-RU');

/** «от 1 200 ₽» с неразрывным пробелом перед ₽. 0 → «бесплатно». */
export function formatPrice(from) {
  if (from === 0) return 'бесплатно';
  return `от${NBSP}${nf.format(from).replace(/\s/g, NBSP)}${NBSP}₽`;
}

/** Нормализация для поиска: регистр, ё/е, лишние пробелы. */
const norm = (s) =>
  String(s ?? '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Подсветка совпадения. Ищем по нормализованной строке, режем исходную. */
function highlight(text, query) {
  const src = String(text ?? '');
  if (!query) return escapeHtml(src);
  const i = norm(src).indexOf(query);
  if (i < 0) return escapeHtml(src);
  return (
    escapeHtml(src.slice(0, i)) +
    `<mark>${escapeHtml(src.slice(i, i + query.length))}</mark>` +
    escapeHtml(src.slice(i + query.length))
  );
}

const debounce = (fn, ms) => {
  let t = 0;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

/** Начальный фильтр из ?cat=... или #cat-... */
function initialCat(valid) {
  const fromQuery = new URLSearchParams(location.search).get('cat');
  const hash = location.hash.startsWith('#cat-') ? location.hash.slice(5) : '';
  const want = (fromQuery || hash || '').trim();
  return want && valid.has(want) ? want : 'all';
}

export async function initPrices(root = document) {
  const table = root.querySelector('[data-price-table]');
  if (!table) return;

  const search = root.querySelector('[data-price-search]');
  const catBox = root.querySelector('[data-price-cat]');
  const empty = root.querySelector('[data-price-empty]');
  const countEl = root.querySelector('[data-price-count]');

  let data;
  try {
    const res = await fetch(PRICES_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    data = await res.json();
  } catch {
    table.innerHTML =
      `<p class="prices__error" role="status">Не удалось загрузить прайс-лист. ` +
      `Позвоните нам — назовём цену сразу: ` +
      `<a href="${PHONES.booking.tel}">${escapeHtml(PHONES.booking.display)}</a>.</p>`;
    return;
  }

  const cats = Array.isArray(data.categories) ? data.categories : [];
  const items = Array.isArray(data.items) ? data.items : [];
  const titleOf = new Map(cats.map((c) => [c.id, c.title]));
  const valid = new Set(cats.map((c) => c.id));

  // Индекс для поиска: имя + категория + примечание.
  const index = new Map(items.map((it) => [it, norm(`${it.name} ${titleOf.get(it.cat) || ''} ${it.note || ''}`)]));

  let activeCat = initialCat(valid);
  let query = '';

  buildCatButtons();
  render();

  if (search) {
    search.addEventListener(
      'input',
      debounce(() => {
        query = norm(search.value);
        render();
      }, 120)
    );
  }

  function buildCatButtons() {
    if (!catBox) return;
    const existing = catBox.querySelectorAll('[data-cat]');
    if (!existing.length) {
      const frag = document.createDocumentFragment();
      frag.append(makeBtn('all', 'Все услуги'));
      for (const c of cats) frag.append(makeBtn(c.id, c.title));
      catBox.append(frag);
    }
    catBox.addEventListener('click', (e) => {
      const btn = e.target instanceof Element ? e.target.closest('[data-cat]') : null;
      if (!btn) return;
      e.preventDefault();
      activeCat = btn.dataset.cat || 'all';
      syncCatButtons();
      render();
    });
    syncCatButtons();
  }

  function makeBtn(id, label) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'prices__cat';
    b.dataset.cat = id;
    b.textContent = label;
    return b;
  }

  function syncCatButtons() {
    for (const b of catBox?.querySelectorAll('[data-cat]') || []) {
      const on = (b.dataset.cat || 'all') === activeCat;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('is-active', on);
    }
  }

  function match(it) {
    if (activeCat !== 'all' && it.cat !== activeCat) return false;
    if (!query) return true;

    const hay = index.get(it) || '';
    if (hay.includes(query)) return true;

        // Русские окончания: ищут «колодки», в прайсе «колодок». Сравниваем
    // по основе слова, отсекая до трёх последних букв. Порог в пять
    // знаков отсекает ложные совпадения на коротких словах.
    if (query.length >= 5) {
      for (let cut = 1; cut <= 3 && query.length - cut >= 4; cut++) {
        if (hay.includes(query.slice(0, -cut))) return true;
      }
    }
    return false;
  }

  function rowHtml(it) {
    const price = formatPrice(it.from);
    const unit = it.unit && it.unit !== 'работа' ? `<span class="prices__unit">за ${escapeHtml(it.unit)}</span>` : '';
    const est = it.est
      ? `<span class="prices__est" title="Расчёт по нормочасу и трудоёмкости. Точная сумма — после диагностики">оценка</span>`
      : '';
    const note = it.note ? `<span class="prices__note">${highlight(it.note, query)}</span>` : '';
    const ask = waLink(`Здравствуйте! Пишу с сайта 100mashin.ru. Вопрос по услуге «${it.name}» (${price}). Авто: `);
    return `<tr class="prices__row" data-item="${escapeHtml(it.id)}">
      <th scope="row" class="prices__name">${highlight(it.name, query)} ${est}${note}</th>
      <td class="prices__price">${price} ${unit}</td>
      <td class="prices__ask"><a href="${ask}" target="_blank" rel="noopener" data-goal="WHATSAPP_CLICK">Уточнить</a></td>
    </tr>`;
  }

  function render() {
    const shown = items.filter(match);

    if (countEl) {
      countEl.textContent = shown.length === items.length
        ? `${items.length} позиций в прайсе`
        : `Показано ${shown.length} из ${items.length}`;
    }

    if (!shown.length) {
      table.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    // Группировка по категориям, порядок — как в prices.json.
    const groups = cats
      .map((c) => ({ cat: c, list: shown.filter((it) => it.cat === c.id) }))
      .filter((g) => g.list.length);

    const mid = Math.floor(groups.length / 2);

    /*
     * Категории свёрнуты в <details>: сто пятьдесят позиций разом искать
     * неудобно. Открыта первая группа, а при поиске или выбранной
     * категории — все, чтобы результат был виден сразу.
     */
    const openAll = Boolean(query) || activeCat !== 'all';

    table.innerHTML = groups
      .map(
        (g, i) => `<details class="prices__group" id="cat-${escapeHtml(g.cat.id)}"${
          i === mid ? ' data-price-mid' : ''
        }${openAll || i === 0 ? ' open' : ''}>
        <summary class="prices__group-title">
          <span>${escapeHtml(g.cat.title)}</span>
          <span class="prices__group-count">${g.list.length}</span>
        </summary>
        <table class="prices__table">
          <caption class="visually-hidden">${escapeHtml(g.cat.title)}: цены на работы</caption>
          <thead><tr><th scope="col">Услуга</th><th scope="col">Цена</th><th scope="col">Запись</th></tr></thead>
          <tbody>${g.list.map(rowHtml).join('')}</tbody>
        </table>
      </details>`
      )
      .join('');

    // Разметка появилась только сейчас — просим аналитику её отследить.
    watchPriceView(table);
  }
}