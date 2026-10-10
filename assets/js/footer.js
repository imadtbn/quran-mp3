/* دعاء الفوتر ومشاركة الموقع في جميع الصفحات */
(() => {
  const homeUrl = 'https://imadtbn.github.io/quran-mp3/';
  const footer = document.querySelector('.site-footer') || document.createElement('footer');
  footer.classList.add('site-footer', 'duaa-footer');
  footer.innerHTML = `
    <div class="duaa-footer-inner">
      <p class="duaa-heading">دعاء وأجر نرجوه من الله</p>
      <p class="duaa-text">اللهم اغفر لوالدينا وارحمهما وبارك في أعمار الأحياء منهم، وارحم من توفي منهم، واغفر لمصمم هذه المكتبة ولوالديه، ولجميع المسلمين والمسلمات، الأحياء منهم والأموات.</p>
      <p class="duaa-text">اللهم تقبّل هذا العمل واجعله صدقةً جاريةً ينتفع بها المسلمون والمسلمات، واكتب أجره لكل من ساهم في إنشائه وتطويره ونشره والدلالة عليه، واجعله خالصًا لوجهك الكريم.</p>
      <div class="duaa-share">
        <button type="button" class="duaa-share-button" id="footerShareSite">↗ انشر الموقع وساهم في نشر الخير</button>
        <span class="duaa-share-status" id="footerShareStatus" role="status" aria-live="polite"></span>
      </div>
      <p class="duaa-credit">مكتبة القرآن الصوتية — التلاوات مستضافة على خوادم مصادرها الخارجية.</p>
    </div>`;
  if (!footer.isConnected) {
    const main = document.querySelector('main');
    if (main) main.insertAdjacentElement('afterend', footer);
    else document.body.append(footer);
  }
  const button = footer.querySelector('#footerShareSite');
  const status = footer.querySelector('#footerShareStatus');
  const shareText = 'ساهم في نشر القرآن الكريم؛ مكتبة صوتية مجانية تضم تلاوات القراء والروايات المختلفة.';
  button.addEventListener('click', async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'مكتبة القرآن الصوتية', text: shareText, url: homeUrl });
        return;
      }
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(homeUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = homeUrl;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand('copy');
        input.remove();
        if (!copied) throw new Error('copy failed');
      }
      status.textContent = 'تم نسخ رابط المكتبة، شاركه مع من تحب.';
    } catch (error) {
      if (error.name === 'AbortError') return;
      status.textContent = 'تعذر النسخ تلقائيًا. الرابط: ' + homeUrl;
    }
  });
})();
