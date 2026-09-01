let isInitialized = false;
let activeMeasurementId = null;

/**
 * Initializes Google Analytics 4 (GA4) dynamically.
 * @param {string} measurementId - E.g., 'G-XXXXXXXXXX'
 */
export function initAnalytics(measurementId) {
  const id = measurementId || (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GA_MEASUREMENT_ID : null);
  if (!id || typeof window === 'undefined') return;

  activeMeasurementId = id.trim();
  if (isInitialized && window.gtag) return;

  // Initialize dataLayer & gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', activeMeasurementId, {
    send_page_view: false, // Managed manually in React Router SPA
    cookie_flags: 'SameSite=None;Secure',
  });

  // Inject Google Tag script if not already present
  const scriptId = 'google-analytics-script';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(activeMeasurementId)}`;
    document.head.appendChild(script);
  }

  isInitialized = true;
}

export function trackEvent(action, label, category, value) {
  if (typeof window === 'undefined' || !window.gtag) return;
  try {
    window.gtag('event', action, {
      event_category: category || 'engagement',
      event_label: label || '',
      value: value || null,
    });
  } catch {}
}

export function trackPageView(path, title) {
  if (typeof window === 'undefined') return;
  const pageTitle = title || document.title;
  const pagePath = path || window.location.pathname;

  if (window.gtag && activeMeasurementId) {
    try {
      window.gtag('event', 'page_view', {
        page_title: pageTitle,
        page_path: pagePath,
        page_location: window.location.href,
        send_to: activeMeasurementId,
      });
    } catch {}
  } else {
    trackEvent('page_view', pageTitle, 'navigation');
  }
}

export function trackFormSubmit(formName) {
  trackEvent('form_submit', formName, 'forms');
}

export function trackSearch(query) {
  trackEvent('search', query, 'engagement');
}

export function trackCtaClick(ctaName, location) {
  trackEvent('cta_click', `${ctaName} - ${location || 'page'}`, 'engagement');
}

export function trackVideoPlay(videoTitle) {
  trackEvent('video_play', videoTitle, 'engagement');
}

export function trackDownload(fileName) {
  trackEvent('download', fileName, 'downloads');
}

export function trackChat(action) {
  trackEvent('chat', action, 'chat');
}

export function trackLogin(method) {
  trackEvent('login', method || 'admin', 'auth');
}

export function trackLogout() {
  trackEvent('logout', 'admin', 'auth');
}

export function trackEnroll(courseName) {
  trackEvent('enroll_click', courseName, 'conversions');
}

export function trackRegister(name) {
  trackEvent('register', name, 'conversions');
}
