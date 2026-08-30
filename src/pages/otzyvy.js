import {
  PHONE, ORG, bookingBlock, faqBlock, faqJsonLd, wa, heroAside
} from './_shared.js';

const faq = [
  {
    q: 'Отзывы на сайте настоящие?',
    a: `<p>Да. Все цитаты взяты с Яндекс Карт, у каждой стоит ссылка на
        источник. Своих отзывов мы не пишем. Ниже встроен виджет Яндекса —
        он показывает отзывы напрямую из Карт, мы на них не влияем.</p>`
  },
  {
    q: 'Как оставить отзыв?',
    a: `<p>На Яндекс Картах, в карточке той площадки, где вы обслуживались —
        ссылки есть на этой странице. Отзыв помогает и нам, и тем, кто
        выбирает сервис.</p>`
  },
  {
    q: 'А если мне что-то не понравилось?',
    a: `<p>Позвоните <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a>
        или напишите в WhatsApp. Пока машина у нас, почти любую ситуацию можно
        исправить на месте. Если ошибка наша — переделаем по гарантии
        за свой счёт.</p>
        <p><a href="/garantiya/">Условия гарантии</a></p>`
  },
  {
    q: 'Можно посмотреть примеры работ?',
    a: `<p>Да, типовые ремонты с указанием сроков и стоимости работ собраны
        на странице <a href="/raboty/">Наши работы</a>. Фотографии цеха
        и машин есть в карточках обеих площадок на Яндекс Картах.</p>`
  }
];

const body = `    <section class="hero hero--split" data-section="hero">
      <div class="container hero__inner">
        <div class="hero__body">
          <p class="hero__eyebrow">
            <span class="hero__eyebrow-dot" aria-hidden="true"></span>
            Оценки и отзывы — с Яндекс Карт
          </p>
          <h1 class="hero__title">Отзывы клиентов</h1>
          <p class="hero__lead">
            Рейтинг 4,7 на Димитрова. Ниже — цитаты со ссылкой на источник
            и виджет Яндекса, где видно всё как есть, без нашего участия.
          </p>
          <div class="hero__actions" data-section="hero">
            <a class="btn btn--primary btn--lg" href="#vidzhet">Смотреть на Яндекс Картах</a>
            <a class="btn btn--secondary btn--lg" href="#zapis">Записаться на ремонт</a>
          </div>
        </div>

${heroAside({
          label: 'Оценка',
          title: '4,7 из 5',
          note: 'Рейтинг на Яндекс Картах по двум площадкам.',
          items: [
            '<b>120</b> оценок',
            '<b>61</b> отзыв',
            '<b>Фото</b> цеха и работ в карточках',
            'Все цитаты — со ссылкой на источник'
          ]
        })}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="rating-bar">
          <div class="rating-bar__score">
            <p class="rating-bar__num">4,7</p>
            <p class="rating-bar__stars" aria-label="Оценка 4,7 из 5">★★★★★</p>
            <p class="rating-bar__src">Яндекс Карты</p>
          </div>
          <dl class="rating-bar__facts">
            <div><dt>Оценок</dt><dd>120</dd></div>
            <div><dt>Отзывов</dt><dd>61</dd></div>
            <div><dt>Площадок</dt><dd>2</dd></div>
            <div><dt>На рынке</dt><dd>с 2018</dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="section section--muted">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">За что хвалят</p>
          <h2 class="section__title">Три темы повторяются чаще всего</h2>
          <p class="section__lead">
            Это не наши формулировки — так пишут клиенты, независимо друг
            от друга.
          </p>
        </div>

        <div class="themes">
          <article class="theme">
            <p class="theme__num">01</p>
            <h3 class="theme__title">Делают быстро</h3>
            <p class="theme__text">
              Для перевозчиков простой дороже ремонта, и это отмечают отдельно.
              Помогает свой склад запчастей: машина не ждёт поставку.
            </p>
          </article>
          <article class="theme">
            <p class="theme__num">02</p>
            <h3 class="theme__title">Не навязывают лишнее</h3>
            <p class="theme__text">
              Находят поломку — присылают фото или видео и спрашивают согласие.
              Работы, которые не согласовали, в счёт не попадают.
            </p>
          </article>
          <article class="theme">
            <p class="theme__num">03</p>
            <h3 class="theme__title">Выручают в дороге</h3>
            <p class="theme__text">
              Площадка на Димитрова рядом с выездом на М4 «Дон», поэтому
              транзитные поломки здесь — обычное дело. Принимают без записи.
            </p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Цитаты</p>
          <h2 class="section__title">Что пишут клиенты</h2>
        </div>

        <div class="quotes quotes--wide">
          <figure class="quote">
            <blockquote class="quote__text">
              Не первый год обслуживаемся. Я сам с организации, много сервисов
              где был. Бывает такое часто, что нужно быстро сделать ГАЗель,
              чтобы не сорвался рейс: звонишь, просишь — и тебя уже ждут
              с открытыми дверьми. Если в других сервисах говорили один
              и тот же ремонт сделать от двух до трёх недель, к ним
              приезжаешь — они делают этот же ремонт за 4 дня.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Андрей В.</span>
              <span class="quote__meta">автопарк ГАЗелей · декабрь 2025</span>
              <a class="quote__link" href="https://yandex.ru/maps/org/${ORG.dimitrova}/reviews/"
                 target="_blank" rel="noopener">Источник</a>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              В 5 утра сломался на платной дороге. Мастер-приёмщик до открытия
              вежливо сказал, что возьмут меня в работу в 9:00 — взяли
              в назначенное время и нашли поломку быстро: вырвало правый
              наружный ШРУС, Форд Фокус. Ребята быстро заказали запчасть,
              через 2 часа я был на колёсах и продолжил путь.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Михаил М.</span>
              <span class="quote__meta">трасса М4 «Дон» · октябрь 2025</span>
              <a class="quote__link" href="https://yandex.ru/maps/org/${ORG.truda}/reviews/"
                 target="_blank" rel="noopener">Источник</a>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              Ребята, знающие своё дело, обслуживаем у них газели. Чем нравится
              этот автосервис — так это что тебе не навяжут то, что не нужно.
              И особенно нравится, что если находят какую-то поломку,
              то отправляют видеоотчёт поломки.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Андрей Т.</span>
              <span class="quote__meta">январь 2026</span>
              <a class="quote__link" href="https://yandex.ru/maps/org/${ORG.dimitrova}/reviews/"
                 target="_blank" rel="noopener">Источник</a>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              Поменяли манжеты на рабочем цилиндре сцепления и прокачали
              сцепление за 45 минут! Работа хоть и не сложная, но другие СТО
              отказались делать, сославшись на то, что всё равно побежит.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Александр В.</span>
              <span class="quote__meta">январь 2023</span>
              <a class="quote__link" href="https://yandex.ru/maps/org/${ORG.dimitrova}/reviews/"
                 target="_blank" rel="noopener">Источник</a>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              Приехали в чужой город, порвало ремень генератора — нас без записи
              приняли, всё исправили. Тут действительно не всё равно на людей.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Виктория Ш.</span>
              <span class="quote__meta">январь 2025</span>
              <a class="quote__link" href="https://yandex.ru/maps/org/${ORG.dimitrova}/reviews/"
                 target="_blank" rel="noopener">Источник</a>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              Чинят коммерческий транспорт: газель, форд и так далее. Запчасти
              все в наличии. Работают с организациями — нал, безнал, НДС
              и без него. Привозят запчасти под заказ на любые авто
              и спецтехнику.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Андрей К.</span>
              <span class="quote__meta">2GIS</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="section section--chapter section--muted" id="vidzhet">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Первоисточник</p>
          <h2 class="section__title">Все отзывы на Яндекс Картах</h2>
          <p class="section__lead">
            Виджет показывает отзывы напрямую из Карт. Мы не можем их
            редактировать или удалять — что написали, то и видно.
          </p>
        </div>

        <div class="tabs" data-tabs data-tabs-label="Отзывы по адресам">
          <div class="tab-list" data-tablist>
            <button class="tab" type="button" data-tab data-tab-active>
              ул. Димитрова, 138
            </button>
            <button class="tab" type="button" data-tab>просп. Труда, 46И</button>
          </div>

          <div class="tab-panel" data-tabpanel>
            <h3 class="visually-hidden">Отзывы о площадке на улице Димитрова, 138</h3>
            <div class="reviews-widget">
              <iframe src="https://yandex.ru/maps-reviews-widget/${ORG.dimitrova}?comments"
                      loading="lazy"
                      title="Отзывы об автосервисе «СТО Машин», ул. Димитрова, 138, на Яндекс Картах"></iframe>
            </div>

          </div>

          <div class="tab-panel" data-tabpanel>
            <h3 class="visually-hidden">Отзывы о площадке на проспекте Труда, 46И</h3>
            <div class="reviews-widget">
              <iframe src="https://yandex.ru/maps-reviews-widget/${ORG.truda}?comments"
                      loading="lazy"
                      title="Отзывы об автосервисе «100 Машин», просп. Труда, 46И, на Яндекс Картах"></iframe>
            </div>

          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="callout callout--accent">
          <h2 class="callout__title">Если что-то пошло не так</h2>
          <p>
            Напишите или позвоните нам напрямую — почти любую ситуацию можно
            исправить, пока машина ещё у нас. Если виноваты мы, переделываем
            за свой счёт по гарантии.
          </p>
          <p class="cluster gap-2 flex-wrap">
            <a class="btn btn--wa" ${wa(
              'Здравствуйте! Пишу с сайта 100mashin.ru. Хочу сообщить о проблеме с обслуживанием: '
            )}>Написать в WhatsApp</a>
            <a class="btn btn--ghost btn--nowrap" href="${PHONE.booking.tel}">${PHONE.booking.display}</a>
            <a class="btn btn--ghost" href="/garantiya/">Условия гарантии</a>
          </p>
        </div>
      </div>
    </section>

${bookingBlock()}

${faqBlock(faq, { title: 'Вопросы про отзывы' })}
`;
export default {
  url: '/otzyvy/',
  navKey: 'otzyvy',
  title: 'Отзывы об автосервисе «100 Машин» в Воронеже',
  description:
    'Отзывы клиентов автосервиса «100 Машин» в Воронеже: рейтинг 4,7 на Яндекс Картах, 120 оценок. Живые отзывы со ссылками на первоисточник и виджет Яндекса.',
  priority: '0.8',
  trail: [{ name: 'Отзывы' }],
  jsonld: faqJsonLd(faq),
  body
};
