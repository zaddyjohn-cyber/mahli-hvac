/* Oasis Massage Studio — main scripts */

document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navList.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', navList.classList.contains('open'));
    });
  }

  // FAQ accordion — display-based reveal toggled by an .open class on the item.
  // Supports both .faq-q [current theme] and .faq-question [legacy].
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q, .faq-question');
    if (!btn) return;
    if (btn.tagName !== 'BUTTON') { btn.setAttribute('role', 'button'); btn.setAttribute('tabindex', '0'); }
    btn.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
    const toggle = () => {
      const willOpen = !item.classList.contains('open');
      const parent = item.parentElement;
      if (parent) parent.querySelectorAll('.faq-item.open').forEach(o => {
        if (o !== item) {
          o.classList.remove('open');
          const ob = o.querySelector('.faq-q, .faq-question');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    };
    btn.addEventListener('click', toggle);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });

  // Track conversion clicks (placeholder — replace with gtag/fbq when keys are added)
  const trackEvent = (name, params = {}) => {
    if (typeof gtag === 'function') gtag('event', name, params);
    if (typeof fbq === 'function') fbq('trackCustom', name, params);
  };

  document.querySelectorAll('a[href^="https://wa.me"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('whatsapp_click', { location: window.location.pathname }));
  });
  document.querySelectorAll('a[href^="tel:"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('phone_click', { location: window.location.pathname }));
  });
  document.querySelectorAll('a[href*="setmore.com"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('booking_click', { location: window.location.pathname }));
  });
  document.querySelectorAll('a[href*="google.com/maps"]').forEach(a => {
    a.addEventListener('click', () => trackEvent('directions_click', { location: window.location.pathname }));
  });

  // Hide top header shadow only when at top
  const header = document.querySelector('.site-header');
  const updateHeader = () => {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  // Lazy fallback for older browsers (most modern browsers already support loading="lazy")
  if ('loading' in HTMLImageElement.prototype === false) {
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      img.src = img.src;
    });
  }

  /* ============================================================
     MOBILE PERFORMANCE — only play videos / run animations that
     are actually on screen. Mobile browsers limit how many videos
     and animations can run at once; pausing off-screen ones frees
     resources so the visible content (incl. the CTA demos) always
     animates smoothly.
     ============================================================ */
  if ('IntersectionObserver' in window) {

    // 1) Autoplay videos: play when visible, pause when scrolled away.
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const v = entry.target;
        if (entry.isIntersecting) {
          if (v.dataset.deferSrc && !v.querySelector('source[src]')) {
            // (reserved for future lazy <source> swapping)
          }
          const p = v.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          try { v.pause(); } catch (e) {}
        }
      });
    }, { threshold: 0.15, rootMargin: '100px 0px' });

    document.querySelectorAll('video[autoplay]').forEach(v => {
      v.removeAttribute('autoplay'); // we control playback ourselves
      videoObserver.observe(v);
    });

    // 2) Heavy looping CSS animations: pause their container when off-screen,
    //    resume (and restart, so they kick off reliably) when in view.
    const animTargets = document.querySelectorAll(
      '.svc-ring, .cta-demos, .why-card .wa-mock, .faq-deco'
    );
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('anim-on', entry.isIntersecting);
      });
    }, { threshold: 0.05 });
    animTargets.forEach(t => animObserver.observe(t));
  } else {
    // No IntersectionObserver: just let everything run.
    document.querySelectorAll('.svc-ring, .cta-demos, .why-card .wa-mock, .faq-deco')
      .forEach(t => t.classList.add('anim-on'));
  }
});
