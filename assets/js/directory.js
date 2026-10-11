const staticLinks = {
  readers: {'إبراهيم الأخضر': 'readers/ibrahim-al-akhdar.html', 'أحمد دبان': 'readers/ahmed-deban.html'},
  riwayat: {'حفص عن عاصم': 'riwayat/hafs-an-asim.html', 'قالون عن نافع': 'riwayat/qalun-an-nafi.html'},
  mushafs: {'mp3-1-1': 'mushafs/ibrahim-al-akhdar-hafs.html', 'mp3-265-280': 'mushafs/ahmed-deban-qalun.html'}
};

// Portraits are optional: a failed request must never block the catalog.
const directoryType = document.body.dataset.directory;
async function loadPortraits() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch('assets/data/reciter-portraits.json', {signal: controller.signal});
    return response.ok ? await response.json() : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
const portraitReady = directoryType === 'readers'
  ? loadPortraits()
  : Promise.resolve(null);

Promise.all([
  catalogReady,
  fetch('catalog/manifest.json').then(r => r.ok ? r.json() : null).catch(() => null),
  portraitReady
]).then(([, manifest, portraitData]) => {
  const type = directoryType;
  const grid = document.getElementById('directoryGrid');
  const label = document.getElementById('directoryStatus');
  const search = document.getElementById('directorySearch');
  const portraits = portraitData?.version === 1 ? portraitData.readers || {} : {};
  const readerId = r => String(r.id).match(/^mp3-(\d+)-/)?.[1] || r.id;
  const groups = new Map();
  for (const r of RECITERS) {
    const key = type === 'readers' ? readerId(r) : type === 'riwayat' ? r.riwaya : r.id;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  }
  const items = [...groups].map(([key, rs]) => ({
    key,
    name: type === 'mushafs' ? rs[0].name + ' — ' + (rs[0].moshafName || rs[0].riwaya) : type === 'readers' ? rs[0].name : key,
    sub: rs.length === 1 ? 'تسجيل واحد' : rs.length === 2 ? 'تسجيلان' : rs.length + ' تسجيلات',
    riwayat: [...new Set(rs.map(r => r.riwaya).filter(Boolean))],
    href: type === 'readers' ? 'reciter.html?reciter=' + encodeURIComponent(rs[0].id)
      : type === 'riwayat' ? 'riwaya.html?name=' + encodeURIComponent(key) : 'mushaf.html?id=' + encodeURIComponent(key)
  }));
  document.getElementById('directoryTitle').textContent = type === 'readers' ? 'دليل القراء' : type === 'riwayat' ? 'دليل الروايات' : 'دليل المصاحف';
  document.getElementById('directoryIntro').textContent = type === 'readers'
    ? 'تعرّف على القراء، واختر قارئك لاستكشاف رواياته والاستماع إلى تلاواته.'
    : 'اختر من التسجيلات المتاحة للاستماع مباشرة.';
  const norm = s => String(s).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/[\u064b-\u0652ـ]/g, '');
  let limit = 48;

  function createPortrait(item) {
    const avatar = document.createElement('span');
    avatar.className = 'reader-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    const initials = document.createElement('span');
    initials.className = 'reader-initials';
    initials.textContent = item.name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => Array.from(s)[0]).join(' ');
    avatar.append(initials);
    const portrait = portraits[item.key];
    // Accept only local portrait paths, never arbitrary remote image URLs.
    if (portrait?.verified === true && /^assets\/img\/reciters\/[a-z0-9-]+\.webp$/.test(portrait.image)) {
      const img = document.createElement('img');
      img.width = 72;
      img.height = 72;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('load', () => avatar.classList.add('has-portrait'), {once: true});
      img.addEventListener('error', () => { img.remove(); avatar.classList.remove('has-portrait'); }, {once: true});
      img.src = portrait.image;
      avatar.append(img);
    }
    return avatar;
  }

  function render() {
    const matches = items.filter(x => norm(x.name).includes(norm(search.value.trim())));
    const fragment = document.createDocumentFragment();
    for (const item of matches.slice(0, limit)) {
      const a = document.createElement('a');
      const b = document.createElement('strong');
      const c = document.createElement('small');
      a.className = 'directory-card';
      const linkKey = type === 'mushafs' ? item.key : item.name;
      a.href = manifest?.[type]?.[linkKey] || staticLinks[type]?.[linkKey] || item.href;
      b.textContent = item.name;
      c.textContent = item.sub;
      if (type === 'readers') {
        a.classList.add('reader-card');
        const content = document.createElement('span');
        content.className = 'reader-card-content';
        const riwayat = document.createElement('span');
        riwayat.className = 'reader-riwayat';
        riwayat.textContent = item.riwayat.slice(0, 2).join(' · ') + (item.riwayat.length > 2 ? ' + ' + (item.riwayat.length - 2) : '');
        riwayat.title = item.riwayat.join('، ');
        const action = document.createElement('span');
        action.className = 'reader-card-action';
        action.textContent = 'استكشف التلاوات ←';
        content.append(b, riwayat, c, action);
        a.append(createPortrait(item), content);
      } else {
        a.append(b, c);
      }
      fragment.append(a);
    }
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'directory-empty';
      empty.textContent = type === 'readers' ? 'لا توجد نتائج بهذا الاسم. جرّب كتابة جزء من اسم القارئ.' : 'لا توجد نتائج. جرّب كلمة بحث أخرى.';
      fragment.append(empty);
    }
    label.textContent = 'عرض ' + Math.min(limit, matches.length) + ' من ' + matches.length;
    if (matches.length > limit) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'chip-btn directory-more';
      button.textContent = 'عرض المزيد';
      button.onclick = () => {
        const previousCount = grid.querySelectorAll('.directory-card').length;
        limit += 48;
        render();
        // Keep keyboard focus on the first newly revealed reader.
        grid.querySelectorAll('.directory-card')[previousCount]?.focus({preventScroll: true});
      };
      fragment.append(button);
    }
    grid.replaceChildren(fragment);
  }

  // Public attribution for the locally hosted photographs.
  const credits = document.getElementById('portraitCredits');
  if (credits && Object.keys(portraits).length) {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'مصادر صور القراء';
    details.append(summary);
    for (const portrait of Object.values(portraits).filter(p => p.verified)) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.textContent = portrait.name;
      if (/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(portrait.source)) a.href = portrait.source;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      p.append(a, ' — ' + portrait.author + ' — ' + portrait.license + '؛ صُغّرت الصورة وحُوّلت إلى WebP.');
      if (/^https:\/\//.test(portrait.licenseUrl || '')) {
        const license = document.createElement('a');
        license.href = portrait.licenseUrl;
        license.textContent = ' الترخيص';
        license.target = '_blank';
        license.rel = 'noopener noreferrer';
        p.append(license);
      }
      details.append(p);
    }
    credits.append(details);
  }
  search.addEventListener('input', () => {limit = 48; render();});
  render();
}).catch(() => {
  document.getElementById('directoryStatus').textContent = 'تعذر تحميل بيانات الدليل';
});
