# cavill.github.io

Static site for `cavill.github.io`.

## Local preview

```bash
python3 -m http.server 4173
```

## Media workflow

The deployed site stays fully static. Responsive images, optimized videos, and
the media manifest are generated locally and committed.

```bash
npm install
npm run build:media
```

Generated files:

- `images/generated/*`
- `media-manifest.js`
