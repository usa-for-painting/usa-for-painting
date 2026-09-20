(() => {
  'use strict';
  const preferenceKey = 'usa-painting-analytics-consent';
  let measurementId = '', active = false, initialized = false;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  const emit = (name, values = {}) => { if (active) gtag('event', name, values); };
  const preference = () => { try { return localStorage.getItem(preferenceKey); } catch { return null; } };
  function save(value) { try { localStorage.setItem(preferenceKey, value); } catch {} }
  function cleanUrl(value) { try { const url = new URL(value); return url.origin + url.pathname; } catch { return ''; } }
  function enable() {
    if (active) return;
    active = true;
    window['ga-disable-' + measurementId] = false;
    gtag('consent', initialized ? 'update' : 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    if (initialized) return;
    initialized = true;
    gtag('js', new Date());
    gtag('config', measurementId, { allow_google_signals: false, allow_ad_personalization_signals: false, page_location: location.origin + location.pathname, page_referrer: cleanUrl(document.referrer) });
    const tag = document.createElement('script'); tag.async = true; tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId; document.head.append(tag);
    installEvents();
  }
  function decline() {
    active = false;
    window['ga-disable-' + measurementId] = true;
    gtag('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    save('declined');
  }
  function installEvents() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a');
      if (link) {
        const href = link.getAttribute('href') || '';
        if (/^(tel:|sms:)/.test(href)) emit('contact_click', { contact_method: href.startsWith('tel:') ? 'phone' : 'text' });
        else if (href.endsWith('#estimate')) emit('estimate_click', { link_location: link.closest('header') ? 'header' : link.closest('.mobile-contact') ? 'mobile_bar' : 'page' });
        else if (link.hasAttribute('download')) emit('film_download');
      }
      const project = event.target.closest('.project-card, .portfolio-open');
      if (project) emit('project_view', { project_name: project.dataset.title || 'Project' });
    });
    document.querySelector('#estimate-form')?.addEventListener('submit', () => emit('estimate_prepared', { method: 'message_preview' }));
    const video = document.querySelector('#brand-film');
    if (video) {
      let started = false; const milestones = new Set();
      video.addEventListener('play', () => { if (!started) { started = true; emit('film_start', { video_title: 'Our story in one minute' }); } });
      video.addEventListener('timeupdate', () => {
        if (!video.duration) return;
        for (const percent of [25, 50, 75]) if (video.currentTime / video.duration * 100 >= percent && !milestones.has(percent)) { milestones.add(percent); emit('film_progress', { video_percent: percent }); }
      });
      video.addEventListener('ended', () => emit('film_complete'));
    }
    // Count visible, recently active time in one section at a time, never background tabs.
    const sections = [...document.querySelectorAll('main section[id]')];
    const times = new Map(); let last = performance.now(), activity = last;
    for (const type of ['pointerdown', 'keydown', 'scroll']) window.addEventListener(type, () => { activity = performance.now(); }, { passive: true });
    function tick() {
      const now = performance.now(), elapsed = Math.min(now - last, 2000); last = now;
      if (!active || document.hidden || now - activity > 60000) return;
      const header = document.querySelector('.header')?.getBoundingClientRect().bottom || 0;
      let best = null, area = 0;
      for (const section of sections) { const box = section.getBoundingClientRect(); const visible = Math.max(0, Math.min(box.bottom, innerHeight) - Math.max(box.top, Math.max(0, header))); if (visible > area) { area = visible; best = section; } }
      if (best) times.set(best.id, (times.get(best.id) || 0) + elapsed);
    }
    function flush() {
      tick();
      for (const [id, ms] of times) if (ms >= 1000) { emit('section_engagement', { section_name: id, visible_seconds: Math.round(ms / 1000), transport_type: 'beacon' }); times.delete(id); }
    }
    setInterval(tick, 1000); setInterval(flush, 15000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); else { last = performance.now(); activity = last; } });
    window.addEventListener('pagehide', flush);
  }
  fetch('content/analytics.json', { cache: 'no-store' }).then(response => response.ok ? response.json() : null).then(config => {
    if (!/^G-[A-Z0-9]+$/.test(config?.measurementId || '')) return;
    measurementId = config.measurementId;
    const settings = document.createElement('button'); settings.type = 'button'; settings.className = 'analytics-settings';
    function updateSettings() { settings.textContent = active ? 'Turn off analytics' : 'Turn on analytics'; }
    settings.addEventListener('click', () => {
      if (active) decline(); else { save('accepted'); enable(); }
      updateSettings();
    });
    (document.querySelector('footer .container, footer .feature-content') || document.querySelector('footer'))?.append(settings);
    if (preference() === 'declined') decline(); else enable();
    updateSettings();
  }).catch(() => {});
})();
