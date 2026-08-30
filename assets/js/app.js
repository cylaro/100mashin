/**
 * app.js — единственная точка входа. Подключается один раз на всех страницах:
 *   <script type="module" src="/assets/js/app.js"></script>
 *
 * Каждый инициализатор сам проверяет наличие своих элементов, а здесь ещё и
 * обёрнут в try/catch: сбой одного компонента не должен ломать остальные.
 */
import { initAnalytics } from './analytics.js';
import { initNav } from './nav.js';
import { initDeeplinks } from './deeplinks.js';
import { initForms } from './form.js';
import { initBooking } from './booking.js';
import { initPrices } from './prices.js';
import { initCalc } from './calc.js';
import { initMaps } from './map.js';
import { initLazyBlocks } from './lazyblock.js';
import { initTabs } from './tabs.js';

/** Запускает init и глушит его ошибку, оставив след в консоли. */
function safe(name, fn) {
  try {
    const r = fn();
    // Асинхронные модули (прайс, калькулятор) не должны ронять страницу.
    if (r && typeof r.catch === 'function') r.catch((err) => console.warn(`[app] ${name}:`, err));
  } catch (err) {
    console.warn(`[app] ${name}:`, err);
  }
}

/** Год в подвале: [data-year]. */
function fillYear(root) {
  const year = String(new Date().getFullYear());
  for (const el of root.querySelectorAll('[data-year]')) el.textContent = year;
}

function boot() {
  const root = document;
  safe('year', () => fillYear(root));
  safe('analytics', () => initAnalytics(root));
  safe('nav', () => initNav(root));
  safe('deeplinks', () => initDeeplinks(root));
  safe('tabs', () => initTabs(root));
  safe('forms', () => initForms(root));
  safe('booking', () => initBooking(root));
  safe('maps', () => initMaps(root));
  // Строго после initMaps: наблюдатель нажимает триггер, который тот навесил.
  safe('lazyblocks', () => initLazyBlocks(root));
  safe('prices', () => initPrices(root));
  safe('calc', () => initCalc(root));
}

// Модули отложены по умолчанию, но перестраховываемся для раннего исполнения.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}