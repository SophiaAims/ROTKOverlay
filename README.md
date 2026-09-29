# ROTK stats overlay

A cute stats overlay for H1Z1: Return of the King. Pick which stats to show,
pick a font and colors, copy the link, paste it into OBS. That's it.

## Using it

1. Open the site and paste your ROTK overlay link (the `rotk.app/overlay/...` one).
2. Tick the stats you want and style it however you like. The preview updates as you go.
3. Hit **Copy link**, then in OBS add a **Browser Source** and paste it as the URL.

Your link has your ROTK key in it, so don't show it on stream.

## How it's put together

Almost everything is driven by lists, so adding stuff is mostly one-liners:

- `js/stats.js` – every stat that can be shown
- `js/settings.js` – every setting, its default, and how it's saved in the URL
- `js/presets.js` – color themes
- `js/effects/` – animations. Each one is its own file, listed in `effects/index.js`
- `js/api.js` – the only file that talks to ROTK. If their API changes, fix it here
- `js/render.js` – draws the stats
- `js/overlay.js` – the page OBS loads
- `js/config-ui.js` – the settings page. The form is built from `settings.js`, so new settings show up on their own

All settings live in the overlay URL, so there's no server or database.
Stats come straight from ROTK's public overlay API.

## Running it locally

The JS uses modules, which browsers won't load from a double-clicked file. From this folder run:

```
python3 -m http.server
```

then open http://localhost:8000.
