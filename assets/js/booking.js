/**
 * booking.js — квази-онлайн-запись без бэкенда.
 * Форма помогает выбрать реальный свободный день и время, собирает аккуратную
 * заявку и отправляет её в WhatsApp. Плюс дублирует текст в скрытое поле
 * message — если форма ещё и подключена к Web3Forms, заявка уйдёт и на почту.
 */
import { SLOTS, PHONES, WEB3FORMS_KEY, WEB3FORMS_PLACEHOLDER } from './config.js';
import { waLink, composeMessage, pageLine } from './deeplinks.js';
import { goal, GOALS, placeOf } from './analytics.js';

/** Ключ Web3Forms настроен — значит заявку можно отправить и на почту. */
const hasMailChannel = () => WEB3FORMS_KEY !== WEB3FORMS_PLACEHOLDER;

const NOTICE = {
  sunday: 'В воскресенье мы не работаем. Выберите другой день.',
  saturday: 'В субботу работаем до 18:00. Выберите время из списка.',
  needDate: 'Выберите дату визита.',
  pastDate: 'Эта дата уже прошла. Выберите сегодняшний день или позже.',
  lateDate: 'Запись доступна на ближайшие 60 дней. Выберите более раннюю дату.',
  needTime: 'Выберите время.',
  needService: 'Выберите услугу.',
  needPhone: `Укажите телефон для подтверждения — или позвоните нам: ${PHONES.booking.display}.`,
  badPhone: 'Проверьте номер телефона: нужно 11 цифр, например +7 (900) 000-00-00.',
  needConsent: 'Без согласия на обработку данных мы не сможем принять заявку.',
  ok: 'Открываем WhatsApp с готовой заявкой. Отправьте сообщение — мы подтвердим время.'
};

const pad = (n) => String(n).padStart(2, '0');
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** 'YYYY-MM-DD' → локальная дата (без сдвига часового пояса). */
function parseISO(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const minToTime = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;
const timeToMin = (t) => {
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + (m || 0);
};

/** Слоты с шагом 30 минут для конкретного дня недели. */
export function slotsFor(date) {
  const day = date?.getDay?.();
  if (day === 0) return [];
  const range = day === 6 ? SLOTS.saturday : SLOTS.weekday;
  const out = [];
  for (let t = timeToMin(range.from); t <= timeToMin(range.to); t += SLOTS.stepMin) out.push(minToTime(t));
  return out;
}

const field = (form, name) => form.querySelector(`[name="${name}"]`);

function notice(box, text, tone) {
  if (!box) return;
  box.textContent = text || '';
  box.hidden = !text;
  if (tone) box.setAttribute('data-tone', tone);
  else box.removeAttribute('data-tone');
}

/**
 * Заполняет <select> слотами времени. Трогаем только пустой список
 * или помеченный data-autofill.
 *
 * Подсказка в первой опции зависит от состояния: пока даты нет, после
 * выбора рабочего дня и для выходного текст разный.
 */
function fillTimes(select, date) {
  if (!select) return;
  const may = select.dataset.autofill !== undefined || select.options.length === 0 ||
    (select.options.length === 1 && !select.options[0].value);
  if (!may) return;

  const keep = select.value;
  const list = slotsFor(date);

  let hint;
  if (!date) hint = 'Сначала выберите дату';
  else if (!list.length) hint = 'Воскресенье — выходной, выберите другой день';
  else hint = 'Выберите удобное время';

  select.textContent = '';
  const ph = new Option(hint, '');
  ph.disabled = true;
  ph.selected = true;
  select.add(ph);
  for (const t of list) select.add(new Option(t, t));

  // Выбор пользователя сохраняем, если он есть в новом наборе слотов.
  if (keep && list.includes(keep)) select.value = keep;

    // Пока выбирать нечего, поле неактивно.
  select.disabled = !date || !list.length;
}

/**
 * Заполнена ли ловушка для ботов. У checkbox value равен "on" независимо
 * от состояния, поэтому для него смотрим checked.
 */
function isBotTrapFilled(el) {
  if (!el) return false;
  return el.type === 'checkbox' || el.type === 'radio'
    ? el.checked
    : Boolean(el.value?.trim());
}

const digitsOf = (s) => String(s || '').replace(/\D+/g, '');
const phoneOk = (s) => {
  const d = digitsOf(s);
  return d.length === 11 || d.length === 10;
};

export function initBooking(root = document) {
  const forms = root.querySelectorAll('[data-booking]');
  if (!forms.length) return;

  for (const form of forms) initOne(form);
}

function initOne(form) {
  const dateEl = field(form, 'date');
  const timeEl = field(form, 'time');
  const btn = form.querySelector('[data-booking-send]');
  const status = form.querySelector('[data-status]');
  const noteBox = form.querySelector('[data-booking-note]') || status;

  // Границы даты: сегодня … сегодня + 60 дней.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + SLOTS.maxDaysAhead);
  if (dateEl) {
    dateEl.min = toISO(today);
    dateEl.max = toISO(maxDate);
  }

  function onDate({ clearInvalid = false } = {}) {
    const d = parseISO(dateEl?.value);
    if (!d) {
      notice(noteBox, '', null);
      fillTimes(timeEl, null);
      return;
    }
    if (d < today) {
      notice(noteBox, NOTICE.pastDate, 'error');
      fillTimes(timeEl, null);
      if (clearInvalid && dateEl) dateEl.value = '';
      return;
    }
    if (d > maxDate) {
      notice(noteBox, NOTICE.lateDate, 'error');
      fillTimes(timeEl, null);
      if (clearInvalid && dateEl) dateEl.value = '';
      return;
    }
    const day = d.getDay();
    if (day === 0) notice(noteBox, NOTICE.sunday, 'error');
    else if (day === 6) notice(noteBox, NOTICE.saturday, 'info');
    else notice(noteBox, '', null);
    fillTimes(timeEl, d);
  }

  if (dateEl) {
    dateEl.addEventListener('input', () => onDate());
    dateEl.addEventListener('change', () => onDate({ clearInvalid: true }));
  }
    // Без даты передаём null: список слотов на сегодня к выбранной дате
  // может не относиться.
  fillTimes(timeEl, parseISO(dateEl?.value));
  if (dateEl?.value) onDate();

  const compose = () => {
    const get = (n) => field(form, n)?.value?.trim() || '';
    const lines = [
      'Заявка на запись',
      `Дата: ${get('date')}`,
      `Время: ${get('time')}`,
      `Услуга: ${get('service')}`,
      get('car') ? `Авто: ${get('car')}` : '',
      get('name') ? `Имя: ${get('name')}` : '',
      `Телефон: ${get('phone')}`,
      get('comment') ? `Комментарий: ${get('comment')}` : '',
      '',
      pageLine()
    ];
    return composeMessage(lines);
  };

  function send() {
        // Первой проверкой и молча: бот не должен узнать, какие поля
    // исправить.
    if (isBotTrapFilled(field(form, 'botcheck'))) return;

    const d = parseISO(dateEl?.value);
    const time = field(form, 'time')?.value?.trim();
    const service = field(form, 'service')?.value?.trim();
    const phone = field(form, 'phone')?.value?.trim();

    if (!d) return fail(dateEl, NOTICE.needDate);
    // Атрибут min не мешает ввести дату вручную, поэтому прошедший день
    // отсекаем явной проверкой.
    const today0 = new Date();
    today0.setHours(0, 0, 0, 0);
    if (d < today0) return fail(dateEl, NOTICE.pastDate);
    const latest = new Date(today0);
    latest.setDate(latest.getDate() + SLOTS.maxDaysAhead);
    if (d > latest) return fail(dateEl, NOTICE.lateDate);
    if (d.getDay() === 0) return fail(dateEl, NOTICE.sunday);
    if (!time) return fail(field(form, 'time'), NOTICE.needTime);
    if (!service) return fail(field(form, 'service'), NOTICE.needService);
    if (!phone) return fail(field(form, 'phone'), NOTICE.needPhone);
    if (!phoneOk(phone)) return fail(field(form, 'phone'), NOTICE.badPhone);

    // Согласие на обработку персональных данных, если чекбокс есть в форме.
    const consent = field(form, 'consent');
    if (consent && consent.type === 'checkbox' && !consent.checked) {
      return fail(consent, NOTICE.needConsent);
    }

    for (const el of [
      dateEl,
      field(form, 'time'),
      field(form, 'service'),
      field(form, 'phone'),
      consent
    ]) {
      el?.classList.remove('is-invalid');
      el?.removeAttribute('aria-invalid');
    }

    const text = compose();
        // Через это поле form.js отправит тот же текст на почту, если ключ
    // Web3Forms настроен.
    const hidden = field(form, 'message');
    if (hidden) hidden.value = text;

    notice(status, NOTICE.ok, 'success');
    goal(GOALS.BOOKING_SEND, { place: placeOf(form) });
    window.open(waLink(text), '_blank', 'noopener');

        // Только при заданном ключе: иначе form.js откроет WhatsApp повторно.
    if (hasMailChannel() && form.hasAttribute('data-form')) {
      form.requestSubmit?.();
    }
  }

  function fail(el, text) {
    notice(status, text, 'error');
    if (el) {
      el.classList.add('is-invalid');
      el.setAttribute('aria-invalid', 'true');
      el.focus?.();
    }
  }

  btn?.addEventListener('click', (e) => {
    e.preventDefault();
    send();
  });
  // Enter внутри формы не должен приводить к «пустой» отправке.
  form.addEventListener('submit', (e) => {
    if (form.hasAttribute('data-form')) return; // формой занимается form.js
    e.preventDefault();
    send();
  });
}
