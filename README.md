# UserAgent-Switcher

A simple browser extension for spoofing your User-Agent string.

A fork of [this extension](https://github.com/ray-lothian/UserAgent-Switcher) that actually works on Firefox out-of-the-box without fiddling with the settings.

This extension modifies both the User-Agent in your browser's request headers and relevant JavaScript `navigator` properties (e.g., `navigator.userAgent`, `navigator.appVersion`, `navigator.platform`). It also supports modern browser identification mechanisms such as Client Hints headers and the `navigator.userAgentData` object, ensuring consistent and comprehensive spoofing across all detection methods.

## Key Features

* **Comprehensive Spoofing:** Modifies both HTTP request headers and JavaScript `navigator` objects.
* **Granular Control:**
    * Spoof User-Agent per specific hostname.
    * Set different User-Agents for individual browser tabs.
    * Utilize Firefox's container feature for distinct User-Agents per container (not available on manifest v3 yet).

## Demo / Review

See the extension in action:

Pending

## Installation - Official Releases

Pending

## Usage

For detailed instructions on how to use the extension, including configuration options and features, please visit:
[UserAgent-Switcher Usage Guide](https://webextension.org/listing/useragent-switcher.html)

## Manual Installation (from Source Files)

### Build an `.xpi` Package from `src/`

This repository includes a helper script to package the extension directly from the `src/` directory:

```bash
bash package-xpi.sh
```

The generated package is saved as `dist/useragent-switcher.xpi`.

You can also provide a custom output name:

```bash
bash package-xpi.sh my-custom-name
```

This will create `dist/my-custom-name.xpi`.

If you have cloned or downloaded the source files from this repository, you can manually install the extension in your browser. This is useful for development, testing the latest (potentially unstable) code, or if you prefer to install extensions directly from source.

### For Mozilla Firefox

#### Method 1: Load Temporary Add-on (for Development/Testing)

This method allows you to load the extension directly from the source files. It will remain installed until you restart Firefox or manually remove it.

1.  **Get the Source:** Ensure you have the extension's source files (including `manifest.json` at the root of the extension's directory structure) on your local machine.
2.  **Open Firefox.**
3.  **Navigate to Debugging Tools:** Type `about:debugging` into the Firefox address bar and press Enter.
4.  **Select "This Firefox":** In the left-hand sidebar, click on "This Firefox".
5.  **Load Add-on:** Click the "Load Temporary Add-on..." button.
6.  **Select Manifest File:** Navigate to the directory where you have the extension's source code and select the `manifest.json` file (or any file within the extension's root directory). Click "Open."

The UserAgent-Switcher extension should now be loaded. If you make changes to the source code, you can click the "Reload" button next to the extension's entry on the `about:debugging` page.

#### Method 2: Package as an .xpi File and Install (More Persistent Local Install)

1.  **Prepare Files:**
    * Ensure all necessary source files are present, with `manifest.json` at the root.
    * If this repository uses a build process, run it first.
2.  **Create a ZIP Archive:**
    * Navigate to the directory containing the finalized extension files.
    * Select all files and subfolders *inside* this directory. The `manifest.json` file must be at the root level within the ZIP archive.
    * Compress the selected items into a ZIP archive (e.g., `user_agent_switcher.zip`).
3.  **Rename to .xpi:** Change the file extension from `.zip` to `.xpi` (e.g., `user_agent_switcher.xpi`).
4.  **Install in Firefox:**
    * Open Firefox and go to the Add-ons Manager (`about:addons` or `Ctrl+Shift+A` / `Cmd+Shift+A`).
    * Click the gear icon (⚙️) on the Extensions panel.
    * Select "Install Add-on From File..."
    * Locate and select your `.xpi` file and click "Open." Confirm the installation.

### Important Considerations for Manual Installation (from Source):

* **Extension ID Consistency:** For stable development and testing (especially if your extension uses storage or needs a consistent ID for APIs):
    * **Chromium-based browsers:** You can add a `"key"` field to your `manifest.json`. This is a Base64 encoded public key. If the `key` field is present when loading an unpacked extension, Chrome/Edge/Opera will derive a consistent ID. Without it, the ID may change if the path to the extension folder changes.
    * **Firefox:** Ensure the `manifest.json` includes a unique add-on ID via the `browser_specific_settings.gecko.id` field (e.g., `"id": "user-agent-switcher@your-domain.com"`).
* **Persistence:** Loading an unpacked extension (Chromium) or as a temporary add-on (Firefox) typically means the extension is active for the current session or until manually reloaded/removed. The Firefox `.xpi` method provides a more permanent installation for that browser.
* **Packaging for Distribution:** If you intend to distribute the extension more widely outside of simply loading the source files:
    * **Chromium-based browsers:** Extensions are packaged into `.crx` files, often handled through the respective web stores (Chrome Web Store, Microsoft Edge Add-ons, Opera addons).
    * **Firefox:** Extensions are packaged as signed `.xpi` files, typically distributed via [addons.mozilla.org (AMO)](https://addons.mozilla.org/developers/).
    * Signing is a crucial step for official distribution to ensure security and integrity. Standard browser versions often restrict or warn against installing unsigned extensions from outside their official stores.

---

## Contributing

Contributions are welcome! If you have ideas for improvements, new features, or have found a bug, please feel free to:

1.  Open an issue in the repository to discuss the change or report the bug.
2.  Fork the repository and submit a pull request with your changes.

Please ensure any contributions align with the project's coding style and goals.

## License

This project is licensed under the **Mozilla Public License 2.0 (MPL-2.0)**.

You can find a copy of the license in the `LICENSE` file in this repository or at [https://www.mozilla.org/en-US/MPL/2.0/](https://www.mozilla.org/en-US/MPL/2.0/).
