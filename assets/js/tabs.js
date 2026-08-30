/**
 * tabs.js — доступные табы для [data-tabs] (используем для двух адресов).
 * Прогрессивное улучшение: без JS все панели видны и читаемы,
 * роли и скрытие появляются только после запуска скрипта.
 */
import { placeOf } from './analytics.js';

export function initTabs(root = document) {
  const groups = root.querySelectorAll('[data-tabs]');
  if (!groups.length) return;
  for (const group of groups) initOne(group);
}

function initOne(group) {
  const list = group.querySelector('[data-tablist]') || group;
  const tabs = Array.from(group.querySelectorAll('[data-tab]'));
  const panels = Array.from(group.querySelectorAll('[data-tabpanel]'));
  if (tabs.length < 2 || tabs.length !== panels.length) return;

  list.setAttribute('role', 'tablist');
  const label = group.dataset.tabsLabel;
  if (label) list.setAttribute('aria-label', label);

  tabs.forEach((tab, i) => {
    const panel = panels[i];
    const base = `${group.id || placeOf(group) || 'tabs'}-${i}`;
    if (!tab.id) tab.id = `tab-${base}`;
    if (!panel.id) panel.id = `panel-${base}`;

    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    if (tab.tagName === 'BUTTON') tab.type = 'button';

    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.setAttribute('tabindex', '0');
  });

  function select(i, { focus = false } = {}) {
    tabs.forEach((tab, k) => {
      const on = k === i;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.setAttribute('tabindex', on ? '0' : '-1');
      tab.classList.toggle('is-active', on);
      panels[k].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }

  // Активной становится панель, помеченная data-tab-active, иначе первая.
  const start = Math.max(0, tabs.findIndex((t) => t.dataset.tabActive !== undefined));
  select(start);

  list.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target.closest('[data-tab]') : null;
    const i = t ? tabs.indexOf(t) : -1;
    if (i < 0) return;
    e.preventDefault();
    select(i, { focus: true });
  });

  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const last = tabs.length - 1;
    let next = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = i === last ? 0 : i + 1;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = i === 0 ? last : i - 1;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = last;
    else return;

    e.preventDefault();
    select(next, { focus: true });
  });
}