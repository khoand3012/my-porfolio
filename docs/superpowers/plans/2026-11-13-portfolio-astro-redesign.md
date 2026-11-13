# Portfolio Astro Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio in Astro + Tailwind with the "globe as the stage" hero, CV-sourced content, and a globe whose day/night side matches the real current time.

**Architecture:** Static Astro site (`outDir: build`). Content lives in one typed data module and is rendered by small `.astro` components. The globe is a client script that lazily loads the whole globe module (`await import("./globeScene.ts")`, which pulls in `three`) after first paint, and draws on a transparent canvas over a CSS starfield that covers the hero. The sun direction comes from a pure, tested `solar.ts`. The contact form uses a small tested client (`contactClient.ts`) behind a thin DOM script.

**Tech Stack:** Astro (current stable), Tailwind CSS via its current Astro/Vite integration (confirm in docs), TypeScript strict, Three.js 0.173, `vite-plugin-glsl`, pnpm, `node:test` (built in; no new test framework) with `@types/node` for type checking.

**Spec:** `docs/superpowers/specs/2026-11-13-portfolio-astro-redesign-design.md` (read it first, plus the CV .docx path it names).

## Global Constraints

- Package manager pnpm; `pnpm build` must run `astro check && astro build` and pass; `pnpm test` runs `node --test "src/lib/*.test.ts"` and must pass. TypeScript strict with `noUnusedLocals`/`noUnusedParameters`.
- Relative TS imports use explicit `.ts` extensions (`./solar.ts`), because Node's type stripping requires them; keep `allowImportingTsExtensions` enabled.
- Astro `outDir: "build"`, static output, `site: "https://khoa-nguyen-homepage.vercel.app"`.
- Palette (hex, from the chosen mockup): background `#0a1024`, text `#eef1fb`, muted `#aab4d4`, amber accent `#f2b35e` (primary button; text on it `#1a1305`), availability dot `#3ddc97`, borders `#3a4772`. Define as Tailwind theme tokens, not repeated literals.
- Hero copy: headline "Senior Frontend Engineer"; description "React · TypeScript · Accessible UI & Design Systems"; tag "Open to freelance and full-time · remote (global) or hybrid (Vietnam)" (shorten to fit the pill, keep all three facts); buttons "Email me" and "See the work".
- Nav: name → `#home`, then Work (`#work`) · Experience (`#experience`) · Skills (`#skills`) · Contact (`#contact`). Not sticky, no hamburger; links stay visible at 320px.
- Contact: email `khoa.duongnguyen3022@gmail.com`, phone (+84) 914 510 584, LinkedIn `https://www.linkedin.com/in/khoand3012/`, GitHub `https://github.com/khoand3012`. No Facebook; the string `aaronfebruary95` must not appear in `src/` or `public/` (the old `index.html` is deleted in Task 1).
- Remove the Masso/Hoot and railway-station content entirely. No invented numbers or claims; wording comes from the CV.
- Contact endpoint: `https://email-service-blue.vercel.app/api/discord` via env `PUBLIC_MESSAGING_API_ENDPOINT`; success = 2xx and JSON `success === true`. Never use `/api/email`.
- Globe: neither the Earth nor the clouds spin on their own; the sun is the first directional light; no double axial tilt; initial view centred on Hanoi (21.03° N, 105.85° E); real lighting even when that means Hanoi's daytime face is mostly lit (no faking); transparent canvas over the CSS starfield; never block touch scrolling; respect `prefers-reduced-motion`; no blocking loading screen; `three` is not in the initial page script.
- `.gitignore`'s bare `assets` entry matches both `public/assets/` and `src/assets/`: new files in either need `git add -f`. Add `.superpowers/` to `.gitignore`.
- The user has not asked for commits. Work on a branch `astro-revamp`; ask before the first commit, then commit per task if allowed.
- Text lines under about 80 characters; visible keyboard focus; mobile-first down to 320px; no horizontal page scroll (the globe bleeding off the right edge is clipped by the hero).

## Review Focus

1. Visitor's device in a non-UTC timezone: lighting must derive from UTC epoch time only (`getTime()`), never local getters. (Task 3 test.) A visitor whose clock is wrong will get wrong lighting; that is accepted.
2. Year/day boundaries and leap years in the solar calculation (Dec 31 → Jan 1, Feb 29), and the sign of the equation of time. (Task 3 tests.)
3. WebGL2 unavailable or a texture fails to load: text, buttons and starfield stay intact; no globe, no error overlay. (Task 5 check.)
4. Form: empty required fields, double submit, network failure, a 200 without `success: true`, endpoint unset. (Task 7 tests.)
5. Phone-width hero (320px): globe never covers the buttons; touch-drag over the globe still scrolls the page (watch for `OrbitControls`' `touch-action: none`). (Task 4, Task 5 and Task 8 checks.)
6. Initial bundle: the page's first script must not contain three. (Task 5 check.)

---

### Task 1: Astro + Tailwind scaffold and base layout

**Files:**
- Modify: `package.json`, `tsconfig.json`, `.gitignore`
- Create: `astro.config.mjs`, `src/env.d.ts`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/pages/index.astro`
- Delete: `vite.config.js`, `src/vite-env.d.ts` (after moving its `*.glsl` declaration), `index.html`, `index.css`, `src/main.ts`, `src/components/star.ts`. Keep `src/utils/progressBarManager.ts` until Task 4 (it is still imported by `earth.ts`), and keep `earth.ts`, `globeLight.ts`, `src/shaders/` for Task 4. Content you need from the old page comes from git history (`git show HEAD:index.html`) or is quoted in this plan.

**Interfaces:**
- Produces: `Base.astro` with props `{ title: string; description: string }` and a default slot; Tailwind theme tokens `bg-ink`, `text-snow`, `text-muted`, `bg-amber`, `text-amber`, `border-line`, `bg-live` (names mapping to the palette above).

- [ ] **Step 1:** Install `astro`, Tailwind and its Astro/Vite integration, `@astrojs/check`, `typescript`, `@types/node`; keep `three`, `@types/three`, `vite-plugin-glsl`; drop `sass-embedded`, `vite`. Scripts: `dev: astro dev`, `build: astro check && astro build`, `preview: astro preview`, `test: node --test "src/lib/*.test.ts"` (quoted so Node expands the glob itself, which also works on Windows).
- [ ] **Step 2:** `astro.config.mjs`: `site: "https://khoa-nguyen-homepage.vercel.app"`, `outDir: "build"`, the Tailwind plugin, and `vite-plugin-glsl` in `vite.plugins`. `tsconfig.json` extends Astro's strict preset and keeps `noUnusedLocals`, `noUnusedParameters`, `allowImportingTsExtensions`. `src/env.d.ts`: Astro's client types reference plus the `declare module "*.glsl" { const value: string; export default value; }` block from `src/vite-env.d.ts`; then delete `src/vite-env.d.ts`.
- [ ] **Step 3:** `global.css`: Tailwind import, `@theme` tokens from the palette, `@font-face` for one self-hosted family with 400 and 700 (files in `public/assets/fonts/`, your choice of a distinctive family, not Gilroy-Regular-only), body background/text, `:focus-visible` outline in amber, `html { scroll-behavior: smooth }` only under `prefers-reduced-motion: no-preference`, reduced-motion reset.
- [ ] **Step 4:** `Base.astro`: `<html lang="en">`, title, meta description, Open Graph and Twitter card tags with absolute URLs built from `Astro.site` (`og:image` = `new URL("/assets/images/me.jpg", Astro.site)`, `og:url`), favicon `/assets/images/coding.svg`, global CSS import. `index.astro` renders a placeholder `<h1>` inside it.
- [ ] **Step 5:** Delete the old files listed above. Add `.superpowers/` to `.gitignore`. Run `pnpm build`. Expected: exits 0, `build/index.html` exists, its `og:image` is an absolute `https://` URL. Run `pnpm dev` and open the page: dark ink background, light text, custom font loaded.
- [ ] **Step 6:** Commit (if allowed): `chore: scaffold Astro and Tailwind`.

### Task 2: Typed content module

**Files:**
- Create: `src/data/profile.ts`

**Interfaces:**
- Produces (exported from `profile.ts`): `profile` (`name`, `headline`, `description`, `availability` (short pill text), `availabilityLong`, `summary`, `email`, `phone`, `links: {label,url}[]`), `nav: {label,href}[]`, `work: WorkItem[]`, `experience: Role[]`, `education`, `skills: SkillGroup[]`, `credentials: Credential[]`, with
  `type WorkItem = { id: string; company: string; title: string; context: string; bullets: string[]; tech: string[]; note?: string }`,
  `type Role = { company: string; title: string; start: string; end: string }`,
  `type SkillGroup = { label: string; items: string[] }`,
  `type Credential = { name: string; issued: string; url?: string }`.

- [ ] **Step 1:** Read the CV text (extract `word/document.xml`; stop and ask if unreadable). Fill every export from it: six `work` items in spec order (Selless, Shophelp, Component Library, Levande SG incl. the 2023 SBR Technology Excellence Award as `note`, Dynamic Yield/Optimizely, Power Plant Energy System); three `experience` roles and one `education` entry with CV dates; seven `skills` groups with the CV's labels; credentials: IELTS 7.5 (no link) and Optimizely Web Experimentation Expert (Oct 3 2024, `https://www.credly.com/badges/2f01cb70-ba22-4547-8c37-dbd908ca7ed6/linked_in_profile`). `nav` holds the four links from Global Constraints.
- [ ] **Step 2:** `pnpm build` passes. Grep `src` for `aaronfebruary95`, `Facebook`, `Hoot`, `Masso`: expected no matches.
- [ ] **Step 3:** Commit (if allowed).

### Task 3: Solar position (pure, tested)

**Files:**
- Create: `src/lib/solar.ts`, `src/lib/solar.test.ts`

**Interfaces:**
- Produces: `export function subsolarPoint(date: Date): { latDeg: number; lonDeg: number }` (lon in −180..180, east positive) and `export function toEarthVector(latDeg: number, lonDeg: number): [number, number, number]` returning `(cosφ·cosλ, sinφ, −cosφ·sinλ)`. This matches three.js `SphereGeometry` UVs with an equirectangular map whose left edge is 180° W, provided the Earth mesh has no extra Y rotation (Task 4 removes `rotateY(-0.3)`); still confirm visually in Task 4.
- `solar.ts` has no imports; time derived only from `date.getTime()` (UTC), never local getters.

- [ ] **Step 1: Write failing tests** with `node:test` + `node:assert` (import `./solar.ts` with the extension), asserting (tolerance 1° unless noted):
  - `2026-03-20T14:46:00Z` (March equinox): lat ≈ 0 (tolerance 0.5°).
  - `2026-06-21T08:24:00Z` (June solstice): lat ≈ 23.4.
  - `2026-12-21T20:50:00Z` (December solstice): lat ≈ −23.4.
  - `2026-11-13T12:00:00Z`: lon ≈ **−4.0** (tolerance 0.5°). The equation of time is about +16 min (Sun fast, solar noon at Greenwich ≈ 11:44 UTC), so at 12:00 UTC the subsolar point is already west of Greenwich.
  - `2026-02-11T12:00:00Z`: lon ≈ **+3.5** (tolerance 0.5°). The equation of time is about −14 min (Sun slow), so the subsolar point is still east of Greenwich. These two cases together pin the sign.
  - Leap day `2028-02-29T12:00:00Z` returns finite lat/lon.
  - `2026-12-31T23:59:59Z` and `2027-01-01T00:00:00Z` give lon differing by under 0.1° and lat by under 0.05°.
  - `toEarthVector(0,0)` ≈ `[1,0,0]`, `toEarthVector(0,90)` ≈ `[0,0,-1]`, `toEarthVector(90,0)` ≈ `[0,1,0]`.
  - Timezone independence: set `process.env.TZ = "Asia/Ho_Chi_Minh"`, compute for a fixed date, set `process.env.TZ = "America/Los_Angeles"`, compute again (Node re-reads `TZ` when it is assigned); results are identical.
- [ ] **Step 2:** Run `pnpm test` (Node ≥ 22.18 strips types natively; this machine has Node 24). Expected: FAIL, module not found.
- [ ] **Step 3:** Implement with the standard low-precision NOAA/Meeus formulas (days since J2000, mean longitude/anomaly, ecliptic longitude, obliquity, declination, equation of time defined as apparent minus mean solar time, positive in November); subsolar lon = −15·(UTC hours − 12) − EoT in degrees (EoT minutes × 0.25), normalised to −180..180.
- [ ] **Step 4:** Run `pnpm test`. Expected: all PASS. Run `pnpm build` (checks the test file's types too).
- [ ] **Step 5:** Commit (if allowed).

### Task 4: Globe scene with real-time sun

**Files:**
- Create: `src/components/globe/globeScene.ts`
- Modify (move from `src/components/`): `earth.ts`, `globeLight.ts` into `src/components/globe/`; keep `src/shaders/*.glsl`
- Delete: `src/utils/progressBarManager.ts` (and the empty `src/utils/`)

**Interfaces:**
- Consumes: `subsolarPoint`, `toEarthVector` from `src/lib/solar.ts`.
- Produces: `export async function mountGlobe(container: HTMLElement, opts: { onReady: () => void; onFail: () => void }): Promise<{ dispose: () => void }>`; `Earth` gains `getGroup(): THREE.Group` and `GlobeLight.setSunDirection(v: [number, number, number]): void`. `globeScene.ts` imports `three` statically; the bundle split happens because the caller imports `globeScene.ts` dynamically (Task 5).

- [ ] **Step 1:** Port `Earth`: remove `animateEarth`, both `rotateY(-0.3)` calls and the fixed 23.5° tilt; clouds are static (no rotation of any kind). Remove the `ProgressBarManager` import and delete `progressBarManager.ts`. Load the five Earth textures (albedo, bump, clouds, ocean, night lights) through a `THREE.LoadingManager`: its `onLoad` → `opts.onReady`, its `onError` → `opts.onFail`. Keep the atmosphere shader and the `onBeforeCompile` night-lights patch.
- [ ] **Step 2:** `GlobeLight`: sun is a child of the Earth group so Earth and light share a frame; `setSunDirection` places it at `direction × 100`; its `target` is added to the scene at the origin. Set the sun first among directional lights.
- [ ] **Step 3:** `mountGlobe`: create a `WebGLRenderer({ alpha: true, antialias: true })` with a transparent clear colour and **no `scene.background`** (the starfield is CSS, Task 5); append its canvas to `container`; size it with a `ResizeObserver` on the container (not `window`); cap pixel ratio at 2. Set the sun direction from `new Date()` immediately and again every 60 s. Orient the group so Hanoi faces the camera.
  Controls: only when `matchMedia("(pointer: fine)").matches`, create `OrbitControls` with zoom and pan disabled and `autoRotate` off, then set `renderer.domElement.style.touchAction = "pan-y"` (OrbitControls sets `none`, which would block touch scrolling on touchscreen laptops). On coarse pointers create no controls and give the canvas `pointer-events: none`.
  Render on demand only: after load, on controls `change`, on the 60 s sun update and on resize; no continuous `requestAnimationFrame` loop. `dispose` clears the interval, disconnects the observer, disposes controls and renderer.
- [ ] **Step 4:** Verify orientation (the spec's check): in the dev page, temporarily override the date to 12:00 UTC and log the sun vector. The lit centre must be over West Africa/Atlantic, Europe/Africa lit, East Asia dark. At the current time, Hanoi's lit/dark state must match whether it is day in Hanoi. Fix `toEarthVector` if the texture is mirrored (and update its Task 3 test). Check the atmosphere glow over a non-black page background: no dark box or halo around the globe (tune `premultipliedAlpha`/the shader's alpha if needed).
- [ ] **Step 5:** `pnpm build` passes. Commit (if allowed).

### Task 5: Nav and hero section with the globe

**Files:**
- Create: `src/components/Nav.astro`, `src/components/Hero.astro`, `src/components/globe/Globe.astro`, `src/assets/textures/starfield.png` (copied from `public/assets/textures/Gaia_EDR3_darkened.png`; add it with `git add -f`)
- Delete: `public/assets/textures/Gaia_EDR3_darkened.png` once nothing references it (grep first)
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `profile`, `nav` (Task 2), `mountGlobe` (Task 4, loaded dynamically).
- Produces: `Nav.astro`; `Hero.astro` (section id `home`; its "See the work" button links to `#work`).

- [ ] **Step 1:** `Nav.astro`: a `<nav aria-label="Primary">` at the top of the hero: name → `#home` on the left, the four `nav` links on the right. Plain text links, amber on hover/focus, no pill/card styling, not sticky. At 320px all four links fit on one line (the name may shrink or hide below a breakpoint); no hamburger.
- [ ] **Step 2:** `Hero.astro` follows `.superpowers/brainstorm/1418-1794586914/content/hero-directions.html` card A: availability pill with green dot, h1, description line, supporting sentence from `profile.summary`, buttons "Email me" (`mailto:`) and "See the work" (`#work`). Starfield: the hero gets a CSS background from the starfield image, optimised at build time with Astro's `getImage` (WebP or AVIF, width about 1920, quality about 70; target under 400 KB), with `bg-ink` underneath. Text left; globe container absolutely positioned right, bleeding off the right edge on desktop, with the hero clipping horizontal overflow (`overflow-x: clip`). On phones the globe sits behind/above the text, smaller, with `pointer-events: none` so it never covers the buttons.
- [ ] **Step 3:** `Globe.astro`: a `<script>` that checks WebGL2 with `document.createElement("canvas").getContext("webgl2")` (not three's `WebGL` helper, which would pull three in). If available, on `requestIdleCallback` (fallback `setTimeout`) it runs `const { mountGlobe } = await import("./globeScene.ts")` and mounts. On `onReady` it fades the container in (opacity transition, skipped under reduced motion). If WebGL2 is unavailable, or `onFail` fires or the import rejects, it removes the globe container; the starfield and text are already complete. Text must be readable before any of this runs.
- [ ] **Step 4:** Check the bundle: after `pnpm build`, the script that `build/index.html` references directly must not contain three (grep it for `WebGLRenderer`; three must sit only in a separate lazily-loaded chunk).
- [ ] **Step 5:** Manual verification in the browser at 1440×900 and 360×780: nav and headline readable, buttons visible, globe fades in over the same starfield as the text column, Hanoi in view, no horizontal scroll. Force failure (block a texture in DevTools, or disable WebGL) and confirm the hero stays complete with no globe. Touch emulation: dragging on the globe scrolls the page.
- [ ] **Step 6:** `pnpm build` passes. Commit (if allowed).

### Task 6: Work, experience, skills, credentials sections

**Files:**
- Create: `src/components/Work.astro`, `src/components/WorkCard.astro`, `src/components/Experience.astro`, `src/components/Skills.astro`, `src/components/Credentials.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `work`, `experience`, `education`, `skills`, `credentials` (Task 2). `WorkCard.astro` props: `{ item: WorkItem; featured?: boolean }`.

- [ ] **Step 1:** `Work.astro` (id `work`) renders the six items; the first (Selless) is `featured` and larger, with the headline figure set as type, since there are no images. Cards are text-only; do not give every item the same rounded-card-plus-shadow treatment; vary hierarchy (featured vs standard, tech tags as plain text lists).
- [ ] **Step 2:** `Experience.astro` (id `experience`) renders the three roles and the education entry as a simple timeline (this content really is a sequence); `Skills.astro` (id `skills`) the seven groups; `Credentials.astro` the two credentials (link only where `url` exists).
- [ ] **Step 3:** Verify in browser at 1440 and 360 widths: no horizontal scroll, text lines under about 80 characters, links have visible focus, every nav link lands on its section. Check every dated entry against the CV.
- [ ] **Step 4:** `pnpm build` passes. Commit (if allowed).

### Task 7: Contact section, form client, footer, scroll-to-top

**Files:**
- Create: `src/lib/contactClient.ts`, `src/lib/contactClient.test.ts`, `src/scripts/contactForm.ts`, `src/components/Contact.astro`, `src/components/Footer.astro`, `src/components/Toast.astro`, `src/components/ScrollTop.astro`, `.env.example`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Produces: `export type ContactPayload = { name: string; email: string; telephone: string; message: string }`; `export type ContactResult = { ok: true } | { ok: false; reason: "invalid" | "network" | "rejected" | "unconfigured" }`; `export async function submitContact(endpoint: string | undefined, payload: ContactPayload, fetchImpl?: typeof fetch): Promise<ContactResult>`.

- [ ] **Step 1: Write failing tests** (`node:test`, stub `fetchImpl`): `submitContact(undefined, valid)` → `{ok:false, reason:"unconfigured"}`; empty `name`, invalid `email` (no `@`), or empty `message` → `"invalid"` without calling fetch; fetch returning `{ok:true, json: async()=>({success:true})}` → `{ok:true}` and the body sent is JSON with exactly keys `name,email,telephone,message`; `{ok:true}` with body `{}` → `"rejected"`; `{ok:false, status:500}` → `"rejected"`; fetch throwing → `"network"`.
- [ ] **Step 2:** Run `pnpm test`. Expected: the new tests FAIL.
- [ ] **Step 3:** Implement `submitContact` (default `fetchImpl = fetch`).
- [ ] **Step 4:** Run `pnpm test`. Expected: all PASS.
- [ ] **Step 5:** `Contact.astro` (id `contact`): every `<label>` linked by `for` to its input id; form (name, email, telephone optional, message) plus an always-visible "Email me" link and phone; if `import.meta.env.PUBLIC_MESSAGING_API_ENDPOINT` is unset, render only the email/phone block. The contact section also carries `profile.availabilityLong` and the profile photo. `contactForm.ts` wires submit: disables the button while sending (blocks double submit), shows `Toast` success only for `{ok:true}`, an error toast otherwise with a message per reason (invalid → names the missing fields; network/rejected → "Couldn't send. Please email me instead." with the mailto), resets the form on success. `.env.example` documents `PUBLIC_MESSAGING_API_ENDPOINT=https://email-service-blue.vercel.app/api/discord`; create a local `.env` the same way for testing.
- [ ] **Step 6:** `Footer.astro` (name, year, email, phone, LinkedIn, GitHub) and `ScrollTop.astro` (appears after scrolling 100px; scrolls to `#home`; respects reduced motion).
- [ ] **Step 7:** Browser verification: submit an empty form (error toast, focus first invalid field); submit a valid form tagged "Plan test, ignore" (success toast, Discord message arrives; ask Khoa to confirm); stop the network in DevTools and submit (error toast, form not reset).
- [ ] **Step 8:** `pnpm build` passes. Commit (if allowed).

### Task 8: Cleanup, docs, final verification

**Files:**
- Modify: `CLAUDE.md`, `package.json` (if needed)
- Delete: dead assets only if unreferenced (`pizza.svg`, `FuturyLight-MAOLv.woff`, `facebook.svg`, `hoot.png`, `Gilroy-Regular.woff2` if replaced, other old icons): grep `src` and `public` before deleting. Confirm nothing from Task 1's or Task 4's delete lists is left.

- [ ] **Step 1:** Rewrite `CLAUDE.md` to describe the new architecture (Astro + Tailwind, content in `src/data/profile.ts`, nav and sections, the lazily-imported globe module on a transparent canvas over the CSS starfield, the real-time sun and `solar.ts`, env var, `site` and `outDir: build`, the `git add -f` gotcha for `public/assets/` and `src/assets/`, `.ts` import extensions, `pnpm test`).
- [ ] **Step 2:** Run `pnpm build` and `pnpm test`, then grep `src public` for `aaronfebruary95`, `facebook`, `Hoot`, `Masso`, `/api/email`, `VITE_`: expected no matches.
- [ ] **Step 3:** Serve `pnpm preview`; check at 1440×900, 768×1024 and 320×640: no horizontal scroll, nav links on one line, hero buttons never covered, keyboard tab order reaches every link and the form with visible focus, reduced-motion emulation shows no fade/animation or smooth scrolling. Run a Lighthouse audit on mobile; report the performance, accessibility and SEO scores (target: accessibility ≥ 95, performance ≥ 85; if lower, report the cause rather than hiding it).
- [ ] **Step 4:** Report back to Khoa with screenshots (hero desktop and mobile) and the Lighthouse numbers; note that the Vercel project should keep deploying from `build` and needs `PUBLIC_MESSAGING_API_ENDPOINT` set in its environment variables.
- [ ] **Step 5:** Commit (if allowed).
