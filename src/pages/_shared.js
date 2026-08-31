/**
 * shared.js — данные и повторяющиеся блоки разметки для страниц.
 * Здесь только проверенные факты о сервисе. Ничего не выдумываем:
 * если данных нет, блок просто не выводим.
 */

export const SITE = 'https://100mashin.ru';
export const NORMOCHAS = 1200;

export const PHONE = {
  truda: { display: '+7 (906) 680-00-01', tel: 'tel:+79066800001' },
  dimitrova: { display: '+7 (920) 445-00-02', tel: 'tel:+79204450002' },
  booking: { display: '+7 (920) 448-00-04', tel: 'tel:+79204480004' },
  parts: { display: '+7 (920) 446-00-03', tel: 'tel:+79204460003' },
  shop: { display: '+7 (910) 283-30-30', tel: 'tel:+79102833030' }
};

export const ORG = { truda: '100423631226', dimitrova: '21684761945' };

export const COORDS = {
  truda: { lat: 51.681267, lon: 39.179218 },
  dimitrova: { lat: 51.652736, lon: 39.294374 }
};

/** Ссылка на маршрут в Яндекс.Картах. */
export const route = (p) =>
  `https://yandex.ru/maps/?rtext=~${p.lat}%2C${p.lon}&rtt=auto`;

/**
 * Атрибуты для ссылки WhatsApp. Сам href собирает deeplinks.js
 * по data-wa-text.
 */
export const wa = (text) =>
  `data-wa data-wa-text="${text.replace(/"/g, '&quot;')}"`;

/* ==========================================================================
   Правая колонка первого экрана: короткая выжимка того, что важно знать
   на этой странице.
   ========================================================================== */

/**
 * @param {object} o
 * @param {string} o.label   надзаголовок карточки
 * @param {string} o.title   крупная строка (цифра, срок, тезис)
 * @param {string} [o.note]  пояснение под заголовком
 * @param {string[]} o.items короткий список фактов
 * @param {string} [o.foot]  нижняя строка, часто со ссылкой
 */
export function heroAside({ label, title, note = '', items = [], foot = '' }) {
  const list = items.length
    ? `          <ul class="hero-card__list" role="list">
${items.map((i) => `            <li>${i}</li>`).join('\n')}
          </ul>`
    : '';

  return `        <div class="hero-card">
          <div class="hero-rate hero-rate--text">
            <span class="hero-rate__label">${label}</span>
            <p class="hero-rate__headline">${title}</p>
${note ? `            <p class="hero-rate__note">${note}</p>` : ''}
          </div>
${list}
${foot ? `          <p class="hero-card__foot">${foot}</p>` : ''}
        </div>`;
}
/* ==========================================================================
   Микроразметка
   ========================================================================== */

/**
 * Организация с двумя точками.
 *
 * aggregateRating не размечаем: Google запрещает собственную разметку
 * отзывов в LocalBusiness, а переносить рейтинг Яндекса в свою разметку
 * нельзя. Рейтинг показывает виджет Яндекса.
 */
export function orgJsonLd() {
  const hours = [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '19:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '00:00',
      closes: '00:00'
    }
  ];

  const common = {
    image: `${SITE}/assets/img/og-cover.jpg`,
    priceRange: '₽₽',
    currenciesAccepted: 'RUB',
    paymentAccepted: 'Наличные, банковская карта, СБП, безналичный расчёт',
    areaServed: [
      { '@type': 'City', name: 'Воронеж' },
      { '@type': 'AdministrativeArea', name: 'Воронежская область' }
    ],
    openingHoursSpecification: hours,
    parentOrganization: { '@id': `${SITE}/#organization` }
  };

  const graph = [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'Автосервис «100 Машин»',
      alternateName: ['СТО Машин', '100 Машин Воронеж'],
      legalName: 'ООО «СТО МАШИН»',
      url: `${SITE}/`,
      email: 'autolaw@inbox.ru',
      telephone: '+7-906-680-00-01',
      vatID: '3666230820',
      taxID: '3666230820',
      foundingDate: '2018-09-27',
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE}/#logo`,
        url: `${SITE}/assets/img/logo-512.png`,
        width: 512,
        height: 512
      },
      sameAs: [
        'https://vk.com/avto100mashin',
        `https://yandex.ru/maps/org/${ORG.truda}/`,
        `https://yandex.ru/maps/org/${ORG.dimitrova}/`
      ]
    },
    {
      '@type': 'AutoRepair',
      '@id': `${SITE}/#truda`,
      name: 'Автосервис «100 Машин» — просп. Труда, 46И',
      url: `${SITE}/kontakty/`,
      telephone: '+7-906-680-00-01',
      hasMap: `https://yandex.ru/maps/org/${ORG.truda}/`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'просп. Труда, 46И',
        addressLocality: 'Воронеж',
        addressRegion: 'Воронежская область',
        postalCode: '394026',
        addressCountry: 'RU'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: COORDS.truda.lat,
        longitude: COORDS.truda.lon
      },
      ...common
    },
    {
      '@type': 'AutoRepair',
      '@id': `${SITE}/#dimitrova`,
      name: 'Автосервис «СТО Машин» — ул. Димитрова, 138',
      url: `${SITE}/kontakty/`,
      telephone: '+7-920-445-00-02',
      hasMap: `https://yandex.ru/maps/org/${ORG.dimitrova}/`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'ул. Димитрова, 138',
        addressLocality: 'Воронеж',
        addressRegion: 'Воронежская область',
        postalCode: '394028',
        addressCountry: 'RU'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: COORDS.dimitrova.lat,
        longitude: COORDS.dimitrova.lon
      },
      ...common
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: `${SITE}/`,
      name: 'Автосервис «100 Машин» — Воронеж',
      inLanguage: 'ru-RU',
      publisher: { '@id': `${SITE}/#organization` }
    }
  ];

  return script({ '@context': 'https://schema.org', '@graph': graph });
}

export const script = (obj) =>
  `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;

/** Разметка Service + Offer для страницы услуги. */
export function serviceJsonLd({ name, description, url, price, type }) {
  const offer = price
    ? {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: 'RUB',
        availability: 'https://schema.org/InStock',
        url: `${SITE}${url}`,
        seller: { '@id': `${SITE}/#organization` }
      }
    : undefined;

  return script({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE}${url}#service`,
    name,
    description,
    serviceType: type || name,
    url: `${SITE}${url}`,
    provider: { '@id': `${SITE}/#organization` },
    areaServed: { '@type': 'City', name: 'Воронеж' },
    ...(offer ? { offers: offer } : {})
  });
}

/** FAQPage. Размечаем только те вопросы, что реально видны на странице. */
export const faqJsonLd = (items) =>
  script({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.aText || stripTags(f.a) }
    }))
  });

const stripTags = (s) => String(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/* ==========================================================================
   Повторяющиеся блоки разметки
   ========================================================================== */

/** Видимый FAQ на <details> + микроразметка. */
export function faqBlock(items, { title = 'Частые вопросы', id = 'faq' } = {}) {
  const list = items
    .map(
      (f) => `        <details class="faq__item">
          <summary class="faq__q">${f.q}</summary>
          <div class="faq__a">${f.a}</div>
        </details>`
    )
    .join('\n');

  return `    <section class="section section--muted" id="${id}">
      <div class="container">
        <div class="section__head">
          <h2 class="section__title">${title}</h2>
        </div>
        <div class="faq">
${list}
        </div>
      </div>
    </section>`;
}

/**
 * Две площадки с картами.
 *
 * Оформлены одинаково: они равнозначны, различие показывают теги и
 * подсказка «куда ехать именно вам». Карты подгружает lazyblock.js
 * при подходе к блоку, клик по кнопке тоже работает.
 */
export function locationsBlock({ heading = 'Два адреса в Воронеже' } = {}) {
  const point = (p) => `          <article class="site">
            <header class="site__head">
              <p class="site__label">${p.label}</p>
              <h3 class="site__name">${p.street}</h3>
              <p class="site__district">${p.district}</p>
              <ul class="site__tags" role="list">
${p.tags.map((t) => `                <li>${t}</li>`).join('\n')}
              </ul>
            </header>

            <dl class="site__rows">
${p.rows
  .map(
    (r) => `              <div>
                <dt>${r.k}</dt>
                <dd>${r.v}</dd>
              </div>`
  )
  .join('\n')}
            </dl>

            <div class="map" data-map data-org="${p.org}"
                 data-coords="${p.coords.lat},${p.coords.lon}" data-section="map-${p.id}">
              <button class="map__trigger" type="button" data-map-trigger>
                <span class="map__play">Показать карту</span>
                <span class="map__hint">
                  Загрузится при прокрутке — так страница открывается быстрее
                </span>
              </button>
            </div>

            <div class="site__actions">
              <a class="btn btn--primary btn--sm" href="${route(p.coords)}"
                 target="_blank" rel="noopener" data-route>Проложить маршрут</a>
              <a class="btn btn--ghost btn--sm" href="https://yandex.ru/maps/org/${p.org}/"
                 target="_blank" rel="noopener">Отзывы и фото</a>
            </div>
          </article>`;

  const truda = {
    id: 'truda',
    label: 'Северная часть города',
    street: 'просп. Труда, 46И',
    district: 'Коминтерновский район · 1 этаж',
    tags: ['Легковой ремонт', 'Диагностика', 'Шиномонтаж'],
    org: ORG.truda,
    coords: COORDS.truda,
    rows: [
      { k: 'Телефон', v: `<a class="site__phone" href="${PHONE.truda.tel}">${PHONE.truda.display}</a>` },
      { k: 'Часы', v: 'Пн–Сб 9:00–19:00' },
      { k: 'Ориентир', v: 'Политехнический институт, остановка «Проспект Труда» — 230 м' }
    ]
  };

  const dimitrova = {
    id: 'dimitrova',
    label: 'Левый берег',
    street: 'ул. Димитрова, 138',
    district: 'Машмет · открылась первой, в 2018 году',
    tags: ['Магазин запчастей', 'Грузовой сервис', 'ГАЗели', 'Рядом М4 «Дон»'],
    org: ORG.dimitrova,
    coords: COORDS.dimitrova,
    rows: [
      { k: 'Телефон', v: `<a class="site__phone" href="${PHONE.dimitrova.tel}">${PHONE.dimitrova.display}</a>` },
      { k: 'Часы', v: 'Пн–Сб 9:00–19:00' },
      { k: 'Ориентир', v: 'Остановка «СТО» — 200 м, рядом ТЦ «Твой Дом»' }
    ]
  };

  return `    <section class="section" id="adresa">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Где нас найти</p>
          <h2 class="section__title">${heading}</h2>
          <p class="section__lead">
            Одна компания, одни цены и правила. Площадки отличаются
            только тем, что ближе и что есть на месте.
          </p>
        </div>

        <div class="sites">
${point(truda)}
${point(dimitrova)}
        </div>

        <p class="sites__hint">
          <strong>Куда ехать?</strong> За запчастями, ремонтом ГАЗели или грузовика —
          на Димитрова. Легковой ремонт ближе к северу города — на Труда.
          Сомневаетесь — позвоните <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a>,
          подскажем и запишем.
        </p>
      </div>
    </section>`;
}
/** Форма записи: собирает заявку и уходит в WhatsApp, без бэкенда. */
export function bookingBlock({ id = 'zapis', service = '' } = {}) {
  return `    <section class="section section--surface" id="${id}">
      <div class="container">
        <div class="section__head section__head--center">
          <h2 class="section__title">Записаться на ремонт</h2>
          <p class="section__lead">
            Выберите удобное время — заявка уйдёт в WhatsApp уже заполненной,
            останется только отправить сообщение. Перезвоним и подтвердим.
          </p>
        </div>

        <!--
          data-booking — сборка заявки и отправка в WhatsApp (booking.js).
          data-form    — второй канал: отправка на почту через Web3Forms,
                         включается сам, когда в config.js задан ключ.
        -->
        <form class="form form--card" data-booking data-form data-section="booking"
              data-subject="Заявка на запись с сайта 100mashin.ru"
              aria-labelledby="${id}-title">
          <h3 class="visually-hidden" id="${id}-title">Форма записи на ремонт</h3>

          <div class="form__grid form__grid--2">
            <div class="form__row">
              <label class="form__label" for="${id}-date">
                Дата визита <span class="form__req" aria-hidden="true">*</span>
              </label>
              <input class="form__input" id="${id}-date" name="date" type="date" required>
              <p class="form__error" id="${id}-date-err" hidden></p>
            </div>

            <div class="form__row">
              <label class="form__label" for="${id}-time">
                Время <span class="form__req" aria-hidden="true">*</span>
              </label>
              <select class="form__input" id="${id}-time" name="time" required data-autofill>
                <option value="">Сначала выберите дату</option>
              </select>
              <p class="form__error" id="${id}-time-err" hidden></p>
            </div>
          </div>

          <div class="form__row">
            <label class="form__label" for="${id}-service">
              Что нужно сделать <span class="form__req" aria-hidden="true">*</span>
            </label>
            <input class="form__input" id="${id}-service" name="service" type="text" required
                   value="${service}"
                   placeholder="Например: стучит подвеска, нужна диагностика">
            <p class="form__error" id="${id}-service-err" hidden></p>
          </div>

          <div class="form__grid form__grid--2">
            <div class="form__row">
              <label class="form__label" for="${id}-car">Автомобиль</label>
              <input class="form__input" id="${id}-car" name="car" type="text"
                     placeholder="Марка, модель, год, двигатель">
            </div>

            <div class="form__row">
              <label class="form__label" for="${id}-name">Как к вам обращаться</label>
              <input class="form__input" id="${id}-name" name="name" type="text"
                     autocomplete="name">
            </div>
          </div>

          <div class="form__row">
            <label class="form__label" for="${id}-phone">
              Телефон <span class="form__req" aria-hidden="true">*</span>
            </label>
            <input class="form__input" id="${id}-phone" name="phone" type="tel" required
                   inputmode="tel" autocomplete="tel" placeholder="+7 900 000-00-00">
            <p class="form__hint">Нужен, чтобы подтвердить время и уточнить запчасти.</p>
            <p class="form__error" id="${id}-phone-err" hidden></p>
          </div>

          <div class="form__row">
            <label class="form__label" for="${id}-comment">Комментарий</label>
            <textarea class="form__input" id="${id}-comment" name="comment" rows="3"
                      placeholder="Что беспокоит, когда началось, что уже делали"></textarea>
          </div>

          <p class="booking__note" data-booking-note hidden></p>

          <!-- Ловушка для ботов: скрыта визуально, но не display:none. -->
          <input class="form__botcheck" type="checkbox" name="botcheck"
                 tabindex="-1" aria-hidden="true" autocomplete="off">

          <!-- Сюда booking.js кладёт собранный текст заявки для отправки на почту. -->
          <input type="hidden" name="message" value="">

          <div class="form__row form__consent">
            <input id="${id}-consent" name="consent" type="checkbox" required
                   aria-describedby="${id}-consent-err">
            <label class="form__consent-label" for="${id}-consent">
              Я согласен на обработку моих персональных данных и принимаю условия
              <a href="/politika/">Политики обработки персональных данных</a>.
            </label>
            <p class="form__error" id="${id}-consent-err" hidden></p>
          </div>

          <div class="cluster cluster--2">
            <button class="btn btn--primary btn--lg" type="button" data-booking-send
                    data-submit>
              Отправить заявку в WhatsApp
            </button>
            <a class="btn btn--secondary btn--stack" href="${PHONE.booking.tel}">
              <span>Позвонить</span>
              <span class="nowrap">${PHONE.booking.display}</span>
            </a>
          </div>

          <p class="form__status" data-status role="status" aria-live="polite"></p>

          <!-- Запасной канал: показывается, если что-то помешало отправке. -->
          <div class="form__fallback" data-fallback hidden>
            <p>
              Не получилось открыть WhatsApp? Позвоните или напишите — заявку
              примем всё равно.
            </p>
            <div class="form__fallback-actions">
              <a class="btn btn--primary btn--sm btn--nowrap" href="${PHONE.booking.tel}">
                ${PHONE.booking.display}
              </a>

            </div>
          </div>

          <p class="disclaimer">
            Заявка формируется у вас в браузере и отправляется через WhatsApp —
            на сайте мы её не храним.
          </p>
        </form>
      </div>
    </section>`;
}

/** Широкая полоса с призывом к действию. */
export function ctaBand({
  title = 'Не знаете, в чём причина поломки?',
  text = 'Опишите симптомы — подскажем, что проверять, и назовём вилку цены до приезда.',
  waText = 'Здравствуйте! Пишу с сайта 100mashin.ru. Опишу проблему: '
} = {}) {
  return `    <section class="section cta-band" data-section="cta-band">
      <div class="container">
        <div class="cta-group">
          <div>
            <h2 class="section__title">${title}</h2>
            <p class="section__lead">${text}</p>
          </div>
          <div class="cluster cluster--2">
            <a class="btn btn--invert btn--lg" ${wa(waText)}>Написать в WhatsApp</a>
            <a class="btn btn--outline-invert btn--lg btn--nowrap" href="${PHONE.booking.tel}">
              ${PHONE.booking.display}
            </a>
          </div>
        </div>
      </div>
    </section>`;
}

/** Правила расчёта: ответ на опасение «накрутят по ходу». */
export function honestyBlock() {
  return `    <section class="section" id="pravila">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Как мы работаем</p>
          <h2 class="section__title">Пять правил, по которым считаем деньги</h2>
          <p class="section__lead">
            Самая частая претензия к автосервисам — «назвали одну цену, взяли
            другую». Мы закрыли этот вопрос письменными правилами.
          </p>
        </div>

        <ol class="steps">
          <li>
            <h3 class="steps__title">Сначала диагностика, потом смета</h3>
            <p class="steps__text">
              Пока причина не найдена, никакие работы не начинаем и денег
              за них не берём.
            </p>
          </li>
          <li>
            <h3 class="steps__title">Заказ-наряд до начала работ</h3>
            <p class="steps__text">
              В нём перечислены работы, запчасти и итоговая сумма. Вы видите
              цену до того, как машину загнали в бокс.
            </p>
          </li>
          <li>
            <h3 class="steps__title">Не согласовали — не делаем</h3>
            <p class="steps__text">
              Если по ходу ремонта нашли ещё поломку, сначала звоним и
              показываем. Работы без вашего согласия вы не оплачиваете.
            </p>
          </li>
          <li>
            <h3 class="steps__title">Фото и видео поломки</h3>
            <p class="steps__text">
              Отправляем в WhatsApp снимок или короткое видео проблемного узла.
              Так видно, что замена действительно нужна.
            </p>
          </li>
          <li>
            <h3 class="steps__title">Запчасти на выбор</h3>
            <p class="steps__text">
              Предлагаем оригинал и аналог с ценами и сроками. Со своими
              запчастями тоже работаем — гарантия на работу сохраняется.
            </p>
          </li>
        </ol>

        <p class="disclaimer mt-6">
          Нормочас на проспекте Труда — <strong>${NORMOCHAS}&nbsp;₽</strong>,
          без наценки за марку автомобиля.
          <a href="/ceny/">Посмотреть прайс</a> ·
          <a href="/garantiya/">Условия гарантии</a>
        </p>
      </div>
    </section>`;
}
