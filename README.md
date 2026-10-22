# For Jyeshtha

A lightweight installable web app for a personal birthday gift. It is a static site: there is no account system or cloud sync. Photos, documents, reminder settings, water logs, calendar additions, and profile notes remain in the browser storage on the device where they were added.

## Publish with GitHub Pages

The included `.github/workflows/deploy-pages.yml` publishes the static files when code is pushed to `main` or `master`, or when manually started from the repository's Actions tab.

1. Push this folder to a GitHub repository.
2. In the repository, open **Settings → Pages** and set the publishing source to **GitHub Actions**.
3. Open **Actions → Deploy to GitHub Pages** and wait for the first run to finish. GitHub displays the site URL in the successful deployment.
4. Open that HTTPS URL on the iPhone in Safari. Tap **Share → Add to Home Screen**, leave **Open as Web App** enabled if offered, then tap **Add**.
5. Launch it from the Home Screen. In **Care → Allow notifications**, grant permission if desired.

The app needs HTTPS (or localhost during development) for its service worker and install features. Keep `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, and `icons/` at the same relative paths when publishing. When changing cached files, increment `CACHE_NAME` in `sw.js` so installed copies refresh. The worker now uses versioned app caches only and supports offline loading of previously cached app assets.

## Privacy before publishing

This is a static site with no sign-in. A public deployment can be opened by anyone who has the URL, and the JavaScript source contains the personal messages, name, and date details shipped with the app. The `noindex` page setting asks search engines not to index it, but it does not restrict access. Use a host with access control or remove personal details before publishing publicly if you don't want them exposed. Photos and vault documents added inside the app remain in that browser's local storage and are not uploaded to the site.

## iPhone and notification limits

- Home Screen web apps support Web Push on iOS/iPadOS 16.4 and later. This project checks reminder times only while the app is open and displays a local notification then. It does not include a push server, so reminders cannot arrive while the app is closed or the phone is offline.
- True background reminders require a push subscription flow plus a server that stores subscriptions and sends Web Push at the configured times. A static host alone cannot do that.
- This is a web app, not a signed native iOS app. App Store distribution requires a native iOS project, Apple signing, and App Store review.
- The local document vault is not encrypted or backed up. Do not rely on it as secure storage for Aadhaar or other sensitive records.

## Local data

Use the same browser profile on the same device to see saved items. Clearing Safari website data can delete the app's stored photos, documents, and notes. There is currently no export, account recovery, or cross-device sync.
