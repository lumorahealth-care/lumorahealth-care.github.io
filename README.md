# Lumora Health Waitlist Landing Page

A landing page and waitlist collection site for **Lumora Health**, a platform connecting
Africans in the diaspora with licensed African doctors back home for on-demand virtual care.

## Features

- Modern, responsive landing page (hero, how it works, value props, doctor recruitment, FAQ)
- Tabbed waitlist questionnaires for **patients** and **doctors**
- Multi-step forms with progress bar, per-step validation, and success states
- Submissions POST to an [Un-static Forms](https://un-static.com) endpoint

## Tech

Plain HTML, CSS, and vanilla JavaScript. No build step, no dependencies.

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 8000
```

## Form backend

Submissions are POSTed to the Un-static Forms endpoint configured as `FORM_ENDPOINT`
in `script.js` (also set as the `action` attribute on both forms). Each submission
includes a `role` field (`patient` or `doctor`) plus all questionnaire answers.
