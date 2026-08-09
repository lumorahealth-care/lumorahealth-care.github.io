# Lumora Health Waitlist Landing Page

A landing page and waitlist collection site for **Lumora Health**, a platform connecting
Africans in the diaspora with licensed African doctors back home for on-demand virtual care.

## Features

- Modern, responsive landing page (hero, how it works, value props, doctor recruitment, FAQ)
- Tabbed waitlist questionnaires for **patients** and **doctors**
- Multi-step forms with progress bar, per-step validation, and success states
- Submissions saved to `localStorage` (see `script.js` for the backend hook point)

## Tech

Plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8000
```

## Connecting a real backend

Form submissions currently persist to `localStorage` under the key `lumora-waitlist`.
To collect responses for real, replace the `saveSubmission` function in `script.js`
with a `fetch()` POST to your endpoint (Formspree, Google Apps Script, Airtable, or your own API).
