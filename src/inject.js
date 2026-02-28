'use strict';

if (window !== top && location.href === 'about:blank') {
  try {
    top.document;

    const script = document.createElement('script');
    script.textContent = `{
      const nav = top.navigator;

      navigator.__defineGetter__('userAgent', () => nav.userAgent);
      navigator.__defineGetter__('appVersion', () => nav.appVersion);
      navigator.__defineGetter__('platform', () => nav.platform);
      navigator.__defineGetter__('vendor', () => nav.vendor);
      if ('userAgentData' in nav) {
        navigator.__defineGetter__('userAgentData', () => nav.userAgentData);
      }

      document.documentElement.dataset.uaSyncInjected = 'true';
    }`;

    document.documentElement.appendChild(script);
    script.remove();
    delete document.documentElement.dataset.uaSyncInjected;
  }
  catch (e) {}
}
