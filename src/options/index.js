'use strict';

const defaults = {
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

const status = document.getElementById('status');

const parseList = value => value
  .split(/\s*,\s*/)
  .map(s => s.replace(/^https?:\/\//, '').split('/')[0].trim())
  .filter((s, i, arr) => s && arr.indexOf(s) === i);

const save = () => {
  chrome.storage.local.set({
    ua: document.getElementById('ua').value.trim(),
    whitelist: parseList(document.getElementById('whitelist').value),
    protected: document.getElementById('protected').value
      .split(/\s*,\s*/)
      .map(s => s.trim())
      .filter((s, i, arr) => s && arr.indexOf(s) === i),
    userAgentData: document.getElementById('userAgentData').checked
  }, () => {
    status.textContent = 'Saved';
    setTimeout(() => {
      status.textContent = '';
    }, 1200);
  });
};

const restore = () => {
  chrome.storage.local.get(defaults, prefs => {
    document.getElementById('ua').value = prefs.ua;
    document.getElementById('whitelist').value = (prefs.whitelist || []).join(', ');
    document.getElementById('protected').value = (prefs.protected || []).join(', ');
    document.getElementById('userAgentData').checked = Boolean(prefs.userAgentData);
  });
};

document.addEventListener('DOMContentLoaded', restore);
document.getElementById('save').addEventListener('click', save);
