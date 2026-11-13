# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm 11 (`pnpm-lock.yaml`, pinned via `packageManager`). Node >= 22.23.4 is required (Astro 7's minimum, declared in `engines`).

```bash
pnpm dev        # Astro dev server
pnpm build      # `astro check && astro build` — type-checks first, outputs to ./build (not dist)
pnpm preview    # serve the production build
pnpm test       # node --test "src/lib/*.test.ts" (Node's built-in runner, no framework)
```

There is no linter. `pnpm build` (the `astro check` step) and `pnpm test` are the correctness checks; `tsconfig.json` is strict with `noUnusedLocals`/`noUnusedParameters`, so unused imports/variables fail the build.

## Architecture

A single-page personal portfolio: Astro 7 (static output) + Tailwind 4 + TypeScript, with a lazily loaded three.js globe in the hero. Deployed on Vercel from `build` (`.vercel` is gitignored). `astro.config.mjs` sets `site` and `outDir: "build"` and registers `@tailwindcss/vite` and `vite-plugin-glsl`.

- **Content** lives in `src/data/profile.ts` (name, headline, availability, contact links, work items, roles, skills, credentials). Change copy there, not in the components. Wording comes from the CV; do not invent numbers or claims.
- **Page:** `src/pages/index.astro` composes `src/layouts/Base.astro` (head, meta, font preload) with `Nav`, `Hero`, `Work` (+ `WorkCard`), `Experience`, `Skills`, `Credentials`, `Contact`, `Footer`, `Toast`, `ScrollTop` from `src/components/`. Section ids are `#home #work #experience #skills #credentials #contact`; the nav is not sticky and has no hamburger.
- **Styling:** `src/styles/global.css` defines the palette as Tailwind `@theme` tokens (`ink`, `snow`, `muted`, `amber`, `amber-ink`, `live`, `line`) and the Space Grotesk `@font-face`s. Use the tokens, not hex literals. The starfield is a CSS background in `Hero.astro` (the texture is optimised with `getImage`). Layout is mobile-first down to 320px with no horizontal scroll; respect `prefers-reduced-motion` (`motion-safe:` utilities).
- **Globe:** `src/components/globe/Globe.astro` renders an empty `[data-globe]` div and, when idle and WebGL2 exists, dynamically imports `globeScene.ts` so `three` stays out of the initial script. If WebGL2 is missing or anything fails, the div is removed and the page (text, buttons, starfield) is unaffected. The canvas is transparent over the CSS starfield and must never block touch scrolling. `earth.ts` builds the sphere (albedo/bump/ocean/night lights via `onBeforeCompile`, which relies on the sun being the first directional light), clouds and an atmosphere shader (`src/shaders/*.glsl`). Neither Earth nor clouds spin on their own; the initial view is centred on Hanoi.
- **Real-time sun:** `src/lib/solar.ts` computes the subsolar point from the UTC epoch (`getTime()` only, never local getters) and `toEarthVector` turns it into the light direction, so day/night matches the real current time. `globeLight.ts` wraps the sun and ambient lights.
- **Contact form:** `src/scripts/contactForm.ts` handles the DOM (validation state, button, toasts) and `src/lib/contactClient.ts` does validation and the POST of `{name, email, telephone, message}` (trimmed) to `import.meta.env.PUBLIC_MESSAGING_API_ENDPOINT`. Success means a 2xx response with JSON `success === true`; otherwise the error toast offers a `mailto:` fallback. Copy `.env.example` to `.env` to test locally; set the variable in Vercel's environment settings for production. Never use `/api/email`.

## Assets and gotchas

- Runtime static files live in `public/assets/` (fonts, images, globe textures) and are referenced by `/assets/...` URLs. Files processed by Astro (e.g. the starfield) live in `src/assets/` and are imported.
- `.gitignore` contains a bare `assets` entry, which matches both `public/assets/` and `src/assets/`. Existing files are tracked, but any **new** file in either needs `git add -f`.
- Relative TypeScript imports use explicit `.ts` extensions (`./solar.ts`), because `node --test` runs the `src/lib` tests with Node's type stripping; keep `allowImportingTsExtensions` enabled.
- `PUBLIC_` env vars are inlined at build time; changing the endpoint needs a rebuild.
- Texture loading is not part of any loading screen: the globe fades in when ready, and a failed texture just removes the globe.
