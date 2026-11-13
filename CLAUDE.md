# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (`pnpm-lock.yaml`); the readme uses `npm run`, which also works.

```bash
pnpm dev        # Vite dev server
pnpm build      # `tsc && vite build` — type-checks first, outputs to ./build (not dist)
pnpm preview    # serve the production build
```

There is no test runner and no linter. `pnpm build` (specifically the `tsc` step) is the only correctness check; `tsconfig.json` is `strict` with `noUnusedLocals`/`noUnusedParameters`, so unused imports/variables fail the build.

## Architecture

A single-page personal portfolio: a static `index.html` + `index.css` (plain CSS despite `sass-embedded` being a dependency) with a Three.js globe rendered behind the hero section. Likely deployed on Vercel (`.vercel` is gitignored).

- **`index.html`** holds all content (sections `#home`, `#aboutme`, `#experience`, `#certifications`, `#contact`, plus `<dialog class="modal" id="...">` for experience details). Content changes happen here, not in TS. Modal buttons link to dialogs via `data-target="<dialog id>"`.
- **`src/main.ts`** is a single `Main` class instantiated at module load. Its constructor wires all DOM behaviour by querying fixed selectors (smooth scroll on `a[href^="#"]` → `section#<hash>`, modals, contact form + toast, scroll-to-top), then calls `render3dScene()` only if `WebGL.isWebGL2Available()`. Without WebGL2 it hides `.loading-screen` and adds `with-background` to `section#home` as a fallback — keep that path working when touching the loading flow.
- **Loading flow:** `Earth` and `main.ts` load textures via `THREE.TextureLoader` and each texture's onLoad callback calls `ProgressBarManager.getInstance().updateProgress(fraction, message)`. The fractions are percentages that must sum to 100 (10 envmap + 20×4 Earth/bump/clouds/ocean + 10 night lights); reaching 100 triggers `completeLoading()`, which hides `.loading-screen` and reveals the title, scroll hint and source link. Adding or removing a texture means rebalancing these numbers or the loading screen never dismisses. `ProgressBarManager` is a singleton that queues updates and animates the `<progress id="progress-bar">` sequentially, with a delay between tasks, and it requires those DOM elements to exist at construction.
- **`src/components/earth.ts`** builds the globe as a group (tilted 23.5°): a `MeshStandardMaterial` sphere (albedo/bump/ocean-as-roughness+metalness/night-lights emissive), a transparent cloud sphere, and an additive-blended back-side atmosphere sphere using `src/shaders/{vertex,fragment}.glsl` (imported through `vite-plugin-glsl`). The night-lights effect works by patching the standard material's fragment shader via `onBeforeCompile` (replaces `#include <emissivemap_fragment>` using `directionalLights[0].direction`), so it depends on the sun light being the first directional light in the scene. Earth/cloud rotation speeds are applied per-frame in `animateEarth(deltaTime)`.
- **`src/components/globeLight.ts`** wraps the sun directional + ambient lights. Note it overrides the intensities passed in (0.8 / 0.3). `star.ts` is currently unused.
- **Contact form** POSTs JSON `{name, email, telephone, message}` to `import.meta.env.VITE_MESSAGING_API_ENDPOINT`. No `.env` is committed; without it the form logs an error to the console, but still shows the success toast.

## Assets and gotchas

- Static files live in `public/assets/` (fonts, images, textures) and are referenced at runtime as `assets/...` / `/assets/...` URLs, not imported. Vite `base` is `"./"`.
- `.gitignore` contains a bare `assets` entry, which matches `public/assets`. Existing files there are tracked, but any **new** asset must be added with `git add -f`.
- `vite.config.js` splits `three` into its own chunk (`manualChunks`) and names chunks `assets/[name]-[hash].js`.
