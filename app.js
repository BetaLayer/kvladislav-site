(() => {
  const site = window.SITE;
  let language = 'ru';
  let topic = 'stats';
  let toastTimer;
  try { language = localStorage.getItem('site-language') === 'en' ? 'en' : 'ru'; } catch {}
  const queryLanguage = new URLSearchParams(location.search).get('lang');
  if (queryLanguage === 'ru' || queryLanguage === 'en') language = queryLanguage;

  function subject(key) {
    return site[language][key === 'stats' ? 'subjectStats' : key === 'project' ? 'subjectProject' : 'subjectGeneral'];
  }
  function applyLanguage(next) {
    language = next;
    const copy = site[next];
    document.documentElement.lang = next;
    document.title = copy[document.body.dataset.page === 'act' ? 'actPageTitle' : 'pageTitle'];
    document.querySelector('meta[name="description"]').content = copy[document.body.dataset.page === 'act' ? 'actDescription' : 'description'];
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = copy[el.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', copy[el.dataset.i18nAria]); });
    document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === next)));
    document.querySelectorAll('[data-name]').forEach(el => { el.textContent = site.name; });
    document.querySelectorAll('[data-email]').forEach(el => { el.textContent = site.email; });
    document.querySelectorAll('[data-mail]').forEach(el => { el.href = `mailto:${site.email}?subject=${encodeURIComponent(subject(el.dataset.mail === 'selected' ? topic : el.dataset.mail))}`; });
    document.querySelectorAll('[data-page-link]').forEach(el => {
      const url = new URL(el.getAttribute('href'), location.href);
      url.searchParams.set('lang', next);
      el.href = url.href;
    });
    const status = document.getElementById('copy-status');
    if (status) status.textContent = '';
    try { localStorage.setItem('site-language', next); } catch {}
  }
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    applyLanguage(button.dataset.language);
    try { const url = new URL(location.href); url.searchParams.set('lang', language); history.replaceState(null, '', url); } catch {}
  }));
  document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
    topic = button.dataset.topic;
    document.querySelectorAll('[data-topic]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    applyLanguage(language);
  }));
  document.querySelector('[data-copy]')?.addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    clearTimeout(toastTimer);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(site.email);
      status.textContent = site[language].copied;
    } catch { status.textContent = site[language].copyFailed; }
    toastTimer = setTimeout(() => { status.textContent = ''; }, 6000);
  });
  applyLanguage(language);
})();
