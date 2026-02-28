'use strict';

const defaults = {
  enabled: true,
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
  whitelist: [
    'hikorea.go.kr',
    'www.hikorea.go.kr',
    'duckduckgo.com',
    'www.dhlottery.co.kr',
    'el.dhlottery.co.kr',
    'm.dhlottery.co.kr',
    'webbrowsertools.com'
  ],
  protected: [
    'google.com/recaptcha',
    'gstatic.com/recaptcha',
    'accounts.google.com',
    'accounts.youtube.com',
    'gitlab.com/users/sign_in'
  ],
  userAgentData: true
};

const prefs = Object.assign({}, defaults);
const decisionCache = {};

const clearCache = () => {
  Object.keys(decisionCache).forEach(id => delete decisionCache[id]);
};

const hostname = url => {
  try {
    return new URL(url).hostname;
  }
  catch (e) {
    return '';
  }
};

const matchDomain = (host, rule) => {
  if (!host || !rule) {
    return false;
  }
  return host === rule || host.endsWith('.' + rule) || rule.endsWith('.' + host);
};

const isProtected = url => prefs.protected.some(s => url.includes(s));

const shouldSpoof = url => {
  if (prefs.enabled === false || !prefs.ua) {
    return false;
  }
  if (isProtected(url)) {
    return false;
  }
  const host = hostname(url);
  if (!host || prefs.whitelist.length === 0) {
    return false;
  }
  return prefs.whitelist.some(rule => matchDomain(host, rule));
};

const parseUA = ua => {
  const isFirefox = /Firefox\//.test(ua);
  const isChrome = /Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua);
  const isEdge = /Edg\//.test(ua);
  const isOpera = /OPR\//.test(ua);
  const isSafari = /Safari\//.test(ua) && !isChrome && !isEdge && !isOpera;

  let platform = '';
  let osVersion = '10.0.0';
  if (/Windows NT/.test(ua)) {
    platform = 'Win32';
    osVersion = (ua.match(/Windows NT ([\d.]+)/) || [])[1] || '10.0.0';
  }
  else if (/Android/.test(ua)) {
    platform = 'Linux armv8l';
    osVersion = (ua.match(/Android ([\d.]+)/) || [])[1] || '10';
  }
  else if (/iPhone|iPad|iPod/.test(ua)) {
    platform = 'iPhone';
    osVersion = ((ua.match(/OS ([\d_]+)/) || [])[1] || '16_0').replace(/_/g, '.');
  }
  else if (/Mac OS X/.test(ua)) {
    platform = 'MacIntel';
    osVersion = ((ua.match(/Mac OS X ([\d_]+)/) || [])[1] || '14_0').replace(/_/g, '.');
  }
  else if (/Linux/.test(ua)) {
    platform = 'Linux x86_64';
    osVersion = '6.0.0';
  }

  let browserName = 'Google Chrome';
  let browserMajor = (ua.match(/Chrome\/(\d+)/) || [])[1] || '120';
  if (isEdge) {
    browserName = 'Microsoft Edge';
    browserMajor = (ua.match(/Edg\/(\d+)/) || [])[1] || browserMajor;
  }
  else if (isOpera) {
    browserName = 'Opera';
    browserMajor = (ua.match(/OPR\/(\d+)/) || [])[1] || browserMajor;
  }

  const o = {
    userAgent: ua,
    appVersion: ua.replace(/^Mozilla\//, '').replace(/^Opera\//, ''),
    platform,
    vendor: '',
    product: ua.includes('Gecko') ? 'Gecko' : 'Gecko',
    userAgentData: '[delete]'
  };

  if (isSafari) {
    o.vendor = 'Apple Computer, Inc.';
  }
  else if (!isFirefox) {
    o.vendor = 'Google Inc.';
  }

  if (isFirefox) {
    o.oscpu = platform || 'Windows NT 10.0';
    o.productSub = '20100101';
    o.buildID = '20181001000000';
  }
  else {
    o.oscpu = '[delete]';
    o.buildID = '[delete]';
    o.productSub = '20030107';

    if (prefs.userAgentData && (isChrome || isEdge || isOpera)) {
      delete o.userAgentData;
      o.userAgentDataBuilder = {
        browserName,
        browserMajor,
        osName: platform.includes('Mac') ? 'macOS' : (platform.includes('Linux') ? 'Linux' : (platform.includes('Win') ? 'Windows' : 'Unknown')),
        osVersion,
        ua
      };
    }
  }

  return o;
};

const buildClientHints = o => {
  if (!o.userAgentDataBuilder) {
    return [];
  }
  const name = o.userAgentDataBuilder.browserName;
  const version = o.userAgentDataBuilder.browserMajor;
  const platform = o.userAgentDataBuilder.osName;
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(o.userAgent) ? '?1' : '?0';

  return [{
    name: 'sec-ch-ua-platform',
    value: '"' + platform + '"'
  }, {
    name: 'sec-ch-ua',
    value: '"' + name + '";v="' + version + '", "Chromium";v="' + version + '", "Not=A?Brand";v="24"'
  }, {
    name: 'sec-ch-ua-mobile',
    value: mobile
  }];
};

const refreshBadge = () => {
  const mode = prefs.enabled ? 'on' : 'off';
  chrome.browserAction.setIcon({
    path: 'icons/' + mode + '/512.png'
  });
  chrome.browserAction.setBadgeText({
    text: prefs.enabled ? 'ON' : 'OFF'
  });
  chrome.browserAction.setTitle({
    title: prefs.enabled ? 'User-Agent spoofing is enabled' : 'User-Agent spoofing is disabled'
  });
};

const onBeforeSendHeaders = details => {
  const {tabId, type, url} = details;
  const requestHeaders = details.requestHeaders || [];

  if (type === 'main_frame') {
    decisionCache[tabId] = shouldSpoof(url);
  }
  const active = typeof decisionCache[tabId] === 'boolean' ? decisionCache[tabId] : shouldSpoof(url);

  if (!active) {
    return {};
  }

  const parsed = parseUA(prefs.ua);
  for (let i = 0; i < requestHeaders.length; i += 1) {
    const name = (requestHeaders[i].name || '').toLowerCase();
    if (name === 'user-agent') {
      requestHeaders[i].value = parsed.userAgent;
    }
    else if (name.startsWith('sec-ch-')) {
      requestHeaders[i] = null;
    }
  }

  requestHeaders.push(...buildClientHints(parsed));
  return {
    requestHeaders: requestHeaders.filter(Boolean)
  };
};

const onCommitted = details => {
  const {tabId, frameId, url} = details;
  if (!tabId || !(url.startsWith('http') || url.startsWith('ftp') || url === 'about:blank')) {
    return;
  }

  const active = typeof decisionCache[tabId] === 'boolean' ? decisionCache[tabId] : shouldSpoof(url);
  if (!active) {
    return;
  }

  const o = parseUA(prefs.ua);
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  chrome.tabs.executeScript(tabId, {
    runAt: 'document_start',
    frameId,
    code: `{
      const script = document.createElement('script');
      script.textContent = \`{
        const o = JSON.parse(decodeURIComponent(escape(atob('${encoded}'))));

        if (o.userAgentDataBuilder) {
          const b = o.userAgentDataBuilder;
          const version = b.browserMajor;
          const brands = [{
            brand: b.browserName,
            version
          }, {
            brand: 'Chromium',
            version
          }, {
            brand: 'Not=A?Brand',
            version: '24'
          }];

          const v = {
            brands,
            mobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(b.ua),
            platform: b.osName,
            toJSON() {
              return {
                brands: this.brands,
                mobile: this.mobile,
                platform: this.platform
              };
            },
            getHighEntropyValues(hints) {
              if (!hints || Array.isArray(hints) === false) {
                return Promise.reject(Error("Failed to execute 'getHighEntropyValues' on 'NavigatorUAData'"));
              }
              const r = this.toJSON();
              if (hints.includes('architecture')) {
                r.architecture = 'x86';
              }
              if (hints.includes('bitness')) {
                r.bitness = '64';
              }
              if (hints.includes('model')) {
                r.model = '';
              }
              if (hints.includes('platformVersion')) {
                r.platformVersion = b.osVersion || '10.0.0';
              }
              if (hints.includes('uaFullVersion')) {
                r.uaFullVersion = version;
              }
              if (hints.includes('fullVersionList')) {
                r.fullVersionList = brands;
              }
              return Promise.resolve(r);
            }
          };

          navigator.__defineGetter__('userAgentData', () => v);
        }

        delete o.userAgentDataBuilder;

        for (const key of Object.keys(o)) {
          if (o[key] === '[delete]') {
            delete Object.getPrototypeOf(window.navigator)[key];
          }
          else {
            navigator.__defineGetter__(key, () => o[key]);
          }
        }
      }\`;
      (document.documentElement || document.head || document).appendChild(script);
      script.remove();
    }`
  }, () => chrome.runtime.lastError);
};

chrome.tabs.onRemoved.addListener(tabId => {
  delete decisionCache[tabId];
});

chrome.browserAction.onClicked.addListener(() => {
  prefs.enabled = !prefs.enabled;
  chrome.storage.local.set({
    enabled: prefs.enabled
  });
  refreshBadge();
  clearCache();
});

chrome.storage.onChanged.addListener(changes => {
  Object.keys(changes).forEach(key => {
    prefs[key] = changes[key].newValue;
  });
  clearCache();
  refreshBadge();
});

chrome.storage.local.get(defaults, loaded => {
  Object.assign(prefs, loaded);
  refreshBadge();

  chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {
    urls: ['*://*/*', 'ws://*/*', 'wss://*/*']
  }, ['blocking', 'requestHeaders']);

  chrome.webNavigation.onCommitted.addListener(onCommitted);
});
