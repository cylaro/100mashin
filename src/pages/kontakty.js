import {
  PHONE, locationsBlock, bookingBlock, faqBlock, faqJsonLd, wa, heroAside
} from './_shared.js';

const faq = [
  {
    q: 'Куда лучше приехать — на Труда или на Димитрова?',
    a: `<p>Если вам ближе север города — проспект Труда. Если нужен магазин
        запчастей, грузовой сервис или вы едете со стороны М4 — Димитрова.
        При записи мы уточним, куда приезжать: часть работ, например станочные
        операции по ГБЦ, выполняется на оснащённой площадке.</p>`
  },
  {
    q: 'Как найти въезд на проспекте Труда, 46И?',
    a: `<p>Это территория с несколькими строениями, литера «И», мы на 1 этаже.
        Ориентир — Политехнический институт, остановка «Проспект Труда» в 230
        метрах. Дорога на подъезде неидеальная — территория не наша.
        Если не нашли — позвоните
        <a href="${PHONE.truda.tel}">${PHONE.truda.display}</a>, подскажем
        или встретим.</p>`
  },
  {
    q: 'Работаете в субботу?',
    a: `<p>Да, в субботу работаем с 9:00 до 18:00. Воскресенье — выходной.
        На субботу лучше записаться заранее: день загруженный.</p>`
  },
  {
    q: 'Можно приехать без записи?',
    a: `<p>В аварийной ситуации — да, принимаем и без записи, это подтверждают
        отзывы. Но для плановых работ лучше записаться: не придётся ждать
        свободный подъёмник, и мы заранее подготовим запчасти.</p>`
  },
  {
    q: 'Какой телефон для чего?',
    a: `<p><a href="${PHONE.booking.tel}">${PHONE.booking.display}</a> — запись
        на ремонт. <a href="${PHONE.parts.tel}">${PHONE.parts.display}</a> —
        подбор и заказ запчастей.
        <a href="${PHONE.truda.tel}">${PHONE.truda.display}</a> — площадка на
        Труда. <a href="${PHONE.dimitrova.tel}">${PHONE.dimitrova.display}</a> —
        площадка на Димитрова, этот же номер в WhatsApp.</p>`
  },
  {
    q: 'Есть ли у вас Telegram?',
    a: `<p>Нет, Telegram-аккаунта у сервиса нет — не хотим указывать канал,
        который никто не читает. Пишите в WhatsApp: отвечаем в рабочее время.
        Также есть <a href="https://vk.com/avto100mashin" target="_blank"
        rel="noopener">страница во ВКонтакте</a>.</p>`
  }
];

const body = `    <section class="hero hero--split" data-section="hero">
      <div class="container hero__inner">
        <div class="hero__body">
          <p class="hero__eyebrow">
            <span class="hero__eyebrow-dot" aria-hidden="true"></span>
            Пн–Сб 9:00–19:00
          </p>
          <h1 class="hero__title">Как с нами связаться</h1>
          <p class="hero__lead">
            Звоните по нужному номеру — не придётся ждать переключения.
            В аварийной ситуации принимаем и без записи.
          </p>
          <div class="hero__actions" data-section="hero">
            <a class="btn btn--primary btn--lg btn--stack" href="${PHONE.booking.tel}">
              <span>Записаться</span>
              <span class="nowrap">${PHONE.booking.display}</span>
            </a>
            <a class="btn btn--wa btn--lg" ${wa(
              'Здравствуйте! Пишу с сайта 100mashin.ru. Хочу записаться на ремонт. Авто: '
            )}>Написать в WhatsApp</a>
          </div>
        </div>

${heroAside({
          label: 'Время работы',
          title: 'Пн–Сб с 9:00 до 19:00',
          note: 'В субботу работаем до 18:00, воскресенье — выходной.',
          items: [
            'Два адреса: Труда, 46И и Димитрова, 138',
            'В аварийной ситуации примем без записи',
            'WhatsApp на номере Димитрова',
            'Своя парковка на обеих площадках'
          ]
        })}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Телефоны</p>
          <h2 class="section__title">Каждый номер — по своему вопросу</h2>
        </div>

        <div class="contact-grid" data-section="contacts">
          <div class="contact contact--primary">
            <p class="contact__label">Запись на ремонт</p>
            <a class="contact__value" href="${PHONE.booking.tel}">${PHONE.booking.display}</a>
            <p class="contact__note">Согласуем дату и время, подготовим запчасти к вашему приезду</p>
          </div>

          <div class="contact">
            <p class="contact__label">Подбор запчастей</p>
            <a class="contact__value" href="${PHONE.parts.tel}">${PHONE.parts.display}</a>
            <p class="contact__note">Легковые, ГАЗели, грузовые и спецтехника — в наличии и под заказ</p>
          </div>


          <div class="contact">
            <p class="contact__label">просп. Труда, 46И</p>
            <a class="contact__value" href="${PHONE.truda.tel}">${PHONE.truda.display}</a>
            <p class="contact__note">Прямой номер площадки в Коминтерновском районе</p>
          </div>

          <div class="contact">
            <p class="contact__label">ул. Димитрова, 138</p>
            <a class="contact__value" href="${PHONE.dimitrova.tel}">${PHONE.dimitrova.display}</a>
            <p class="contact__note">
              Тот же номер в
              <a ${wa('Здравствуйте! Пишу с сайта 100mashin.ru. Вопрос по ремонту. Авто: ')}>WhatsApp</a>
            </p>
          </div>

          <div class="contact">
            <p class="contact__label">Почта и соцсети</p>
            <a class="contact__value" href="mailto:autolaw@inbox.ru">autolaw@inbox.ru</a>
            <p class="contact__note">
              Для организаций и тендеров —
              <a href="mailto:autolaw.tender@mail.ru">autolaw.tender@mail.ru</a>.
              Мы во <a href="https://vk.com/avto100mashin" target="_blank" rel="noopener">ВКонтакте</a>.
              Telegram у сервиса нет.
            </p>
          </div>
        </div>
      </div>
    </section>

${locationsBlock({ heading: 'Адреса и проезд' })}

    <section class="section section--muted section--chapter">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Режим и документы</p>
          <h2 class="section__title">Время работы и реквизиты</h2>
        </div>

        <div class="info-split">
          <div class="info-card">
            <h3 class="info-card__title">Когда мы работаем</h3>
            <dl class="hours">
              <div>
                <dt>Понедельник — пятница</dt>
                <dd>9:00 — 19:00</dd>
              </div>
              <div>
                <dt>Суббота</dt>
                <dd>9:00 — 18:00</dd>
              </div>
              <div>
                <dt>Воскресенье</dt>
                <dd data-off>выходной</dd>
              </div>
            </dl>
            <p class="disclaimer mt-6">
              Если сломались в дороге — звоните в рабочее время, примем без
              записи и постараемся сделать в тот же день. В праздники график
              может меняться, лучше уточнить заранее.
            </p>
          </div>

          <div class="info-card">
            <h3 class="info-card__title">Реквизиты</h3>
            <dl class="req">
              <div><dt>Организация</dt><dd>ООО «СТО МАШИН»</dd></div>
              <div><dt>ИНН</dt><dd>3666230820</dd></div>
              <div><dt>ОГРН</dt><dd>1183668038509</dd></div>
              <div><dt>Адрес</dt><dd>394028, г. Воронеж, ул. Димитрова, д. 138, оф. 4</dd></div>
              <div><dt>Налоги</dt><dd>ОСНО, работаем с НДС</dd></div>
            </dl>
            <p class="disclaimer mt-6">
              Полные банковские реквизиты и проект договора направим по запросу.
              <a href="/yuridicheskim-licam/">Условия для юридических лиц</a>
            </p>
          </div>
        </div>
      </div>
    </section>

${bookingBlock()}

${faqBlock(faq)}
`;
export default {
  url: '/kontakty/',
  navKey: 'kontakty',
  title: 'Контакты автосервиса «100 Машин» в Воронеже',
  description:
    'Контакты автосервиса «100 Машин» в Воронеже: просп. Труда, 46И и ул. Димитрова, 138. Телефоны, WhatsApp, время работы Пн–Сб 9:00–19:00, карты и схема проезда.',
  priority: '0.8',
  trail: [{ name: 'Контакты' }],
  jsonld: faqJsonLd(faq),
  body
};
