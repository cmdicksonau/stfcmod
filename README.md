# STFC Community Mod Website

Modern static website for `netniV/stfc-mod`, built with React + TypeScript + Vite for GitHub Pages / Cloudflare Pages style deployments.

## What this site includes

- Home page with project overview and quick actions
- Getting-started section
- Download/install section with release/install links
- Dedicated **Mod Config Builder** with:
  - grouped settings across all major config sections
  - searchable controls
  - import existing `.toml`
  - live preview
  - copy to clipboard
  - download `community_patch_settings.toml`
- Responsive layout for mobile/desktop
- Basic accessibility and SEO foundations

## Tech stack

- React 19
- TypeScript
- Vite 8
- ESLint

## Local development

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (typically `http://localhost:5173`).

## Build and verify

```bash
npm run lint
npm run build
```

Production assets are generated into `dist/`.

## Deploy

### Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`

### GitHub Pages

Any workflow that installs dependencies and publishes `dist/` works.

Example build steps:

```bash
npm ci
npm run build
```

Publish `dist/` as your Pages artifact.

## Mod config implementation and maintenance

The mod config editor is data-driven and maintained in:

- Schema/defaults: `/src/data/configSchema.ts`
- TOML parser/serializer: `/src/lib/toml.ts`
- UI/editor flow: `/src/App.tsx`

To maintain parity with future mod settings:

1. Add or update fields in `configSchema.ts` (section/group/key/type/default).
2. Confirm import/export behavior in `toml.ts` for new value types.
3. Verify in the UI and run:
   - `npm run lint`
   - `npm run build`

## Notes

- This website intentionally keeps dependencies minimal.
- Generated TOML output targets `community_patch_settings.toml` usage for STFC Community Mod.
