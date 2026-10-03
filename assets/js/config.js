/**
 * config.js — единственный источник правды по бизнес-данным.
 * Правим данные только здесь: остальные модули ничего не хардкодят.
 */

export const SITE = 'https://100mashin.ru';
export const BRAND = '100 Машин';
export const CITY = 'Воронеж';

/** Нормочас — единая ставка на все марки, нал = безнал. */
export const NORMOCHAS = 1200;

/** Web3Forms access key. Пока заглушка — form.js работает в режиме WhatsApp. */
export const WEB3FORMS_PLACEHOLDER = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';
export const WEB3FORMS_KEY = 'REPLACE_WITH_WEB3FORMS_ACCESS_KEY';
export const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

/**
 * Номер счётчика Яндекс.Метрики.
 * 0 = трекинг выключен полностью и безопасно: analytics.js превращается в no-op,
 * никаких сетевых запросов и никаких ошибок в консоли.
 * Ставим реальный числовой ID после регистрации счётчика.
 */
export const METRIKA_ID = 0;

/** true только если счётчик задан И скрипт Метрики реально загрузился. */
export const hasMetrika = () =>
  METRIKA_ID > 0 && typeof window !== 'undefined' && typeof window.ym === 'function';

/** WhatsApp привязан к номеру на Димитрова, 138. */
export const WA_NUMBER = '79204450002';

/** ВАЖНО: аккаунта в Telegram у сервиса нет. Ссылки t.me не создаём нигде. */
export const HAS_TELEGRAM = false;

export const EMAIL = 'autolaw@inbox.ru';

export const PHONES = {
  truda: { display: '+7 (906) 680-00-01', tel: 'tel:+79066800001', label: 'просп. Труда, 46И' },
  dimitrova: { display: '+7 (920) 445-00-02', tel: 'tel:+79204450002', label: 'ул. Димитрова, 138' },
  booking: { display: '+7 (920) 448-00-04', tel: 'tel:+79204480004', label: 'Запись на ремонт' },
  parts: { display: '+7 (920) 446-00-03', tel: 'tel:+79204460003', label: 'Запчасти' },
  shop: { display: '+7 (910) 283-30-30', tel: 'tel:+79102833030', label: 'Магазин' }
};

export const POINTS = [
  {
    id: 'truda',
    title: 'просп. Труда, 46И',
    district: 'Коминтерновский район',
    zip: '394026',
    phone: PHONES.truda,
    coords: { lat: 51.681267, lon: 39.179218 },
    org: '100423631226'
  },
  {
    id: 'dimitrova',
    title: 'ул. Димитрова, 138',
    district: 'Левый берег, Машмет',
    zip: '394028',
    phone: PHONES.dimitrova,
    coords: { lat: 51.652736, lon: 39.294374 },
    org: '21684761945'
  }
];

/** Часы работы: Сб — только по предварительной записи, Вс — выходной. */
export const HOURS = {
  weekdays: { from: '09:00', to: '19:00', text: 'Пн–Пт 09:00–19:00' },
  saturday: { from: '09:00', to: '18:00', text: 'Сб 09:00–18:00' },
  sunday: { text: 'Вс — выходной' },
  full: 'Пн–Сб 09:00–19:00 · Вс выходной'
};

/** Слоты записи: будни 09:00–18:30, суббота до 17:30. */
export const SLOTS = {
  weekday: { from: '09:00', to: '18:30' },
  saturday: { from: '09:00', to: '17:30' },
  stepMin: 30,
  maxDaysAhead: 60
};

/**
 * Путь к прайсу — относительно самого модуля, чтобы работать и в корне
 * домена, и в подкаталоге (GitHub Pages), где пути от корня ломаются.
 */
export const PRICES_URL = new URL('../../assets/data/prices.json', import.meta.url).href;

/** Класс авто → множитель для калькулятора оценки. */
export const CAR_CLASSES = [
  { id: 'car', label: 'Легковая', k: 1 },
  { id: 'suv', label: 'Кроссовер / внедорожник', k: 1.15 },
  { id: 'lcv', label: 'Лёгкий коммерческий (ГАЗель, Ford Transit)', k: 1.2 },
  { id: 'truck', label: 'Грузовая', k: 1.5 }
];