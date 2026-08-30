/**
 * _service-page.js — конструктор страницы услуги.
 * Все страницы услуг единообразны по структуре, но с уникальным содержанием:
 * шаблонные тексты-«рыбу» не используем, у каждой услуги свои признаки
 * неисправности, состав работ и вопросы.
 */
import {
  PHONE, NORMOCHAS, serviceJsonLd, faqJsonLd, faqBlock,
  bookingBlock, ctaBand, wa, heroAside
} from './_shared.js';

/**
 * @param {object} o
 * @param {string} o.slug        адрес без /uslugi/
 * @param {string} o.h1          заголовок страницы
 * @param {string} o.title       <title>
 * @param {string} o.description описание
 * @param {string} o.lead        вводный абзац
 * @param {string} o.priceFrom   цена «от» для карточки и разметки
 * @param {string} [o.priceNote] подпись к цене
 * @param {string[]} o.symptoms  признаки, с которыми обращаются
 * @param {Array} o.works        состав работ: {name, price, note?}
 * @param {string} o.howText     как мы делаем — абзацы HTML
 * @param {Array} o.faq          вопросы
 * @param {string} [o.extra]     дополнительные секции HTML
 * @param {string} o.navKey      ключ активного пункта меню
 */
export function servicePage(o) {
  const url = `/uslugi/${o.slug}/`;

  const symptoms = o.symptoms
    .map((s) => `            <li>${s}</li>`)
    .join('\n');

  const works = o.works
    .map(
      (w) => `              <tr>
                <th scope="row">${w.name}${
                  w.note ? `<span class="table__note">${w.note}</span>` : ''
                }</th>
                <td class="table__num">${w.price}</td>
              </tr>`
    )
    .join('\n');

  const body = `    <section class="hero hero--split" data-section="hero">
      <div class="container hero__inner">
        <div class="hero__body">
          <h1 class="hero__title">${o.h1}</h1>
          <p class="hero__lead">${o.lead}</p>

          <div class="hero__actions" data-section="hero">
            <a class="btn btn--primary btn--lg" href="#zapis">Записаться</a>
            <a class="btn btn--wa btn--lg" ${wa(
              `Здравствуйте! Пишу с сайта 100mashin.ru. Нужна услуга: ${o.h1}. Авто: `
            )}>Спросить в WhatsApp</a>
          </div>

          <ul class="hero__trust" role="list">
            <li><b>${o.priceFrom}</b><span>${o.priceNote || 'за работу'}</span></li>
            <li><b>${NORMOCHAS}&nbsp;₽</b><span>нормочас</span></li>
            <li><b>Смета</b><span>до начала работ</span></li>
          </ul>
        </div>

${heroAside({
  label: 'С чем обращаются',
  title: o.asideTitle || 'Типичные признаки',
  note: o.asideNote || 'Похожие симптомы бывают у разных неисправностей — точную причину покажет диагностика.',
  items: o.symptoms.slice(0, 4),
  foot: 'Полный список признаков — ниже на странице'
})}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split split--tight split--stretch">
          <div class="prose">
            <h2>С чем обращаются</h2>
            <ul class="usp-list usp-list--minus" role="list">
${symptoms}
            </ul>
            <p class="disclaimer">
              Похожие симптомы бывают у разных неисправностей. Точную причину
              показывает диагностика — до неё мы не берёмся называть итоговую
              сумму, чтобы не обманывать.
            </p>
          </div>

          <div class="callout callout--info">
            <h2 class="callout__title">Как узнать цену заранее</h2>
            <p>
              Опишите симптомы и модель авто в WhatsApp — назовём вилку цены
              и срок ещё до приезда. Это бесплатно и ни к чему не обязывает.
            </p>
            <p>
              <a class="btn btn--wa" ${wa(
                `Здравствуйте! Пишу с сайта 100mashin.ru. Вопрос по услуге «${o.h1}». Авто: `
              )}>Описать проблему</a>
            </p>
            <p class="text-sm">
              Или позвоните: <a href="${PHONE.booking.tel}">${PHONE.booking.display}</a>
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--muted" id="ceny">
      <div class="container">
        <div class="section__head">
          <h2 class="section__title">Цены на работы</h2>
          <p class="section__lead">
            Указана стоимость работы без запчастей и расходных материалов.
            Позиции с пометкой «оценка» рассчитаны по нормочасу и трудоёмкости.
          </p>
        </div>

        <div class="table-scroll">
          <table class="table">
            <caption class="visually-hidden">${o.h1}: стоимость работ</caption>
            <thead>
              <tr>
                <th scope="col">Работа</th>
                <th scope="col" class="table__num">Цена</th>
              </tr>
            </thead>
            <tbody>
${works}
            </tbody>
          </table>
        </div>

        <p class="disclaimer mt-6">
          Цены не являются публичной офертой (ст. 437 ГК РФ). Полный прайс на
          158 позиций — на странице <a href="/ceny/">Цены</a>, там же
          калькулятор предварительной оценки.
        </p>
      </div>
    </section>

    <section class="section section--chapter">
      <div class="container">
        <div class="prose">
          <h2>Как мы это делаем</h2>
${o.howText}
          <p>
            На работы даём гарантию — срок зависит от вида ремонта и указан на
            странице <a href="/garantiya/">Гарантия</a>. Гарантия на работу
            действует и в том случае, если запчасть вы привезли свою.
          </p>
        </div>
      </div>
    </section>
${o.extra || ''}
${ctaBand({
  title: 'Не уверены, что нужен именно этот ремонт?',
  text: 'Пришлите симптомы и фото — посмотрим и скажем, что проверять в первую очередь. Возможно, обойдётесь меньшими работами.',
  waText: `Здравствуйте! Пишу с сайта 100mashin.ru. Сомневаюсь, нужен ли ремонт: ${o.h1}. Опишу симптомы: `
})}

${bookingBlock({ service: o.h1 })}

${faqBlock(o.faq, { title: `Вопросы про ${o.faqTopic || o.h1.toLowerCase()}` })}
`;

  return {
    url,
    navKey: o.navKey,
    title: o.title,
    description: o.description,
    priority: '0.8',
    trail: [{ name: 'Услуги', href: '/uslugi/' }, { name: o.crumb || o.h1 }],
    jsonld:
      serviceJsonLd({
        name: o.h1,
        description: o.description,
        url,
        price: o.priceValue,
        type: o.serviceType
      }) + faqJsonLd(o.faq),
    body
  };
}
