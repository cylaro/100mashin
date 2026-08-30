/**
 * form.js — отправка форм [data-form] через Web3Forms, без бэкенда.
 *
 * РЕЖИМ WHATSAPP (важно):
 * пока WEB3FORMS_KEY равен заглушке, сетевой запрос НЕ выполняется вообще.
 * Заявка собирается в читаемое сообщение и открывается в WhatsApp.
 * Так сайт полностью рабочий ещё до регистрации ключа Web3Forms.
 * Как только в config.js появится настоящий ключ, модуль сам переключится
 * на обычный POST — менять разметку страниц не нужно.
 */
import { WEB3FORMS_KEY, WEB3FORMS_PLACEHOLDER, WEB3FORMS_URL, BRAND, PHONES } from './config.js';
import { waLink, composeMessage, pageLine } from './deeplinks.js';
import { goal, GOALS, placeOf } from './analytics.js';

const TIMEOUT_MS = 12_000;

const MSG = {
  required: 'Заполните это поле.',
  tel: 'Укажите телефон в формате +7 (900) 000-00-00.',
  email: 'Проверьте адрес электронной почты.',
  consent: 'Без согласия на обработку данных мы не сможем принять заявку.',
  select: 'Выберите вариант из списка.',
  short: 'Слишком короткое значение.',
  summaryOne: 'Проверьте одно поле — оно подсвечено.',
  summaryMany: (n) => `Проверьте поля: ${n}. Они подсвечены.`,
  pending: 'Отправляем заявку…',
  ok: 'Заявка отправлена. Мы позвоним в рабочее время: Пн–Пт 08:00–19:00.',
  rate: 'Слишком много попыток подряд. Подождите минуту или позвоните нам.',
  fail: `Не удалось отправить заявку. Позвоните нам: ${PHONES.booking.display} — или напишите в WhatsApp, данные из формы сохранены.`,
  waMode: 'Открываем WhatsApp с готовой заявкой. Если окно не появилось — разрешите всплывающие окна или напишите нам сами.'
};

/** Человеческое имя поля для сводки об ошибках. */
function fieldTitle(field) {
  const id = field.id;
  if (id) {
    const lab = field.form?.querySelector(`label[for="${CSS.escape(id)}"]`);
    const text = lab?.textContent?.replace(/\s+/g, ' ').replace(/\*/g, '').trim();
    if (text) return text.replace(/[:—-]\s*$/, '');
  }
  return field.getAttribute('aria-label') || field.name || 'поле';
}

/** Подбираем русское сообщение под тип поля и вид ошибки. */
function messageFor(field) {
  const v = field.validity;
  if (field.type === 'checkbox') return MSG.consent;
  if (v.valueMissing) return MSG.required;
  if (v.patternMismatch || field.type === 'tel') return MSG.tel;
  if (v.typeMismatch && field.type === 'email') return MSG.email;
  if (v.tooShort) return MSG.short;
  if (field.tagName === 'SELECT') return MSG.select;
  return field.validationMessage || MSG.required;
}

const errorBox = (field) => (field.id ? field.form?.querySelector(`#${CSS.escape(`${field.id}-err`)}`) : null);

function showError(field, text) {
  field.classList.add('is-invalid');
  field.setAttribute('aria-invalid', 'true');
  const box = errorBox(field);
  if (box) {
    box.textContent = text;
    box.hidden = false;
    if (field.id && !field.getAttribute('aria-describedby')?.includes(box.id)) {
      const prev = field.getAttribute('aria-describedby');
      field.setAttribute('aria-describedby', prev ? `${prev} ${box.id}` : box.id);
    }
  }
}

function clearError(field) {
  field.classList.remove('is-invalid');
  field.removeAttribute('aria-invalid');
  const box = errorBox(field);
  if (box) {
    box.textContent = '';
    box.hidden = true;
  }
}

function setStatus(form, text, tone) {
  const el = form.querySelector('[data-status]');
  if (!el) return;
  el.textContent = text;
  if (tone) el.setAttribute('data-tone', tone);
  else el.removeAttribute('data-tone');
  if (!el.hasAttribute('role')) el.setAttribute('role', 'status');
  if (!el.hasAttribute('aria-live')) el.setAttribute('aria-live', 'polite');
  el.hidden = false;
}

const showFallback = (form) => {
  const fb = form.querySelector('[data-fallback]');
  if (fb) fb.hidden = false;
};

/**
 * Значение ловушки в том виде, в каком его ждёт Web3Forms: непустая
 * строка означает спам. Для checkbox смотрим checked — value у него
 * всегда "on".
 */
function botTrapValue(form) {
  const el = form.elements.botcheck;
  if (!el) return '';
  if (el.type === 'checkbox' || el.type === 'radio') return el.checked ? 'on' : '';
  return el.value?.trim() || '';
}

/** Поля, которые реально нужно валидировать и отправлять. */
const controls = (form) =>
  Array.from(form.elements).filter(
    (el) =>
      el.name &&
      el.name !== 'botcheck' &&
      !el.disabled &&
      !['submit', 'button', 'reset', 'file'].includes(el.type)
  );

/** Нативная валидация + русские сообщения. @returns {boolean} */
function validate(form) {
  const bad = [];
  for (const el of controls(form)) {
    clearError(el);
    if (typeof el.checkValidity === 'function' && !el.checkValidity()) {
      showError(el, messageFor(el));
      bad.push(el);
    }
  }
  if (!bad.length) {
    setStatus(form, '', null);
    return true;
  }
  const names = bad.map(fieldTitle).join(', ');
  setStatus(form, bad.length === 1 ? MSG.summaryOne : MSG.summaryMany(names), 'error');
  bad[0].focus?.({ preventScroll: false });
  return false;
}

/** Собираем значения формы в плоский объект. */
function collect(form) {
  const data = {};
  for (const el of controls(form)) {
    if (el.type === 'checkbox') {
      data[el.name] = el.checked ? 'да' : 'нет';
    } else if (el.type === 'radio') {
      if (el.checked) data[el.name] = el.value;
    } else if (el.value?.trim()) {
      data[el.name] = el.value.trim();
    }
  }
  return data;
}

/** Читаемая строка про согласие — уходит в письмо вместе с заявкой. */
function consentLine(form) {
  const box = Array.from(form.elements).find((el) => el.type === 'checkbox' && /consent|agree|soglas/i.test(el.name || ''));
  if (!box) return 'Согласие на обработку персональных данных: не запрашивалось на этой форме.';
  return box.checked
    ? 'Пользователь подтвердил согласие на обработку персональных данных (галочка в форме на сайте).'
    : 'Согласие на обработку персональных данных НЕ подтверждено.';
}

/**
 * Заявка в виде читаемого текста для WhatsApp.
 * Подписи берём из <label>, поэтому в сообщении «Телефон», а не «phone».
 */
function asText(form) {
  const subject = form.dataset.subject || `Заявка с сайта ${BRAND}`;
  const lines = [subject, ''];
  let message = '';

  for (const el of controls(form)) {
    if (el.type === 'radio' && !el.checked) continue;
    if (el.type === 'checkbox') continue;
    const value = el.value?.trim();
    if (!value) continue;
    if (el.name === 'message' || el.tagName === 'TEXTAREA') {
      message = value;
      continue;
    }
    lines.push(`${fieldTitle(el)}: ${value}`);
  }

  if (message) lines.push('', `Комментарий: ${message}`);
  lines.push('', pageLine());
  return composeMessage(lines);
}

function lock(form, on) {
  const btn = form.querySelector('[data-submit]');
  if (!btn) return;
  btn.disabled = on;
  btn.setAttribute('aria-busy', on ? 'true' : 'false');
}

async function send(form) {
  const data = collect(form);
  const payload = {
    access_key: WEB3FORMS_KEY,
    subject: form.dataset.subject || `Заявка с сайта ${BRAND}`,
    from_name: form.dataset.fromName || BRAND,
    ...data,
    page: location.href,
    consent: consentLine(form),
        botcheck: botTrapValue(form)
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    if (res.status === 200) return { ok: true };
    if (res.status === 429) return { ok: false, rate: true };
    return { ok: false };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

function onSubmit(e) {
  const form = e.currentTarget;
  e.preventDefault();
  if (form.dataset.busy === '1') return;
  if (!validate(form)) return;

  // Режим WhatsApp: ключа нет — сеть не трогаем, уходим в мессенджер.
  if (WEB3FORMS_KEY === WEB3FORMS_PLACEHOLDER) {
    const text = asText(form);
    setStatus(form, MSG.waMode, 'success');
    showFallback(form);
    goal(GOALS.FORM_SUBMIT, { place: placeOf(form), via: 'whatsapp' });
    window.open(waLink(text), '_blank', 'noopener');
    return;
  }

  form.dataset.busy = '1';
  lock(form, true);
  setStatus(form, MSG.pending, 'pending');

  send(form)
    .then((r) => {
      if (r.ok) {
        setStatus(form, MSG.ok, 'success');
        form.reset();
        goal(GOALS.FORM_SUBMIT, { place: placeOf(form), via: 'web3forms' });
        return;
      }
      // Данные пользователя не сбрасываем — он сможет повторить отправку.
      setStatus(form, r.rate ? MSG.rate : MSG.fail, 'error');
      if (!r.rate) showFallback(form);
    })
    .finally(() => {
      form.dataset.busy = '0';
      lock(form, false);
    });
}

export function initForms(root = document) {
  const forms = root.querySelectorAll('[data-form]');
  if (!forms.length) return;

  for (const form of forms) {
    // Свои сообщения вместо браузерных подсказок.
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', onSubmit);
    // Ошибку с поля снимаем сразу, как только человек начал исправлять.
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t instanceof Element && t.classList.contains('is-invalid')) clearError(t);
    });
    const fb = form.querySelector('[data-fallback]');
    if (fb && !fb.hasAttribute('hidden')) fb.hidden = true;
  }
}