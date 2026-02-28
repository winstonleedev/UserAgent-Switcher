# User-Agent Switcher (Whitelist Mode)

This folder contains a minimal reimplementation of the extension with only:

- Whitelist mode
- Disable spoofing list (`protected` URL keywords)
- Optional `navigator.userAgentData` exposure
- Toolbar icon click to enable/disable (no popup)

## Load in Firefox (Temporary Add-on)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `src/manifest.json`

## Configure

1. Open the extension's **Preferences** from `about:addons`
2. Set:
   - Spoofed user-agent string
   - Whitelist domains (comma-separated)
   - Protected URL keywords (comma-separated)
   - `Expose "navigator.userAgentData" object`
3. Click **Save**

## Use

- Click the extension icon to toggle global enable/disable.
- Badge `ON` means spoofing engine active; `OFF` means disabled.

## Quick Test

1. Add `webbrowsertools.com` to whitelist.
2. Open `https://webbrowsertools.com/useragent/`
3. Confirm reported UA changes while extension is `ON`.
4. Click icon to `OFF` and refresh; confirm browser default UA returns.
