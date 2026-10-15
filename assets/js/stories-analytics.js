/* GA4 measures useful story interactions, without sending visitor search terms. */
(() => {
  'use strict';
  if (typeof window.gtag !== 'function') return;

  const kind = document.body.classList.contains('qsa-page')
    ? 'narrated_prophet_story' : 'quran_story';

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest('a[href]');
    if (link) {
      let destination;
      try { destination = new URL(link.href); } catch { return; }
      if (destination.hostname === 'audio.islamweb.net') {
        window.gtag('event', 'story_audio_external', {
          story_type: kind,
          audio_provider: 'islamweb',
          audio_id: destination.searchParams.get('audioid') || 'unknown'
        });
      }
    }
    if (target.closest('#storyShare, #qsaShare, [data-story-share]')) {
      window.gtag('event', 'story_share_click', { story_type: kind });
    }
  });
})();
