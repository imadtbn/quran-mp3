app_js = '''/* =========================================================
   مكتبة القرآن الصوتية — منطق التطبيق
   بحث ذكي + فلاتر + مشغّل متصل
   ========================================================= */
"use strict";

/* ---------- أدوات مساعدة ---------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const toAr = n => String(n).replace(/\\d/g, d => AR_DIGITS[d]);

/* تطبيع النص العربي: إزالة التشكيل وتوحيد الألف والهاء والتاء المربوطة */
function normalizeAr(str) {
  return String(str)
    .toLowerCase()
    .replace(/[\\u064B-\\u0652\\u0670\\u0640]/g, "")   // تشكيل وتطويل
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\\u0649]/g, "ي")
    .trim();
}

const pad3 = n => String(n).padStart(3, "0");
const surahUrl = (reciter, n) => reciter.base + pad3(n) + ".mp3";

function fmtTime(sec) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

/* ---------- الحالة ---------- */
const state = {
  reciterId: localStorage.getItem("qmp3-reciter") || RECITERS[0].id,
  q: "",
  riwaya: "",
  sort: "tartil",
  current: -1,          // رقم السورة الحالية
  queue: [],            // قائمة السور المعروضة حاليًا (يمر عليها التالي/السابق)
  playing: false,
  muted: false
};

const reciter = () => RECITERS.find(r => r.id === state.reciterId) || RECITERS[0];

/* ---------- عناصر DOM ---------- */
const audio       = $("#audio");
const player      = $("#player");
const surahGrid   = $("#surahGrid");
const reciterList = $("#reciterList");
const riwayaSel   = $("#riwayaSelect");
const searchInput = $("#searchInput");
const searchClear = $("#searchClear");
const sortSel     = $("#sortSelect");
const toolbarInfo = $("#toolbarInfo");
const emptyState  = $("#emptyState");

/* ---------- الإحصائيات ---------- */
$("#statSurahs").textContent  = toAr(114);
$("#statReciters").textContent = toAr(RECITERS.length);
$("#statRiwayat").textContent  = toAr(new Set(RECITERS.map(r => r.riwaya)).size);

/* ---------- عرض القراء ---------- */
function renderReciters() {
  reciterList.innerHTML = "";
  const filtered = state.riwaya ? RECITERS.filter(r => r.riwaya === state.riwaya) : RECITERS;
  filtered.forEach(r => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "reciter-item" + (r.id === state.reciterId ? " active" : "");
    btn.innerHTML = `
      <span class="reciter-avatar">${r.name.trim()[0]}</span>
      <span class="reciter-body">
        <span class="reciter-name">${r.name}</span><br>
        <span class="reciter-sub">${r.riwaya} • ${r.style}</span>
      </span>
      <svg class="reciter-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
    btn.addEventListener("click", () => {
      state.reciterId = r.id;
      localStorage.setItem("qmp3-reciter", r.id);
      renderReciters();
      renderGrid();
      if (state.current > 0) playSurah(state.current); // إعادة التحميل بصوت القارئ الجديد
    });
    reciterList.appendChild(btn);
  });
}

/* ---------- تعبئة قائمة الروايات ---------- */
[...new Set(RECITERS.map(r => r.riwaya))].forEach(rw => {
  const o = document.createElement("option");
  o.value = rw; o.textContent = rw;
  riwayaSel.appendChild(o);
});

/* ---------- البحث الذكي ---------- */
function smartSearch(q) {
  const needle = normalizeAr(q);
  if (!needle) return SURAHS.slice();
  const byNumber = /^\d+$/.test(q) ? parseInt(q, 10) : null;

  return SURAHS.filter(s => {
    if (byNumber !== null) return s.n === byNumber;
    const hayName = normalizeAr(s.name);
    const hayRec  = normalizeAr(reciter().name);
    return hayName.includes(needle) || hayRec.includes(needle)
        || toAr(s.n) === q || String(s.n) === q;
  });
}

/* ---------- عرض السور ---------- */
function currentList() {
  let list = smartSearch(state.q);
  if (state.sort === "alpha") {
    list = list.slice().sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }
  return list;
}

function renderGrid() {
  const r = reciter();
  const list = currentList();
  state.queue = list;

  toolbarInfo.innerHTML = `عرض <b>${toAr(list.length)}</b> سورة • القارئ: <b>${r.name}</b> (${r.riwaya})`;
  emptyState.hidden = list.length > 0;
  surahGrid.innerHTML = "";

  list.forEach(s => {
    const card = document.createElement("article");
    card.className = "surah-card" + (s.n === state.current ? " playing" : "");
    card.dataset.n = s.n;
    card.innerHTML = `
      <div class="surah-num"><span>${toAr(s.n)}</span></div>
      <h3 class="surah-name">سورة ${s.name}</h3>
      <p class="surah-meta">${toAr(s.ayahs)} آية • ${r.style}</p>
      <div class="surah-actions">
        <button type="button" class="btn-play">
          <span class="lbl-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg> استماع</span>
          <span class="eq"><i></i><i></i><i></i></span>
        </button>
        <a class="btn-dl" href="${surahUrl(r, s.n)}" download="سورة ${s.name} - ${r.name}.mp3" title="تحميل MP3" aria-label="تحميل السورة">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
        </a>
      </div>`;
    card.addEventListener("click", e => {
      if (e.target.closest("a")) return; // ترك زر التحميل يعمل كرابط
      playSurah(s.n);
    });
    surahGrid.appendChild(card);
  });
}

/* ---------- المشغّل ---------- */
function playSurah(n) {
  const r = reciter();
  state.current = n;
  audio.src = surahUrl(r, n);
  audio.play().catch(() => {});
  state.playing = true;

  const s = SURAHS.find(x => x.n === n);
  $("#playerSurah").textContent  = "سورة " + s.name;
  $("#playerReciter").textContent = r.name + " • " + r.riwaya + " • " + r.style;
  const dl = $("#downloadBtn");
  dl.href = audio.src;
  dl.setAttribute("download", `سورة ${s.name} - ${r.name}.mp3`);
  dl.hidden = false;

  player.classList.add("show");
  updatePlayIcon();
  highlightCard();
  document.title = `سورة ${s.name} - ${r.name} | مكتبة القرآن الصوتية`;
}

function highlightCard() {
  $$(".surah-card").forEach(c => c.classList.toggle("playing", +c.dataset.n === state.current));
}

function step(dir) {
  if (!state.queue.length) return;
  const idx = state.queue.findIndex(s => s.n === state.current);
  const next = state.queue[(idx + dir + state.queue.length) % state.queue.length];
  playSurah(next.n);
}

function updatePlayIcon() {
  $("#iconPlay").hidden  = state.playing;
  $("#iconPause").hidden = !state.playing;
}

$("#playBtn").addEventListener("click", () => {
  if (!audio.src) { step(1); return; }
  if (audio.paused) { audio.play(); state.playing = true; }
  else { audio.pause(); state.playing = false; }
  updatePlayIcon();
  highlightCard();
});
$("#nextBtn").addEventListener("click", () => step(1));
$("#prevBtn").addEventListener("click", () => step(-1));
$("#playAllBtn").addEventListener("click", () => {
  if (!state.queue.length) return;
  playSurah(state.queue[0].n);
  $("#library").scrollIntoView({ behavior: "smooth", block: "start" });
});

audio.addEventListener("ended", () => step(1));
audio.addEventListener("play",  () => { state.playing = true;  updatePlayIcon(); highlightCard(); });
audio.addEventListener("pause", () => { state.playing = false; updatePlayIcon(); highlightCard(); });

audio.addEventListener("error", () => {
  if (!audio.src) return;
  $("#playerReciter").textContent = "تعذّر تحميل التلاوة — تحقق من الاتصال بالإنترنت";
});

/* التقدم والصوت */
const seekBar = $("#seekBar");
audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const pct = (audio.currentTime / audio.duration) * 1000;
    seekBar.value = pct;
    seekBar.style.setProperty("--fill", (pct / 10) + "%");
  }
  $("#curTime").textContent = fmtTime(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => {
  $("#durTime").textContent = fmtTime(audio.duration);
});
seekBar.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seekBar.value / 1000) * audio.duration;
});
const volumeBar = $("#volumeBar");
volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value / 100;
  audio.muted = false;
  state.muted = false;
  updateVolIcon();
});
$("#volumeBtn").addEventListener("click", () => {
  audio.muted = !audio.muted;
  state.muted = audio.muted;
  updateVolIcon();
});
function updateVolIcon() {
  const off = state.muted || audio.volume === 0;
  $("#iconVolOn").hidden  = off;
  $("#iconVolOff").hidden = !off;
}

/* ---------- الفلاتر والبحث ---------- */
function debounce(fn, ms) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

searchInput.addEventListener("input", debounce(() => {
  state.q = searchInput.value;
  searchClear.hidden = !state.q;
  renderGrid();
}, 150));

searchClear.addEventListener("click", () => {
  searchInput.value = ""; state.q = "";
  searchClear.hidden = true;
  renderGrid();
  searchInput.focus();
});
$("#searchForm").addEventListener("submit", e => {
  e.preventDefault();
  if (state.queue.length) playSurah(state.queue[0].n);
});

riwayaSel.addEventListener("change", () => {
  state.riwaya = riwayaSel.value;
  renderReciters();
  renderGrid();
});

sortSel.addEventListener("change", () => {
  state.sort = sortSel.value;
  renderGrid();
});

function resetAll() {
  state.q = ""; state.riwaya = "";
  searchInput.value = ""; searchClear.hidden = true;
  riwayaSel.value = "";
  renderReciters(); renderGrid();
}
$("#resetFilters").addEventListener("click", resetAll);
$("#emptyReset").addEventListener("click", resetAll);

/* ---------- قائمة الهاتف ---------- */
const navToggle = $("#navToggle"), mainNav = $("#mainNav");
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  navToggle.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", open);
});
$$("#mainNav a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  navToggle.classList.remove("open");
}));

/* ---------- تشغيل اختصارات لوحة المفاتيح ---------- */
document.addEventListener("keydown", e => {
  if (e.target.matches("input, select")) return;
  if (e.code === "Space") { e.preventDefault(); $("#playBtn").click(); }
  if (e.code === "ArrowLeft")  $("#nextBtn").click();
  if (e.code === "ArrowRight") $("#prevBtn").click();
});

/* ---------- إقلاع ---------- */
renderReciters();
renderGrid();
updateVolIcon();
