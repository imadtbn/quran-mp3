/* Homepage header: share the library itself, not the selected surah. */
(() => {
  'use strict';
  const button = document.getElementById('homeShareBtn');
  const status = document.getElementById('homeShareStatus');
  if (!button || !status) return;

  const holder = button.closest('.home-share');
  const message = 'شارك المكتبة القرآنية ولك أجرها وأجر من عمل بها';
  const canonical = document.querySelector('link[rel="canonical"]')?.href;
  const url = canonical || new URL('./', document.baseURI).href;
  let statusTimer;

  function feedback(text) {
    clearTimeout(statusTimer);
    holder?.classList.add('is-copied');
    status.textContent = text;
    status.classList.add('is-visible');
    statusTimer = setTimeout(() => {
      status.classList.remove('is-visible');
      holder?.classList.remove('is-copied');
      status.textContent = '';
    }, 4000);
  }

  function fallbackCopy(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.readOnly = true;
    field.setAttribute('aria-hidden', 'true');
    field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(field);
    field.focus();
    field.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    finally {
      field.remove();
      button.focus({ preventScroll: true });
    }
    return copied;
  }

  button.addEventListener('click', async () => {
    const shareData = {
      title: 'مكتبة القرآن الصوتية',
      text: message,
      url
    };
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
        // Some desktop browsers expose Web Share but cannot complete it.
      }
    }
    const copyValue = message + '\n' + url;
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(copyValue);
          copied = true;
        } catch {
          copied = fallbackCopy(copyValue);
        }
      } else {
        copied = fallbackCopy(copyValue);
      }
      feedback(copied
        ? 'تم نسخ رسالة المشاركة ورابط المكتبة. أرسلها لأصدقائك.'
        : 'تعذر النسخ التلقائي. يمكنك نسخ رابط الموقع من شريط العنوان.');
    } catch {
      feedback('تعذر النسخ التلقائي. يمكنك نسخ رابط الموقع من شريط العنوان.');
    }
  });
})();
