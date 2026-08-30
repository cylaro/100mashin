import { PHONE, wa } from './_shared.js';

const body = `    <section class="section">
      <div class="container container--narrow text-center">
        <h1>Спасибо за обращение</h1>
        <p class="lead mx-auto mt-4">
          Мы получили вашу заявку и свяжемся в рабочее время: Пн–Сб с 9:00 до
          19:00. Если вопрос срочный — позвоните, ответим сразу.
        </p>

        <div class="cluster cluster--2 cluster--center mt-8" data-section="thanks">
          <a class="btn btn--primary btn--lg btn--nowrap" href="${PHONE.booking.tel}">
            ${PHONE.booking.display}
          </a>
          <a class="btn btn--wa btn--lg" ${wa(
            'Здравствуйте! Пишу с сайта 100mashin.ru. Отправлял заявку, хочу уточнить: '
          )}>Написать в WhatsApp</a>
        </div>

        <div class="callout callout--accent mt-12 text-start">
          <h2 class="callout__title">Пока ждёте — может быть полезно</h2>
          <ul class="usp-list" role="list">
            <li><a href="/ceny/">Прайс и калькулятор стоимости</a> — 158 позиций</li>
            <li><a href="/garantiya/">Условия гарантии</a> — сроки по видам работ</li>
            <li><a href="/kontakty/">Как добраться</a> — схема проезда к обеим площадкам</li>
            <li><a href="/otzyvy/">Отзывы</a> — 4,7 на Яндекс Картах</li>
          </ul>
        </div>

        <p class="mt-8"><a href="/">Вернуться на главную</a></p>
      </div>
    </section>
`;

export default {
  url: '/spasibo/',
  navKey: 'spasibo',
  title: 'Спасибо за обращение | 100 Машин Воронеж',
  description:
    'Заявка получена. Автосервис «100 Машин» в Воронеже свяжется с вами в рабочее время: Пн–Сб с 9:00 до 19:00.',
  robots: 'noindex, nofollow',
  priority: '0.1',
  trail: [{ name: 'Спасибо' }],
  body
};
