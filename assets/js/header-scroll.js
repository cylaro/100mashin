/**
 * Шапка уезжает вверх при прокрутке вниз и возвращается при прокрутке вверх.
 * На узком экране это отдаёт содержимому ещё около 56px по вертикали,
 * но при движении вверх шапка сразу под рукой.
 *
 * Работает только до 64rem: на широком экране места достаточно.
 */
const BREAKPOINT = '(max-width: 63.99rem)';

/** Ниже этого сдвига шапку не трогаем — иначе она дёргается у самого верха. */
const THRESHOLD = 64;

export function initHeaderScroll(root = document) {
  const header = root.querySelector('.header');
  if (!header) return;

  const html = document.documentElement;
  const mq = window.matchMedia?.(BREAKPOINT);
  if (!mq) return;

  let last = window.scrollY;
  let ticking = false;

  function update() {
    ticking = false;

    // На широком экране и при открытом меню шапка всегда на месте.
    if (!mq.matches || html.classList.contains('is-nav-open')) {
      html.classList.remove('is-header-hidden');
      last = window.scrollY;
      return;
    }

    const y = window.scrollY;
    const delta = y - last;

    // Игнорируем мелкие колебания и инерционный отскок за пределами страницы.
    if (Math.abs(delta) < 6 || y < 0) return;

    if (y > THRESHOLD && delta > 0) {
      html.classList.add('is-header-hidden');
    } else if (delta < 0) {
      html.classList.remove('is-header-hidden');
    }

    last = y;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );

  // Возврат к началу страницы всегда показывает шапку.
  window.addEventListener('pageshow', () => {
    html.classList.remove('is-header-hidden');
    last = window.scrollY;
  });

  mq.addEventListener?.('change', () => {
    html.classList.remove('is-header-hidden');
    last = window.scrollY;
  });
}
