import {
  PHONE, NORMOCHAS, orgJsonLd, faqJsonLd, faqBlock, locationsBlock,
  bookingBlock, ctaBand, honestyBlock, wa, route, COORDS, ORG
} from './_shared.js';

const faq = [
  {
    q: 'Сколько стоит нормочас и есть ли наценка за иномарку?',
    a: `<p>На площадке на проспекте Труда нормочас —
        <strong>${NORMOCHAS}&nbsp;₽</strong>. Наценки за иномарку нет:
        сложность операции уже заложена в её трудоёмкости. Для сравнения,
        в Воронеже ставка для иномарок в независимых сервисах обычно
        1250–1350&nbsp;₽, у специализированных и дилерских — 2100–2700&nbsp;₽.</p>
        <p><a href="/ceny/">Полный прайс на 158 позиций</a></p>`
  },
  {
    q: 'Даёте гарантию, если запчасть я привёз сам?',
    a: `<p>Да. Гарантия на нашу работу действует независимо от того, чьи
        запчасти. На саму деталь, которую вы привезли, гарантию дать не можем —
        мы не знаем её происхождения. Если деталь покупали у нас, действует
        ещё и гарантия на неё.</p>
        <p><a href="/garantiya/">Условия гарантии по видам работ</a></p>`
  },
  {
    q: 'Что если в процессе ремонта найдёте ещё поломку?',
    a: `<p>Позвоним, покажем фото или видео и назовём цену. Работы, которые
        мы не согласовали с вами, вы не оплачиваете. Итоговая сумма в
        заказ-наряде без вашего согласия не меняется.</p>`
  },
  {
    q: 'Нужно ли записываться заранее?',
    a: `<p>Желательно — так не придётся ждать свободный подъёмник, и мы заранее
        подготовим запчасти. Но в аварийных ситуациях принимаем и без записи:
        если сломались в дороге, звоните
        <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a>, разберёмся.</p>`
  },
  {
    q: 'Ремонтируете грузовые и ГАЗели?',
    a: `<p>Да, это одно из основных направлений. Обслуживаем ГАЗели, лёгкий
        коммерческий и грузовой транспорт, автопарки организаций. Работаем по
        договору, с НДС и без, запчасти на ГАЗ держим на складе.</p>
        <p><a href="/gruzovoy-servis/">Грузовой сервис</a> ·
        <a href="/yuridicheskim-licam/">Юридическим лицам</a></p>`
  },
  {
    q: 'Сломался на трассе М4 — поможете?',
    a: `<p>Поможем. Площадка на Димитрова стоит рядом с выездом на М4 «Дон»,
        и такие обращения у нас регулярные: помогаем организовать эвакуатор,
        принимаем без записи, стараемся сделать в день обращения, чтобы вы
        поехали дальше.</p>`
  },
  {
    q: 'Работаете в выходные?',
    a: `<p>Пн–Пт с 9:00 до 19:00, в субботу до 18:00. Воскресенье — выходной.
        В аварийной ситуации звоните: постараемся принять и без записи.</p>`
  },
  {
    q: 'Можно ли получить документы для организации?',
    a: `<p>Да. ООО «СТО МАШИН» работает на общей системе налогообложения,
        поэтому выдаём полный комплект: счёт, акт, счёт-фактуру с НДС.
        Есть опыт исполнения госконтрактов.</p>`
  }
];

const body = `    <section class="hero hero--split" data-section="hero">
      <div class="container hero__inner">
        <div class="hero__body">
          <p class="hero__eyebrow">
            <span class="hero__eyebrow-dot" aria-hidden="true"></span>
            Работаем в Воронеже с 2018 года
          </p>

          <h1 class="hero__title">
            Автосервис, где сумму называют <em>до ремонта</em>, а не после
          </h1>

          <p class="hero__lead">
            Двигатели, ГБЦ и турбины, ходовая, КПП, кузов. Легковые, ГАЗели
            и грузовые. Смету согласуем заранее и без вашего согласия
            в неё ничего не добавляем.
          </p>

          <div class="hero__actions" data-section="hero">
            <a class="btn btn--primary btn--lg" href="#zapis">Записаться на ремонт</a>
            <a class="btn btn--wa btn--lg" ${wa('Здравствуйте! Пишу с сайта 100mashin.ru. Нужна консультация по ремонту. Авто: ')}>
              Спросить в WhatsApp
            </a>
          </div>

          <ul class="hero__trust" role="list">
            <li><b>с 2018</b><span>работаем в Воронеже</span></li>
            <li><b>17</b><span>мастеров в двух цехах</span></li>
            <li><b>4,7</b><span>рейтинг на Яндекс Картах</span></li>
          </ul>
        </div>

        <div class="hero-card">
          <div class="hero-rate">
            <span class="hero-rate__label">Нормочас</span>
            <p class="hero-rate__value">
              1200<span class="hero-rate__cur">₽</span>
            </p>
            <p class="hero-rate__note">
              Ставка на площадке на проспекте Труда. Одна для отечественных
              и иномарок — наценки за марку нет.
            </p>
          </div>

          <ul class="hero-card__list" role="list">
            <li>Заказ-наряд со сметой <b>до начала работ</b></li>
            <li>Нашли ещё поломку — сначала <b>звоним и показываем фото</b></li>
            <li>Запчасти на выбор: оригинал или аналог</li>
            <li>Со своими запчастями работаем, гарантия на работу остаётся</li>
          </ul>

          <p class="hero-card__foot">
            <span class="hero-card__score">
              4,7 <span class="hero-card__stars" aria-hidden="true">★★★★★</span>
            </span>
            <span class="hero-card__meta">120 оценок</span>
            <a href="https://yandex.ru/maps/org/${ORG.dimitrova}/reviews/"
               target="_blank" rel="noopener">Отзывы на Яндекс Картах</a>
          </p>
        </div>
      </div>
    </section>

    <section class="section section--muted" id="uslugi">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Специализация</p>
          <h2 class="section__title">Три направления, на которых держится сервис</h2>
          <p class="section__lead">
            Здесь у нас своё оборудование и наработанный опыт — эти работы
            не отдаём на сторону и не учимся на вашей машине.
          </p>
        </div>

        <div class="dirs">
          <article class="dir">
            <p class="dir__num">01</p>
            <h3 class="dir__title"><a href="/uslugi/remont-dvigatelya/">Двигатели</a></h3>
            <p class="dir__text">
              Капремонт с дефектовкой и фотоотчётом, расточка блока, шлифовка
              коленвала, гильзовка. Показываем износ, а не только счёт.
            </p>
            <p class="dir__price">от 15 000 ₽ <span>за работу</span></p>
          </article>

          <article class="dir">
            <p class="dir__num">02</p>
            <h3 class="dir__title"><a href="/uslugi/remont-gbc/">Головки блока</a></h3>
            <p class="dir__text">
              Опрессовка под давлением, фрезеровка плоскости, направляющие
              и клапаны. Станочные операции делаем у себя, без поездок к смежникам.
            </p>
            <p class="dir__price">от 6 000 ₽ <span>за работу</span></p>
          </article>

          <article class="dir">
            <p class="dir__num">03</p>
            <h3 class="dir__title"><a href="/uslugi/remont-turbin/">Турбины</a></h3>
            <p class="dir__text">
              Легковые и грузовые, ремонт вестгейта, балансировка картриджа.
              Сначала ищем причину, иначе новая турбина умрёт так же.
            </p>
            <p class="dir__price">от 9 000 ₽ <span>диагностика снятой — бесплатно</span></p>
          </article>
        </div>

        <h3 class="mt-12 text-sm text-muted fw-semibold">Остальные работы</h3>
        <ul class="dirs-more" role="list">
          <li><a href="/uslugi/diagnostika/">Диагностика · от 990 ₽</a></li>
          <li><a href="/uslugi/to/">ТО · от 1 500 ₽</a></li>
          <li><a href="/uslugi/zamena-grm/">Замена ГРМ · от 3 000 ₽</a></li>
          <li><a href="/uslugi/transmissiya/">КПП и сцепление · от 6 000 ₽</a></li>
          <li><a href="/uslugi/hodovaya-tormoza/">Ходовая и тормоза · от 400 ₽</a></li>
          <li><a href="/uslugi/remont-forsunok/">Форсунки · от 1 200 ₽</a></li>
          <li><a href="/uslugi/udalenie-katalizatora/">Катализатор и EGR</a></li>
          <li><a href="/uslugi/elektrika/">Электрика · от 990 ₽</a></li>
          <li><a href="/uslugi/konditsioner/">Кондиционер · от 1 500 ₽</a></li>
          <li><a href="/uslugi/kuzovnoy-remont/">Кузов и покраска · от 1 500 ₽</a></li>
          <li><a href="/uslugi/avtostekla/">Автостёкла · от 1 900 ₽</a></li>
          <li><a href="/uslugi/shinomontazh/">Шиномонтаж · от 2 000 ₽</a></li>
        </ul>

        <p class="mt-8">
          <a class="btn btn--secondary" href="/uslugi/">Все услуги подробно</a>
        </p>
      </div>
    </section>
    <section class="section section--chapter" id="pochemu">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Откуда берётся сумма</p>
          <h2 class="section__title">Цену можно проверить на калькуляторе</h2>
          <p class="section__lead">
            Стоимость работы — это ставка нормочаса, умноженная на нормативную
            трудоёмкость операции. Никакой оценки «на глаз».
          </p>
        </div>

        <div class="calc-demo">
          <div>
            <p class="formula">
              <span class="formula__item">
                <span class="formula__label">Нормочас</span>
                <span class="formula__value">1 200 ₽</span>
              </span>
              <span class="formula__op" aria-hidden="true">×</span>
              <span class="formula__item">
                <span class="formula__label">Замена колодок</span>
                <span class="formula__value">0,5 ч</span>
              </span>
              <span class="formula__op" aria-hidden="true">=</span>
              <span class="formula__item formula__item--result">
                <span class="formula__label">Работа</span>
                <span class="formula__value">600 ₽</span>
              </span>
            </p>
            <p class="disclaimer mt-4">
              Плюс стоимость самих колодок — её вы видите в заказ-наряде
              отдельной строкой и можете выбрать между оригиналом и аналогом.
            </p>
          </div>

          <div class="prose">
            <h3 class="mt-0">Почему это важно</h3>
            <p>
              Такой расчёт можно повторить самому и сверить с прайсом. Именно
              поэтому мы называем сумму до ремонта и фиксируем её в заказ-наряде —
              без вашего согласия она не меняется.
            </p>
            <p>
              Ставка не зависит от марки: сложность уже заложена в трудоёмкости,
              добавлять к ней ещё и повышенный тариф — двойной счёт.
            </p>
            <p class="cluster gap-2 flex-wrap">
              <a class="btn btn--secondary" href="/ceny/">Прайс и калькулятор</a>
              <a class="btn btn--ghost" href="/garantiya/">Условия гарантии</a>
            </p>
          </div>
        </div>

        <div class="figures mt-12">
          <div class="figure">
            <p class="figure__num">7<span> лет</span></p>
            <p class="figure__label">в Воронеже, с сентября 2018 года</p>
          </div>
          <div class="figure">
            <p class="figure__num">17</p>
            <p class="figure__label">мастеров в двух цехах</p>
          </div>
          <div class="figure">
            <p class="figure__num">4,7</p>
            <p class="figure__label">на Яндекс Картах, 120 оценок</p>
          </div>
          <div class="figure">
            <p class="figure__num">158</p>
            <p class="figure__label">позиций в открытом прайсе</p>
          </div>
        </div>

        <div class="callout callout--accent mt-12">
          <h3 class="callout__title">Отдельное направление — коммерческий транспорт</h3>
          <p>
            ГАЗели, лёгкий коммерческий и грузовой. Запчасти на ГАЗ держим
            в своём магазине, поэтому машина не ждёт поставку. Работаем
            по договору, выдаём документы с НДС, есть опыт госконтрактов.
          </p>
          <p class="cluster gap-2 flex-wrap">
            <a class="btn btn--secondary btn--sm" href="/gruzovoy-servis/">Грузовой сервис</a>
            <a class="btn btn--ghost btn--sm" href="/yuridicheskim-licam/">Юридическим лицам</a>
          </p>
        </div>
      </div>
    </section>
${honestyBlock()}

    <section class="section section--steel section--chapter" id="otzyvy">
      <div class="container">
        <div class="section__head">
          <p class="section__kicker">Отзывы</p>
          <h2 class="section__title">Рейтинг 4,7 при 120 оценках</h2>
          <p class="section__lead">
            Цитаты ниже — с Яндекс Карт, у каждой есть ссылка на источник.
            Своих отзывов мы не пишем.
          </p>
        </div>

        <div class="quotes">
          <figure class="quote">
            <blockquote class="quote__text">
              Если в других сервисах говорили один и тот же ремонт сделать
              от двух до трёх недель, к ним приезжаешь — они делают этот же
              ремонт за 4 дня. Всё налажено, запчасти тоже всегда в наличии.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Андрей В.</span>
              <span class="quote__meta">автопарк ГАЗелей · декабрь 2025</span>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              Сломался на платной дороге, вырвало правый наружный ШРУС.
              Ребята быстро заказали запчасть — через 2 часа я был на колёсах
              и продолжил путь.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Михаил М.</span>
              <span class="quote__meta">трасса М4 «Дон» · октябрь 2025</span>
            </figcaption>
          </figure>

          <figure class="quote">
            <blockquote class="quote__text">
              Чем нравится этот автосервис — тебе не навяжут то, что не нужно.
              И особенно нравится, что если находят какую-то поломку,
              то отправляют видеоотчёт.
            </blockquote>
            <figcaption class="quote__foot">
              <span class="quote__author">Андрей Т.</span>
              <span class="quote__meta">январь 2026</span>
            </figcaption>
          </figure>
        </div>

        <p class="cluster gap-2 flex-wrap mt-8">
          <a class="btn btn--secondary" href="/otzyvy/">Читать отзывы</a>
          <a class="btn btn--ghost" href="https://yandex.ru/maps/org/21684761945/reviews/"
             target="_blank" rel="noopener">Проверить на Яндекс Картах</a>
        </p>
      </div>
    </section>
${ctaBand()}

${locationsBlock()}

${bookingBlock()}

${faqBlock(faq)}
`;

export default {
  url: '/',
  navKey: 'home',
  title: 'Автосервис «100 Машин» в Воронеже — нормочас 1200 ₽',
  description:
    'Ремонт двигателей, ГБЦ, турбин, ходовой и кузова в Воронеже. Нормочас 1200 ₽ на все марки, смета до начала работ, гарантия. Два адреса, грузовой сервис. Запись: +7 (920) 448-00-04.',
  priority: '1.0',
  changefreq: 'weekly',
  jsonld: orgJsonLd() + faqJsonLd(faq),
  body
};
