import { PHONE, wa, script, SITE } from './_shared.js';

const body = `    <section class="section">
      <div class="container container--narrow text-center">
        <h1>Страница не найдена</h1>
        <p class="lead mx-auto mt-4">
          Такой страницы на сайте нет — возможно, ссылка устарела или в адресе
          опечатка. Ниже то, что нужно чаще всего.
        </p>

        <div class="cluster cluster--2 cluster--center mt-8" data-section="404">
          <a class="btn btn--primary btn--lg" href="/">На главную</a>
          <a class="btn btn--secondary btn--lg" href="/ceny/">Цены и прайс</a>
          <a class="btn btn--wa btn--lg" ${wa(
            'Здравствуйте! Пишу с сайта 100mashin.ru. Не нашёл нужную информацию на сайте. Вопрос: '
          )}>Спросить в WhatsApp</a>
        </div>

        <div class="grid-auto mt-12 text-start">
          <article class="card card--link">
            <h2 class="card__title card__title--sm"><a href="/uslugi/">Все услуги</a></h2>
            <p class="card__text">Ремонт двигателя, ГБЦ, турбин, КПП, ходовой, кузова.</p>
          </article>
          <article class="card card--link">
            <h2 class="card__title card__title--sm"><a href="/ceny/">Цены</a></h2>
            <p class="card__text">Прайс на 158 позиций, нормочас 1200 ₽, калькулятор.</p>
          </article>
          <article class="card card--link">
            <h2 class="card__title card__title--sm"><a href="/garantiya/">Гарантия</a></h2>
            <p class="card__text">Сроки по видам работ и условия обращения.</p>
          </article>
          <article class="card card--link">
            <h2 class="card__title card__title--sm"><a href="/kontakty/">Контакты</a></h2>
            <p class="card__text">Два адреса, телефоны, схема проезда, время работы.</p>
          </article>
        </div>

        <p class="mt-8">
          Не нашли нужное — позвоните:
          <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a>
        </p>
      </div>
    </section>
`;

export default {
  url: '/404.html',
  navKey: '404',
  title: 'Страница не найдена | 100 Машин Воронеж',
  description:
    'Запрошенная страница не найдена. Перейдите на главную или воспользуйтесь разделами: услуги, цены, гарантия, контакты автосервиса «100 Машин» в Воронеже.',
  robots: 'noindex, follow',
  jsonld: script({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Страница не найдена',
    isPartOf: { '@id': `${SITE}/#website` },
    inLanguage: 'ru-RU'
  }),
  body
};
