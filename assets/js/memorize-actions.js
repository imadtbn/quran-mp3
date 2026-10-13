/* Decorative, accessible action icons for the memorization page. */
/* Existing buttons own their handlers; this file changes presentation only. */
(() => {
  'use strict';
  const main = document.querySelector('.memorize-main');
  if (!main) return;

  const strokes = {
    play: 'M8 5v14l11-7z',
    pause: 'M9 5v14M15 5v14',
    save: 'M4 3h14l3 3v15H3V3zM7 3v6h10V3M7 21v-8h10v8',
    share: 'M8 12l8-6M8 12l8 6M7 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0M20 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
    skip: 'M5 5v14M9 5l10 7-10 7z',
    repeat: 'M3 11a9 9 0 1 1 3 6M3 4v7h7',
    stop: 'M6 6h12v12H6z',
    resume: 'M8 5v14l11-7zM3 4v5',
    trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',
    verse: 'M8 5v14l11-7z'
  };
  const fixed = {
    startReview: 'play',
    saveReview: 'save',
    shareReview: 'share',
    pauseReview: 'pause',
    skipVerse: 'skip',
    restartVerse: 'repeat',
    stopReview: 'stop',
    resumeSaved: 'resume',
    resetSaved: 'trash'
  };

  function paint(button, kind) {
    if (!button || !strokes[kind]) return;
    const label = button.textContent.replace(/\\s+/g, ' ').trim();
    if (!label) return;
    if (button.dataset.memoActionIcon === kind &&
        button.querySelector(':scope > .memo-action-icon') &&
        button.querySelector(':scope > .memo-action-label')?.textContent === label) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    for (const [attr, value] of Object.entries({
      class: 'memo-action-icon',
      viewBox: '0 0 24 24',
      width: '19',
      height: '19',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.9',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false'
    })) svg.setAttribute(attr, value);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', strokes[kind]);
    svg.append(path);

    const text = document.createElement('span');
    text.className = 'memo-action-label';
    text.textContent = label;
    button.replaceChildren(svg, text);
    button.classList.add('memo-icon-button');
    button.dataset.memoActionIcon = kind;
  }

  for (const [id, kind] of Object.entries(fixed)) paint(document.getElementById(id), kind);

  // memorize.js replaces the pause button's text when resuming/stopping.
  const pause = document.getElementById('pauseReview');
  if (pause) {
    new MutationObserver(() => {
      const kind = pause.textContent.includes('استئناف') ? 'play' : 'pause';
      paint(pause, kind);
    }).observe(pause, { childList: true });
  }

  // Verse buttons are recreated when the audio advances or restarts.
  const verseList = document.getElementById('reviewVerses');
  if (verseList) {
    const decorateVerses = () => {
      for (const button of verseList.querySelectorAll('button')) paint(button, 'verse');
    };
    decorateVerses();
    new MutationObserver(decorateVerses).observe(verseList, { childList: true });
  }
})();
