/* Single navigation, brand, breadcrumb and hero layer for Quran MP3. */
(() => {
  'use strict';
  const script = document.currentScript;
  const base = new URL('../../', script?.src || document.baseURI);
  const parts = location.pathname.replace(base.pathname, '').split('/').filter(Boolean);
  const page = parts.at(-1) || 'index.html';
  const section = parts[0] === 'catalog'
    ? (parts[1] === 'readers' ? 'readers.html' : parts[1] === 'riwayat' ? 'riwayat.html' : 'mushafs.html')
    : parts[0] === 'readers' || page === 'reciter.html' ? 'readers.html'
    : parts[0] === 'riwayat' || page === 'riwaya.html' ? 'riwayat.html'
    : parts[0] === 'mushafs' || page === 'mushaf.html' || page === 'surah.html' ? 'mushafs.html'
    : page.startsWith('adhkar-') ? 'adhkar.html' : page;
  const pages = [
    ['index.html', '⌂', 'الرئيسية'], ['readers.html', '♫', 'القراء'],
    ['riwayat.html', '☷', 'الروايات'], ['quran.html', '﴿', 'المصحف الرقمي'],
    ['mushafs.html', '▤', 'المصاحف'], ['memorize.html', '◎', 'الحفظ والمراجعة'],
    ['adhkar.html', '☀', 'الأذكار'], ['prayer-times.html', '◷', 'مواقيت الصلاة'],
    ['ruqyah.html', '✧', 'الرقية الشرعية']
  ];
  const url = path => new URL(path, base).href;
  const titleFor = path => pages.find(item => item[0] === path)?.[2] || 'المكتبة';
  const home = page === 'index.html' && parts.length <= 1;

  function ensureStylesheet() {
    const target = url('assets/css/site-shell.css');
    const has = [...document.querySelectorAll('link[rel="stylesheet"]')]
      .some(link => link.href.split('?')[0] === target);
    if (!has) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = target + '?v=20261013-visual';
      document.head.append(link);
    }
  }
  function makeMenu() {
    return pages.map(([path, symbol, title]) =>
      '<a href="' + url(path) + '"' + (section === path ? ' aria-current="page"' : '') +
      '><span class="nav-icon" aria-hidden="true">' + symbol +
      '</span><span>' + title + '</span></a>').join('');
  }
  function standardizeBrand(header) {
    const brand = header.querySelector('.brand');
    if (!brand) return;
    brand.href = url('index.html');
    brand.setAttribute('aria-label', 'مكتبة القرآن الصوتية - الرئيسية');
    brand.querySelectorAll('.brand-mark').forEach(mark => mark.remove());
    let img = brand.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      brand.prepend(img);
    }
    img.src = url('assets/icons/quran.png');
    img.alt = '';
    img.width = 40;
    img.height = 40;
    img.classList.add('qmp3-brand-icon');
    let label = brand.querySelector('.brand-text');
    if (!label) {
      label = document.createElement('span');
      label.className = 'brand-text';
      brand.append(label);
    }
    label.innerHTML = 'مكتبة القرآن <b>الصوتية</b>';
    for (const node of [...brand.childNodes]) {
      if (node !== img && node !== label) node.remove();
    }
  }
  function wireMenu(header, nav, toggle) {
    const setOpen = open => {
      nav.classList.toggle('open', open);
      nav.classList.toggle('qmp3-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إغلاق قائمة التنقل' : 'فتح قائمة التنقل');
    };
    // These page controllers already own the click and closing behavior.
    const hasPageController = ['index.html','ruqyah.html','adhkar.html','prayer-times.html'].includes(page) &&
      header.dataset.qmp3Generated !== '1';
    if (!hasPageController) {
      toggle.addEventListener('click', event => {
        event.stopPropagation();
        setOpen(!nav.classList.contains('open'));
      });
    }
    document.addEventListener('pointerdown', event => {
      if (!header.contains(event.target) && nav.classList.contains('open')) setOpen(false);
    });
    window.addEventListener('scroll', () => {
      if (nav.classList.contains('open')) setOpen(false);
    }, { passive: true });
    window.addEventListener('resize', () => {
      if (innerWidth > 1320 && nav.classList.contains('open')) setOpen(false);
    }, { passive: true });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.focus();
      }
    });
    nav.addEventListener('click', event => {
      if (event.target.closest('a')) setOpen(false);
    });
  }
  function standardizeHeader() {
    let header = document.querySelector('.site-header, header.top');
    if (!header) {
      header = document.createElement('header');
      document.body.prepend(header);
    }
    let nav = header.querySelector('#mainNav');
    if (!nav) {
      header.dataset.qmp3Generated = '1';
      header.innerHTML = '<div class="container header-inner"><a class="brand" href="' + url('index.html') +
        '"><img class="qmp3-brand-icon" src="' + url('assets/icons/quran.png') +
        '" width="40" height="40" alt=""><span class="brand-text">مكتبة القرآن <b>الصوتية</b></span></a>' +
        '<nav class="main-nav" id="mainNav" aria-label="التنقل الرئيسي">' + makeMenu() +
        '</nav><button class="nav-toggle" id="navToggle" type="button" aria-controls="mainNav" aria-expanded="false" aria-label="فتح قائمة التنقل">☰</button></div>';
      nav = header.querySelector('#mainNav');
    } else {
      for (const [path, symbol, title] of pages) {
        let anchor = [...nav.querySelectorAll('a[href]')].find(a => {
          try { return new URL(a.getAttribute('href'), document.baseURI).pathname === new URL(path, base).pathname; }
          catch { return false; }
        });
        if (!anchor) {
          anchor = document.createElement('a');
          anchor.href = url(path);
          anchor.innerHTML = '<span class="nav-icon" aria-hidden="true">' + symbol + '</span><span>' + title + '</span>';
          nav.append(anchor);
        }
        if (section === path) anchor.setAttribute('aria-current', 'page');
        else anchor.removeAttribute('aria-current');
      }
    }
    header.classList.remove('top');
    header.classList.add('site-header', 'qmp3-site-header');
    standardizeBrand(header);
    nav.setAttribute('aria-label', 'التنقل الرئيسي');
    const inner = header.querySelector('.header-inner') || header;
    let toggle = header.querySelector('#navToggle');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.id = 'navToggle';
      toggle.type = 'button';
      toggle.className = 'nav-toggle';
      toggle.textContent = '☰';
      inner.append(toggle);
    }
    toggle.classList.add('nav-toggle');
    toggle.setAttribute('aria-controls', 'mainNav');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'فتح قائمة التنقل');
    document.querySelectorAll('.qmp3-global-nav').forEach(duplicate => duplicate.remove());
    wireMenu(header, nav, toggle);
    return header;
  }
  function addBreadcrumb(header, main) {
    if (home || document.querySelector('.qmp3-breadcrumb')) return;
    const crumbs = document.createElement('nav');
    crumbs.className = 'qmp3-breadcrumb';
    crumbs.setAttribute('aria-label', 'مسار التنقل');
    function item(label, href) {
      const el = document.createElement(href ? 'a' : 'span');
      el.textContent = label;
      if (href) el.href = url(href);
      else el.setAttribute('aria-current', 'page');
      crumbs.append(el);
    }
    function divider() {
      const sep = document.createElement('span');
      sep.className = 'bc-separator';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '/';
      crumbs.append(sep);
    }
    item('الرئيسية', 'index.html');
    if (section !== page || parts.length > 1) {
      divider();
      item(titleFor(section), section);
    }
    divider();
    const heading = main?.querySelector('h1')?.textContent.trim() || document.title.split('|')[0].trim();
    item(heading || titleFor(section));
    header.after(crumbs);
  }
  function standardizeHero(main) {
    if (!main) return;
    let hero = main.querySelector(':scope > .hero, :scope > .prayer-hero, :scope > .rq-hero, :scope > .adhkar-hero, :scope > .intro, :scope > .page-hero, :scope > .memorize-hero');
    if (!hero) hero = main.querySelector('.hero, .prayer-hero, .rq-hero, .adhkar-hero, .memorize-hero, .intro, .page-hero');
    if (!hero) {
      const h1 = main.querySelector(':scope > h1');
      hero = document.createElement('section');
      hero.className = 'qmp3-generated-hero';
      const inner = document.createElement('div');
      inner.className = 'container';
      hero.append(inner);
      main.prepend(hero);
      if (h1) {
        inner.append(h1);
        const description = hero.nextElementSibling;
        if (description?.tagName === 'P') inner.append(description);
      } else {
        const heading = document.createElement('p');
        heading.className = 'qmp3-hero-title';
        heading.textContent = document.title.split('|')[0].trim();
        inner.append(heading);
      }
    }
    hero.classList.add('qmp3-unified-hero');
  }
  function initialize() {
    if (document.documentElement.dataset.qmp3ShellReady === '1') return;
    document.documentElement.dataset.qmp3ShellReady = '1';
    ensureStylesheet();
    document.body.classList.add('qmp3-site-page');
    const header = standardizeHeader();
    const main = document.querySelector('main');
    addBreadcrumb(header, main);
    standardizeHero(main);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
