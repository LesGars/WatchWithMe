# Watch with Me

**A browser extensions for Chrome, Opera & Firefox.**

## Features

### Write once and deploy to Chrome, Opera & Firefox

-   Based on WebExtensions. It also includes a tiny polyfill to bring uniformity to the APIs exposed by different browsers.

### Live-reload

-   Your changes to CSS, HTML & JS files will be relayed instantly without having to manually reload the extension. This ends up saving a lot of time and improving the developer experience.

### Platform specific & Environment specific variables

-   You might need to specify different data variables based on your environment. For example, you might want to use a localhost API endpoint during development and a production API endpoint once the extension is submitted to the appstore. You can specify such data in the json files inside `config` directory.
-   You can also set custom data variables based on the platform (different variable for Chrome, FF, Opera).
-   You can also set you own environment variables, by making your own `env/common.js` from `env/common.js.example`, and filling in the placeholders, while keeping the single and double quotes surrounding your variable

## Installation

1. Run `pnpm install`
2. Run `pnpm run build`

### Load the extension in Chrome & Opera

1. Open Chrome/Opera browser and navigate to chrome://extensions
2. Select "Developer Mode" and then click "Load unpacked extension..."
3. From the file browser, choose to `./build/chrome` or (`./build/opera`)

### Load the extension in Firefox

1. Open Firefox browser and navigate to about:debugging
2. Go to this firefox
3. Click "Load Temporary Add-on" and from the file browser, choose `./build/firefox/manifest.json`

## Developing

The following tasks can be used when you want to start developing the extension and want to enable live reload -

-   `pnpm run chrome:dev`
-   `pnpm run opera:dev`
-   `pnpm run firefox:dev`

If you want to use lint or auto fix -

-   `pnpm run lint`
-   `pnpm run lint:fix`

## Packaging

Run `pnpm run dist` to create a zipped, production-ready extension for each browser. You can then upload that to the appstore.

## Debugging

The content script `console.log` messages are readable from the usual browser console of the inspector tool
The backend script `console.log` messages are logged somewhere else

**IMPORTANT** we use the "debug" JS library. In order to see debug messages, you need to run `localStorage.debug = '*'` in the consoles)
[see debug wiki](https://github.com/visionmedia/debug#browser-support)

### Reading background script logs from Chrome

Open the extensions page, make sure the "developer mode" is enabled, and open the page of the background script.
There you'll have access to the Background script console log.
