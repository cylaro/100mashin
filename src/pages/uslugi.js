import {
  NORMOCHAS, PHONE, faqBlock, faqJsonLd, ctaBand, bookingBlock, wa, script, SITE, heroAside
} from './_shared.js';

const groups = [
  {
    title: 'Двигатель и его системы',
    items: [
      { name: 'Ремонт двигателя', href: '/uslugi/remont-dvigatelya/', price: 'от 15 000 ₽', text: 'Капремонт, дефектовка с фотоотчётом, расточка блока, шлифовка коленвала.' },
      { name: 'Ремонт ГБЦ', href: '/uslugi/remont-gbc/', price: 'от 6 000 ₽', text: 'Опрессовка, фрезеровка плоскости, направляющие, клапаны, притирка.' },
      { name: 'Ремонт турбин', href: '/uslugi/remont-turbin/', price: 'от 9 000 ₽', text: 'Легковые и грузовые, вестгейт, актуатор, балансировка картриджа.' },
      { name: 'Замена ГРМ', href: '/uslugi/zamena-grm/', price: 'от 3 000 ₽', text: 'Ремень и цепь комплектом, метки по заводским рискам.' },
      { name: 'Ремонт форсунок', href: '/uslugi/remont-forsunok/', price: 'от 1 200 ₽', text: 'Промывка и проверка на стенде, топливная система, ТНВД.' },
      { name: 'Удаление катализатора', href: '/uslugi/udalenie-katalizatora/', price: 'от 0 ₽', text: 'Пламегаситель, удаление EGR, ремонт выхлопа. Бесплатно при сдаче катализатора.' }
    ]
  },
  {
    title: 'Трансмиссия, ходовая, тормоза',
    items: [
      { name: 'КПП и сцепление', href: '/uslugi/transmissiya/', price: 'от 6 000 ₽', text: 'МКПП, раздатки, редукторы, карданы, АКПП после дефектовки.' },
      { name: 'Ходовая и тормоза', href: '/uslugi/hodovaya-tormoza/', price: 'от 400 ₽', text: 'Стойки, рычаги, шаровые, ступицы, колодки, диски, сход-развал.' }
    ]
  },
  {
    title: 'Электрика, диагностика, ТО',
    items: [
      { name: 'Компьютерная диагностика', href: '/uslugi/diagnostika/', price: 'от 990 ₽', text: 'Ошибки и живые параметры, письменное заключение с приоритетами.' },
      { name: 'Автоэлектрика', href: '/uslugi/elektrika/', price: 'от 990 ₽', text: 'Стартеры, генераторы, утечки тока, проводка, доп. оборудование.' },
      { name: 'Техобслуживание', href: '/uslugi/to/', price: 'от 1 500 ₽', text: 'Регламентное ТО, предрейсовый техосмотр, обслуживание автопарков.' },
      { name: 'Кондиционер', href: '/uslugi/konditsioner/', price: 'от 1 500 ₽', text: 'Заправка с поиском утечек, дезинфекция, рефрижераторы.' }
    ]
  },
  {
    title: 'Кузов, стёкла, колёса',
    items: [
      { name: 'Кузовной ремонт', href: '/uslugi/kuzovnoy-remont/', price: 'от 1 500 ₽', text: 'Жестянка, сварка, покраска элемента, полировка, будки и тенты.' },
      { name: 'Автостёкла', href: '/uslugi/avtostekla/', price: 'от 1 900 ₽', text: 'Замена лобового, ремонт сколов и трещин, тонировка.' },
      { name: 'Шиномонтаж', href: '/uslugi/shinomontazh/', price: 'от 2 000 ₽', text: 'R13–R18, кроссоверы, ГАЗели, грузовой. Балансировка, вулканизация.' }
    ]
  }
];

const cards = (items) =>
  items
    .map(
      (i) => `          <article class="card card--link service-card">
            <h3 class="card__title service-card__title"><a href="${i.href}">${i.name}</a></h3>
            <p class="service-card__text">${i.text}</p>
            <p class="card__price service-card__price">${i.price}</p>
          </article>`
    )
    .join('\n');

const sections = groups
  .map(
    (g, idx) => `    <section class="section${idx % 2 ? ' section--muted' : ''}">
      <div class="container">
        <div class="section__head">
          <h2 class="section__title">${g.title}</h2>
        </div>
        <div class="service-grid">
${cards(g.items)}
        </div>
      </div>
    </section>`
  )
  .join('\n\n');

const faq = [
  {
    q: 'С какими марками работаете?',
    a: `<p>С легковыми отечественными и импортными, с лёгким коммерческим и
        грузовым транспортом. Отдельная специализация — ГАЗели и ГАЗ: по ним у
        нас свой склад запчастей. Работаем с ВАЗ, УАЗ, Kia, Hyundai, Renault,
        Volkswagen, Ford, Toyota, Nissan, Chevrolet, Mazda, Skoda, Mercedes-Benz,
        BMW, Audi, Peugeot, Citroen и другими.</p>`
  },
  {
    q: 'Чем отличаются две ваши площадки?',
    a: `<p>Это одна компания. На Димитрова, 138 — основная площадка с магазином
        запчастей и грузовым сервисом. На проспекте Труда, 46И — площадка для
        легкового ремонта, удобная тем, кто живёт в северной части города.
        Часть работ, например станочные операции по ГБЦ, выполняется на
        оснащённой площадке — при записи скажем, куда приезжать.</p>`
  },
  {
    q: 'Как узнать цену до приезда?',
    a: `<p>Три способа. Посмотреть <a href="/ceny/">прайс</a> — там 158 позиций
        с ценами. Посчитать на калькуляторе на той же странице. Или описать
        проблему в WhatsApp — ответим с вилкой цены и сроком.</p>`
  },
  {
    q: 'Работаете с организациями?',
    a: `<p>Да, ООО «СТО МАШИН» работает на общей системе налогообложения:
        выдаём счёт, акт и счёт-фактуру с НДС. Обслуживаем автопарки по
        договору, есть опыт исполнения госконтрактов.</p>
        <p><a href="/yuridicheskim-licam/">Условия для юридических лиц</a></p>`
  }
];

const body = `    <section class="hero hero--split" data-section="hero">
      <div class="container hero__inner">
        <div class="hero__body">
          <h1 class="hero__title">Услуги автосервиса «100 Машин»</h1>
          <p class="hero__lead">
            Делаем всё, кроме тюнинга: от замены масла до капремонта двигателя
            и кузовных работ. Ставка нормочаса одна для любой марки —
            ${NORMOCHAS}&nbsp;₽, смету согласуем до начала работ.
          </p>
          <div class="hero__actions" data-section="hero">
            <a class="btn btn--primary btn--lg" href="/ceny/">Прайс и калькулятор</a>
            <a class="btn btn--wa btn--lg" ${wa(
              'Здравствуйте! Пишу с сайта 100mashin.ru. Подскажите по услуге. Авто: '
            )}>Спросить в WhatsApp</a>
          </div>
          <ul class="hero__trust" role="list">
            <li><b>158</b><span>позиций в прайсе</span></li>
            <li><b>Легковые</b><span>ГАЗели и грузовые</span></li>
            <li><b>Свой</b><span>магазин запчастей</span></li>
          </ul>
        </div>

${heroAside({
  label: 'Специализация',
  title: 'Двигатели, ГБЦ, турбины',
  note: 'Станочные операции делаем у себя, без поездок к смежникам.',
  items: [
    'Легковые, ГАЗели и грузовые',
    'Свой магазин запчастей на ГАЗ',
    'Нормочас <b>1200 ₽</b> на любую марку',
    'Диагностика ходовой бесплатно при ремонте'
  ]
})}
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <h2 class="visually-hidden">Быстрый переход к нужной услуге</h2>
        <p class="finder__hint">С чем приехали? Выберите ближе к вашей ситуации:</p>
        <ul class="finder" role="list">
          <li><a href="/uslugi/diagnostika/"><b>Горит «чек»</b><span>Диагностика · от 990 ₽</span></a></li>
          <li><a href="/uslugi/remont-dvigatelya/"><b>Дымит, ест масло</b><span>Двигатель · от 15 000 ₽</span></a></li>
          <li><a href="/uslugi/remont-gbc/"><b>Уходит антифриз</b><span>ГБЦ · от 6 000 ₽</span></a></li>
          <li><a href="/uslugi/remont-turbin/"><b>Свист, пропала тяга</b><span>Турбина · от 9 000 ₽</span></a></li>
          <li><a href="/uslugi/hodovaya-tormoza/"><b>Стучит на кочках</b><span>Ходовая · от 400 ₽</span></a></li>
          <li><a href="/uslugi/transmissiya/"><b>Хруст, буксует</b><span>КПП и сцепление · от 6 000 ₽</span></a></li>
          <li><a href="/uslugi/to/"><b>Пора на ТО</b><span>Обслуживание · от 1 500 ₽</span></a></li>
          <li><a href="/uslugi/shinomontazh/"><b>Пробил колесо</b><span>Шиномонтаж · от 2 000 ₽</span></a></li>
          <li><a href="/uslugi/kuzovnoy-remont/"><b>Вмятина, царапина</b><span>Кузов · от 1 500 ₽</span></a></li>
          <li><a href="/gruzovoy-servis/"><b>ГАЗель или грузовик</b><span>Коммерческий транспорт</span></a></li>
        </ul>
        <p class="disclaimer mt-6">
          Не нашли свой случай — опишите симптомы в WhatsApp, подскажем,
          с чего начать, и назовём вилку цены до приезда.
        </p>
      </div>
    </section>

${sections}

    <section class="section section--chapter">
      <div class="container">
        <div class="section__head">
          <h2 class="section__title">Работаем с любыми марками</h2>
          <p class="section__lead">
            Отдельное направление — ГАЗели, ГАЗ и коммерческий транспорт:
            по ним держим запчасти на своём складе, ремонт не ждёт поставку.
          </p>
        </div>

        <div class="brands">
          <div class="brands__group">
            <p class="brands__label">Отечественные и коммерческие</p>
            <p class="brands__list">
              ГАЗ · ГАЗель · УАЗ · Лада · ВАЗ · Isuzu
            </p>
          </div>

          <div class="brands__group">
            <p class="brands__label">Массовые иномарки</p>
            <p class="brands__list">
              Kia · Hyundai · Renault · Volkswagen · Ford · Toyota · Nissan ·
              Chevrolet · Mazda · Škoda · Opel · Peugeot · Citroen ·
              Mitsubishi · Suzuki · Daewoo
            </p>
          </div>

          <div class="brands__group">
            <p class="brands__label">Премиум и внедорожники</p>
            <p class="brands__list">
              Mercedes-Benz · BMW · Audi · Volvo · Lexus · Honda ·
              Subaru · SsangYong · Genesis
            </p>
          </div>
        </div>

        <p class="brands__note">
          Списком не ограничиваемся. Если вашей марки здесь нет, позвоните
          <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a> —
          скажем честно, берёмся или нет.
        </p>
      </div>
    </section>

    <section class="section section--muted section--follow">
      <div class="container">
        <div class="callout callout--accent">
          <h2 class="callout__title">Не знаете, какая услуга нужна?</h2>
          <p>
            Это нормально: по симптомам сложно определить причину даже
            опытному водителю. Опишите, что происходит с машиной, — подскажем,
            с чего начинать, и назовём вилку цены.
          </p>
          <p class="cluster gap-2 flex-wrap">
            <a class="btn btn--wa" ${wa(
              'Здравствуйте! Пишу с сайта 100mashin.ru. Не знаю, что с машиной. Опишу симптомы: '
            )}>Описать симптомы</a>
            <a class="btn btn--ghost" href="/ceny/">Посмотреть прайс</a>
          </p>
          <p class="text-sm text-muted">
            Диагностика ходовой — бесплатно при последующем ремонте у нас.
          </p>
        </div>
      </div>
    </section>
${ctaBand()}

${bookingBlock()}

${faqBlock(faq)}
`;

export default {
  url: '/uslugi/',
  navKey: 'uslugi',
  title: 'Услуги автосервиса в Воронеже — цены | 100 Машин',
  description:
    'Все услуги автосервиса «100 Машин» в Воронеже: ремонт двигателя, ГБЦ, турбин, КПП, ходовой, кузовной ремонт, автостёкла, шиномонтаж. Нормочас 1200 ₽, 158 позиций в прайсе.',
  priority: '0.9',
  trail: [{ name: 'Услуги' }],
  jsonld:
    script({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${SITE}/uslugi/#page`,
      name: 'Услуги автосервиса «100 Машин»',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#organization` },
      hasPart: groups.flatMap((g) =>
        g.items.map((i) => ({
          '@type': 'Service',
          name: i.name,
          url: `${SITE}${i.href}`,
          provider: { '@id': `${SITE}/#organization` }
        }))
      )
    }) + faqJsonLd(faq),
  body
};
