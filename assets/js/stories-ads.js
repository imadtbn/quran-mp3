/* Activate reserved story ad units only near the viewport. */
(() => {
  'use strict';
  const units = [...document.querySelectorAll('.qmp3-story-ad[data-qmp3-ad]')];
  if (!units.length) return;

  function requestAd(container) {
    if (container.dataset.adRequested) return;
    const slot = container.querySelector('ins.adsbygoogle');
    if (!slot || getComputedStyle(container).display === 'none') return;
    // Prevent "No slot size for availableWidth=81" on narrow layouts.
    if (slot.getBoundingClientRect().width < 300) return;
    container.dataset.adRequested = '1';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('Story AdSense placement could not initialize', error);
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        requestAd(entry.target);
      }
    }, { rootMargin: '300px 0px' });
    units.forEach((container) => observer.observe(container));
  } else {
    units.forEach(requestAd);
  }
})();
