(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const groups = [
    { id: 'knowledge', title: 'رب زدني علمًا', surah: 20, surahName: 'طه', ayahs: [114] },
    { id: 'hearts', title: 'ربنا لا تزغ قلوبنا', surah: 3, surahName: 'آل عمران', ayahs: [8] },
    { id: 'mercy', title: 'ربنا آتنا من لدنك رحمة', surah: 18, surahName: 'الكهف', ayahs: [10] },
    { id: 'ease', title: 'رب اشرح لي صدري', surah: 20, surahName: 'طه', ayahs: [25,26,27,28] }
  ];
  const allowedReciters = new Set(['Alafasy_128kbps','Husary_128kbps','MaherAlMuaiqly128kbps','Minshawy_Murattal_128kbps']);
  const verse = $('dhVerse'), reciter = $('dhReciter'), audio = $('dhAudio');
  const playBtn = $('dhPlay'), status = $('dhStatus'), now = $('dhNow');
  let groupIndex = 0, trackIndex = 0, loadedUrl = '', playRequested = false;
  const store = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const restore = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const active = () => groups[groupIndex];
  const format = n => String(n).padStart(3, '0');
  const src = () => 'https://everyayah.com/data/' + (allowedReciters.has(reciter.value) ? reciter.value : 'Alafasy_128kbps') + '/' + format(active().surah) + format(active().ayahs[trackIndex]) + '.mp3';
  function message(value) { status.textContent = value; }
  function updatePlayLabel() { playBtn.innerHTML = audio.paused ? '<span aria-hidden="true">▶</span> تشغيل التلاوة' : '<span aria-hidden="true">Ⅱ</span> إيقاف مؤقت'; }
  function updateUI() {
    const group = active(), ayah = group.ayahs[trackIndex], reader = reciter.selectedOptions[0]?.textContent || '';
    now.textContent = 'تلاوة ' + group.title + ' — سورة ' + group.surahName + '، الآية ' + ayah + ' — ' + reader;
    document.querySelectorAll('.dh-card').forEach(card => card.classList.toggle('is-playing', card.dataset.verse === group.id && !audio.paused));
  }
  function reset() {
    playRequested = false;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
    loadedUrl = '';
    updatePlayLabel();
    updateUI();
    message('جاهز للاستماع. اضغط تشغيل لبدء التلاوة.');
  }
  function selectGroup(id) {
    const index = groups.findIndex(group => group.id === id);
    if (index === -1) return;
    groupIndex = index; trackIndex = 0; verse.value = id;
    store('qmp3-dua-hifz-verse', id);
    reset();
  }
  function setSource() {
    const url = src();
    if (loadedUrl !== url) {
      audio.pause();
      loadedUrl = url;
      audio.src = url;
      audio.load();
    }
    updateUI();
  }
  async function play() {
    setSource();
    playRequested = true;
    try {
      await audio.play();
      updatePlayLabel();
      updateUI();
      message('جارٍ تشغيل الآية من التسجيل الخارجي.');
    } catch {
      if (playRequested) message('تعذر تشغيل التلاوة؛ تحقق من الاتصال بالإنترنت أو جرّب قارئًا آخر.');
      updatePlayLabel();
    }
  }
  function shift(delta) {
    let nextTrack = trackIndex + delta;
    if (nextTrack < 0) {
      groupIndex = (groupIndex - 1 + groups.length) % groups.length;
      nextTrack = active().ayahs.length - 1;
    } else if (nextTrack >= active().ayahs.length) {
      groupIndex = (groupIndex + 1) % groups.length;
      nextTrack = 0;
    }
    trackIndex = nextTrack;
    verse.value = active().id;
    store('qmp3-dua-hifz-verse', active().id);
    play();
  }
  function stop() {
    playRequested = false;
    audio.pause();
    try { audio.currentTime = 0; } catch {}
    updatePlayLabel();
    updateUI();
    message('تم إيقاف التلاوة.');
  }
  function textFor(id) {
    const card = document.querySelector('.dh-card[data-verse="' + id + '"]');
    return card ? card.querySelector('.dh-arabic').textContent.trim() + '\n' + card.querySelector('.dh-ref').textContent.trim() : '';
  }
  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      message('تم نسخ النص.');
    } catch {
      message('تعذر النسخ تلقائيًا؛ يمكنك تحديد النص ونسخه من الصفحة.');
    }
  }
  const saved = restore('qmp3-dua-hifz-verse');
  if (groups.some(x => x.id === saved)) { groupIndex = groups.findIndex(x => x.id === saved); verse.value = saved; }
  const storedReader = restore('qmp3-dua-hifz-reciter');
  if (allowedReciters.has(storedReader)) reciter.value = storedReader;
  verse.addEventListener('change', () => selectGroup(verse.value));
  reciter.addEventListener('change', () => { store('qmp3-dua-hifz-reciter', reciter.value); reset(); });
  playBtn.addEventListener('click', () => {
    if (loadedUrl && !audio.paused) { audio.pause(); updatePlayLabel(); message('التلاوة متوقفة مؤقتًا.'); return; }
    play();
  });
  $('dhBack').addEventListener('click', () => shift(-1));
  $('dhNext').addEventListener('click', () => shift(1));
  $('dhStop').addEventListener('click', stop);
  audio.addEventListener('pause', () => { updatePlayLabel(); updateUI(); });
  audio.addEventListener('play', () => { updatePlayLabel(); updateUI(); });
  audio.addEventListener('error', () => {
    if (audio.getAttribute('src')) {
      playRequested = false; updatePlayLabel();
      message('تعذر تحميل ملف الآية لدى المصدر الصوتي الخارجي؛ جرّب قارئًا آخر.');
    }
  });
  audio.addEventListener('ended', () => {
    if (trackIndex < active().ayahs.length - 1) { trackIndex += 1; play(); }
    else if ($('dhRepeat').checked) { trackIndex = 0; play(); }
    else { playRequested = false; updatePlayLabel(); updateUI(); message('انتهت تلاوة الآيات المختارة.'); }
  });
  document.querySelectorAll('[data-listen]').forEach(button => button.addEventListener('click', () => {
    selectGroup(button.dataset.listen);
    $('dhPlayer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    play();
  }));
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', () => copy(textFor(button.dataset.copy))));
  $('dhCopyGeneral').addEventListener('click', () => copy($('dhGeneralText').textContent.trim()));
  $('dhShare').addEventListener('click', async () => {
    const share = { title: 'دعاء حفظ القرآن الكريم', text: 'أدعية قرآنية مكتوبة ومسموعة لتيسير العلم والثبات', url: location.origin + location.pathname };
    if (navigator.share) {
      try { await navigator.share(share); } catch (e) { if (e.name !== 'AbortError') message('تعذرت المشاركة من هذا المتصفح.'); }
    } else copy(share.url);
  });
  const applySize = size => {
    const value = Math.max(1.18, Math.min(2.25, Number(size) || 1.54));
    document.documentElement.style.setProperty('--dh-text-size', value.toFixed(2) + 'rem');
    store('qmp3-dua-hifz-font', value.toFixed(2));
  };
  applySize(restore('qmp3-dua-hifz-font') || 1.54);
  $('dhIncrease').addEventListener('click', () => applySize(Number(restore('qmp3-dua-hifz-font') || 1.54) + .12));
  $('dhDecrease').addEventListener('click', () => applySize(Number(restore('qmp3-dua-hifz-font') || 1.54) - .12));
  if (location.hash && groups.some(x => '#dh-' + x.id === location.hash)) {
    selectGroup(location.hash.slice(4));
  } else updateUI();
})();