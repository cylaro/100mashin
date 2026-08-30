import {
  PHONE, NORMOCHAS, ctaBand, bookingBlock, faqBlock, faqJsonLd, wa,
  serviceJsonLd
} from './_shared.js';

const faq = [
  {
    q: 'Какие грузовые обслуживаете?',
    a: `<p>Основной профиль — ГАЗель, ГАЗ и лёгкий коммерческий транспорт:
        по ним у нас свой склад запчастей и наибольший опыт. Также работаем с
        грузовыми и коммерческими автомобилями других марок, включая Isuzu,
        Ford Transit, микроавтобусы. По конкретной модели скажем честно,
        берёмся или нет: <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a>.</p>`
  },
  {
    q: 'Как быстро возьмёте машину в работу при простое?',
    a: `<p>Для перевозчиков простой стоит дороже ремонта, поэтому такие машины
        берём вне очереди, насколько позволяет загрузка. По отзыву постоянного
        клиента, ремонт, который в других сервисах занимал две-три недели, у нас
        уложился в четыре дня — в основном потому, что запчасти на ГАЗ есть
        в наличии.</p>`
  },
  {
    q: 'Есть ли у вас запчасти на ГАЗ в наличии?',
    a: `<p>Да, у нас свой магазин запчастей на площадке на Димитрова. Держим
        ходовые позиции по ГАЗели: синхронизаторы, вторичные валы, ремкомплекты
        подшипников КПП, распредвалы, шатуны, колодки, фильтры. Остальное
        привозим под заказ, в том числе на спецтехнику.
        Подбор: <a href="${PHONE.parts.tel}">${PHONE.parts.display}</a>.</p>`
  },
  {
    q: 'Делаете предрейсовый техосмотр?',
    a: `<p>Да, от 500 ₽. Работаем по договору с организациями, выдаём документы.
        Это востребовано у перевозчиков, обязанных проводить предрейсовый
        контроль технического состояния.</p>`
  },
  {
    q: 'Работаете с рефрижераторами?',
    a: `<p>Да, обслуживаем и ремонтируем холодильное оборудование коммерческого
        транспорта. Актуально для перевозок продуктов и медикаментов, где сбой
        холодильника означает потерю груза.</p>`
  },
  {
    q: 'Можно ли обслуживать парк по договору?',
    a: `<p>Да. Заключаем договор, ведём плановое ТО по графику, работаем по
        безналичному расчёту и выдаём полный комплект документов с НДС.
        ООО «СТО МАШИН» на общей системе налогообложения.</p>
        <p><a href="/yuridicheskim-licam/">Условия для юридических лиц</a></p>`
  }
];

const body = `    <section class="hero hero--split" data-section="hero">
      <div class="container hero__inner">
        <div class="hero__body">
          <h1 class="hero__title">Ремонт ГАЗелей и грузовых в Воронеже</h1>
          <p class="hero__lead">
            Коммерческий транспорт — наше основное направление, а не побочная
            услуга. Свой склад запчастей на ГАЗ, срочный ремонт при простое,
            работа с автопарками по договору.
          </p>
          <div class="hero__actions" data-section="hero">
            <a class="btn btn--primary btn--lg" href="#zapis">Записаться</a>
            <a class="btn btn--wa btn--lg" ${wa(
              'Здравствуйте! Пишу с сайта 100mashin.ru. Нужен ремонт коммерческого транспорта. Авто: '
            )}>Написать в WhatsApp</a>
          </div>
          <ul class="hero__trust" role="list">
            <li><b>${NORMOCHAS}&nbsp;₽</b><span>нормочас</span></li>
            <li><b>Свой</b><span>склад запчастей на ГАЗ</span></li>
            <li><b>НДС</b><span>и работа по договору</span></li>
          </ul>
        </div>

        <div class="hero-card">
          <div class="hero-rate hero-rate--text">
            <span class="hero-rate__label">Главное для перевозчика</span>
            <p class="hero-rate__headline">Простой дороже ремонта</p>
            <p class="hero-rate__note">
              Машины перевозчиков берём вне очереди, насколько позволяет
              загрузка. Запчасти на ГАЗель — на своём складе, поэтому
              не ждём поставку.
            </p>
          </div>

          <ul class="hero-card__list" role="list">
            <li>Двигатели <b>УМЗ, ЗМЗ</b>, дизели Cummins</li>
            <li>КПП, редукторы, мосты, карданы</li>
            <li>Удаление EGR и катализатора</li>
            <li>Ремонт будок и тентов, сварка рам</li>
            <li>Грузовой шиномонтаж</li>
            <li>Предрейсовый техосмотр</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <h2 class="section__title">Что делаем по коммерческому транспорту</h2>
          <p class="section__lead">
            Цены — за работу, по общему прайсу. Нормочас единый: ${NORMOCHAS}&nbsp;₽.
          </p>
        </div>

        <div class="service-grid">
          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/remont-dvigatelya/">Двигатели</a>
            </h3>
            <p class="service-card__text">
              УМЗ-4216, ЗМЗ-402, ЗМЗ-514, ЗМЗ-51432, дизели Cummins.
              Капремонт, ГБЦ, дефектовка с фотоотчётом.
            </p>
            <p class="card__price service-card__price">от 15 000 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/transmissiya/">КПП, редукторы, мосты</a>
            </h3>
            <p class="service-card__text">
              Ремонт коробок ГАЗели, редукторов, раздаточных коробок, карданов,
              замена сцепления. Синхронизаторы в наличии.
            </p>
            <p class="card__price service-card__price">от 6 000 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/remont-turbin/">Турбины грузовых</a>
            </h3>
            <p class="service-card__text">
              Ремонт турбокомпрессоров грузовых и спецтехники, вестгейт,
              балансировка. Диагностика снятой турбины бесплатно.
            </p>
            <p class="card__price service-card__price">от 15 000 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/remont-forsunok/">Топливная система</a>
            </h3>
            <p class="service-card__text">
              Форсунки, ТНВД, проверка на стенде, дизельная аппаратура
              коммерческого транспорта.
            </p>
            <p class="card__price service-card__price">от 1 200 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/udalenie-katalizatora/">EGR и катализатор</a>
            </h3>
            <p class="service-card__text">
              Удаление EGR от 3 000 ₽, пламегаситель вместо катализатора,
              ремонт выхлопной системы, сварка.
            </p>
            <p class="card__price service-card__price">от 3 000 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/kuzovnoy-remont/">Будки, тенты, сварка</a>
            </h3>
            <p class="service-card__text">
              Ремонт будок и тентов, ворот, сварка рам и силовых элементов,
              покраска, антикоррозийная обработка.
            </p>
            <p class="card__price service-card__price">от 1 500 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/shinomontazh/">Грузовой шиномонтаж</a>
            </h3>
            <p class="service-card__text">
              Грузовые колёса от 1 500 ₽ за колесо, ГАЗель — 5 200 ₽ за
              4 колеса. Вулканизация, ремонт порезов.
            </p>
            <p class="card__price service-card__price">от 1 500 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/to/">ТО и техосмотр</a>
            </h3>
            <p class="service-card__text">
              ТО лёгкого коммерческого транспорта от 1 500 ₽, предрейсовый
              техосмотр от 500 ₽, обслуживание парка по графику.
            </p>
            <p class="card__price service-card__price">от 500 ₽</p>
          </article>

          <article class="card card--link service-card">
            <h3 class="card__title service-card__title">
              <a href="/uslugi/konditsioner/">Рефрижераторы и отопители</a>
            </h3>
            <p class="service-card__text">
              Обслуживание авторефрижераторов, ремонт автономных отопителей,
              заправка кондиционеров.
            </p>
            <p class="card__price service-card__price">от 1 500 ₽</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--chapter section--muted">
      <div class="container">
        <div class="split split--tight split--stretch">
          <div class="prose">
            <h2>Почему перевозчики выбирают нас</h2>
            <p>
              Для коммерческого транспорта важны не те же вещи, что для личного
              автомобиля. Здесь простой считается в деньгах, а сорванный рейс —
              это ещё и репутация перед заказчиком.
            </p>
            <ul class="usp-list usp-list--accent" role="list">
              <li>
                <b>Запчасти в наличии.</b> Свой магазин на площадке: ходовые
                позиции по ГАЗели не нужно ждать с поставкой.
              </li>
              <li>
                <b>Берём срочно.</b> Если машина стоит и рейс под угрозой,
                принимаем вне очереди, насколько позволяет загрузка.
              </li>
              <li>
                <b>Документы для бухгалтерии.</b> Счёт, акт, счёт-фактура с НДС.
                Работаем по договору и по безналу.
              </li>
              <li>
                <b>Опыт с парками.</b> Обслуживаем автопарки организаций не
                первый год, ведём плановое ТО по графику.
              </li>
              <li>
                <b>Госконтракты.</b> Есть опыт исполнения контрактов для
                государственных учреждений Воронежской области.
              </li>
            </ul>
          </div>

          <div class="callout callout--accent">
            <h2 class="callout__title">Отзыв постоянного клиента</h2>
            <blockquote>
              <q>Бывает такое часто, что нужно быстро сделать ГАЗель чтобы не
              сорвался рейс, звонишь, просишь, и тебя уже ждут с открытыми
              дверьми… Если в других сервисах говорили один и тот же ремонт
              сделать от двух до трёх недель, к ним приезжаешь, они делают этот
              же ремонт за 4 дня. Всё налажено, запчасти тоже всегда в наличии.</q>
            </blockquote>
            <p class="text-sm">
              Отзыв с Яндекс Карт от представителя организации, обслуживающей
              парк ГАЗелей. <a href="/otzyvy/">Все отзывы</a>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <h2 class="section__title">Сломались на трассе М4 «Дон»?</h2>
          <p class="section__lead">
            Площадка на Димитрова стоит рядом с выездом на М4. Транзитные
            поломки — регулярная для нас работа: помогаем организовать эвакуатор
            и стараемся сделать в день обращения.
          </p>
        </div>

        <div class="grid-auto">
          <article class="card">
            <h3 class="card__title card__title--sm">Позвоните сразу</h3>
            <p class="card__text">
              <a class="contact__value" href="${PHONE.booking.tel}">${PHONE.booking.display}</a>
              — опишите, что случилось и где стоите. Подскажем, можно ли
              доехать своим ходом.
            </p>
          </article>

          <article class="card">
            <h3 class="card__title card__title--sm">Поможем с эвакуатором</h3>
            <p class="card__text">
              Если ехать нельзя, помогаем организовать эвакуацию до сервиса.
              Клиенты не раз отмечали это в отзывах.
            </p>
          </article>

          <article class="card">
            <h3 class="card__title card__title--sm">Примем без записи</h3>
            <p class="card__text">
              В аварийных ситуациях берём без предварительной записи и
              стараемся сделать в день обращения, чтобы вы поехали дальше.
            </p>
          </article>
        </div>
      </div>
    </section>

${ctaBand({
  title: 'Нужно обслуживать автопарк?',
  text: 'Расскажите про парк — предложим условия по договору, график ТО и документы с НДС.',
  waText: 'Здравствуйте! Пишу с сайта 100mashin.ru. Интересует обслуживание автопарка. Количество машин: '
})}

${bookingBlock({ service: 'Ремонт коммерческого транспорта' })}

${faqBlock(faq, { title: 'Вопросы про грузовой сервис' })}
`;

export default {
  url: '/gruzovoy-servis/',
  navKey: 'gruzovoy',
  title: 'Ремонт ГАЗелей и грузовых в Воронеже | 100 Машин',
  description:
    'Ремонт ГАЗелей и грузового транспорта в Воронеже: двигатели УМЗ и ЗМЗ, КПП, редукторы, турбины, будки и тенты, грузовой шиномонтаж. Свой склад запчастей на ГАЗ, работа с НДС.',
  priority: '0.9',
  trail: [{ name: 'Грузовой сервис' }],
  jsonld:
    serviceJsonLd({
      name: 'Ремонт грузового и коммерческого транспорта',
      description:
        'Ремонт ГАЗелей, лёгкого коммерческого и грузового транспорта в Воронеже: двигатели, КПП, редукторы, турбины, кузовной ремонт, шиномонтаж.',
      url: '/gruzovoy-servis/',
      price: 1200,
      type: 'Ремонт грузовых автомобилей'
    }) + faqJsonLd(faq),
  body
};
