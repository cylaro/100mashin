/**
 * Предзагрузка тяжёлых блоков при приближении к ним.
 *
 * Карта Яндекса тянет около мегабайта, поэтому пока блок далеко, ничего
 * не грузим. Когда он подходит к экрану, подгружаем заранее — к моменту
 * прокрутки карта уже готова.
 *
 * Адрес виджета собирает map.js: мы нажимаем его триггер программно,
 * чтобы не дублировать эту логику.
 */
/** За сколько пикселей до появления блока начинать загрузку. */
const PRELOAD_MARGIN = '400px 0px';

/** При экономии трафика автозагрузку не делаем — остаётся клик. */
function prefersLightPage() {
  const c = navigator.connection;
  if (c?.saveData) return true;
  if (c?.effectiveType && /(^|-)2g$/.test(c.effectiveType)) return true;
  // Медиазапрос поддерживают не все браузеры, отсюда осторожная проверка.
  return window.matchMedia?.('(prefers-reduced-data: reduce)')?.matches === true;
}

/**
 * Подгружает карту в блоке: нажимает триггер, который навесил map.js.
 * @param {Element} box элемент [data-map]
 * @returns {boolean} удалось ли инициировать загрузку
 */
function preload(box) {
  if (box.dataset.mapLoaded === '1') return false;
  const trigger = box.querySelector('[data-map-trigger]');
  if (!trigger) return false;

    // До клика: обработчик может сработать синхронно.
  box.dataset.mapPreloaded = '1';
  trigger.click();
  return true;
}

export function initLazyBlocks(root = document) {
  const boxes = root.querySelectorAll('[data-map]');
  if (!boxes.length) return;

    // Без наблюдателя карта открывается по клику — рабочий сценарий.
  if (typeof IntersectionObserver !== 'function' || prefersLightPage()) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const box = entry.target;
        io.unobserve(box);
                // Цель MAP_OPEN отправляет map.js в обработчике клика.
        preload(box);
      }
    },
    { rootMargin: PRELOAD_MARGIN, threshold: 0 }
  );

  for (const box of boxes) {
    if (box.dataset.mapLoaded === '1' || box.dataset.mapPreloaded === '1') continue;
    io.observe(box);
  }
}
