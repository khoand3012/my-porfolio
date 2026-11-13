# Portfolio revamp: Astro, Tailwind, real-time globe

Date: 2026-11-13. Owner: Khoa Nguyen.

## Intent and why

The portfolio exists to convince two kinds of visitors, headhunters and freelance clients, that Khoa is an experienced software engineer they can trust to hire. Visitors skim for roughly ten seconds. Trust comes from concrete proof (projects, results, a clear way to make contact) more than from visual flair.

The current site (Vite, plain CSS, Three.js globe) fails that job: the hero says only "Hi there! I'm a web developer", with no specialty, no availability and no call to action. The best proof sits behind "click to see my projects" modals. A loading bar gates all content behind six large textures. The content is out of date against Khoa's CV and contains errors (see Content).

Khoa's proudest work is the Crossian storefront project, so it leads.

## Goals

1. Rebuild the site in **Astro** with **Tailwind CSS**, statically output.
2. Redesign the first screen as **"Option A: globe as the stage"** (chosen by Khoa from three mockups): large globe on the right, readable text on the left, an availability tag (wording under Content), headline "Senior Frontend Engineer", one-sentence description, and two buttons: "Email me" and "See the work".
3. Replace all content with what the CV says (see Content), with Crossian first and project proof visible on the page, not in modals.
4. Keep the Three.js globe, reused from the existing code, but make **day and night reflect the real current time** (see Real-time globe).
5. The page text is readable immediately; the globe loads in behind/beside it and fades in. No blocking loading screen.

## Non-goals

- No blog, CMS, i18n or light/dark toggle.
- No new test framework. `pnpm build` (`astro check && astro build`) is the main correctness check; the pure logic (solar position, contact client) gets small tests on Node's built-in `node:test`, run with `pnpm test`.
- No invented numbers, quotes or claims beyond the CV.

## Anti-goals (a failure even if it technically works)

- A generic template look: identical rounded cards, gradient washes, a tracked-out all-caps label above every heading.
- The globe competing with the message, or blocking scroll on touch devices.
- A slow first load for a visitor with ten seconds.
- A globe whose lighting looks plausible but is wrong for the actual time.

## Decisions already made by Khoa

- Astro + Tailwind.
- Hero direction A (above). Palette from the mockup: ink `#0a1024` background, text `#eef1fb`, muted `#aab4d4`, amber accent `#f2b35e` (primary button, text on it `#1a1305`), availability dot `#3ddc97`, borders `#3a4772`. Amber echoes the city lights on the globe's night side.
- Lead with Crossian; use the CV for all content; use the CV email; remove the Masso / Hoot entry entirely.
- Real time comes from `new Date()` at page load (no API).

## Content (source of truth: CV "Khoa CV - Frontend Engineer React TypeScript 2026.docx")

The builder must read the CV file at `C:\Users\Khoa\Documents\CV\Claude outputs\` and use its wording. Summary of what goes where:

- **Hero:** headline "Senior Frontend Engineer". Description line: "React · TypeScript · Accessible UI & Design Systems". Supporting sentence drawn from the CV summary (6+ years, production React/TypeScript, storefront platform and component library). Availability tag: "Open to freelance and full-time · remote (global) or hybrid (Vietnam)", shortened to fit the pill while keeping all three facts (the full line sits in the contact section). Buttons: "Email me" (mailto) and "See the work" (scrolls to work).
- **Selected work**, in this order, each visible as a card or block with problem/role/outcome and tech tags taken from the CV:
  1. Crossian, Selless Storefront System (multi-tenant storefront engine, comparable to Shopify). Include the incident-recovery figure (about 15 minutes to under 30 seconds), the Kafka real-time migration, the A/B testing, the React/Next.js modernisation.
  2. Crossian, Shophelp App (iOS-optimised mobile storefront; checkout with Stripe, Apple Pay, PayPal).
  3. Niteco, React Component Library for Electrolux EU and AEG (Figma to code, Storybook, Module Federation shell).
  4. Niteco, Levande SG (2023 SBR Technology Excellence Award).
  5. Niteco, Dynamic Yield / Optimizely (A/B testing, personalisation).
  6. Toshiba Software Development Vietnam, Power Plant Energy System.
- **Experience timeline** (condensed, dates from CV): Crossian (Apr 2025 – Sep 2026), Niteco (Oct 2022 – Apr 2025), Toshiba Software Development Vietnam (Dec 2020 – Oct 2022). **Education:** B.Sc. Software Engineering, HUST, Jul 2020. The Masso/Hoot entry and the railway-station project are removed.
- **Skills:** use the CV's categories (Frontend; HTML & CSS; Design Systems; APIs & Data; Testing; Build & CI/CD; Cloud, AI & Language). Replace the current six-icon grid and "And more...".
- **Credentials:** IELTS 7.5 (CV). The Optimizely Web Experimentation Expert certification (Oct 2024, Credly link) is on the current site but not in the CV text; keep it unless Khoa says otherwise. Drop the dead `#` IELTS link.
- **Contact:** email `khoa.duongnguyen3022@gmail.com`, phone (+84) 914 510 584, LinkedIn, GitHub. Remove the Facebook link and the old `aaronfebruary95@gmail.com` address everywhere. Keep the profile photo and the contact form.
- **Fixes carried over from the review:** page title and meta description, Open Graph preview image (`me.jpg` exists), "4+ years" corrected to the CV's "6+", form labels properly associated with their inputs, success toast shown only when the submission actually succeeded.

## Real-time globe

**Behaviour:** when the page loads, read the current time with `new Date()` (UTC). Compute the sun's position over the Earth (the subsolar point: latitude equals the solar declination, longitude from UTC time plus the equation of time). Light the globe from that direction, so the lit half, the day/night boundary and the night-side city lights match the real moment. Seasonal tilt falls out of the declination, so it must not be applied twice on top of the existing fixed 23.5° tilt.

**Constraints and consequences:**
- The existing code spins the Earth against a fixed sun, which makes the day/night boundary fixed on screen while continents move. That cannot be correct for real time. The Earth must not spin independently of the light; any visible motion must keep light and Earth in the correct relationship (for example, rotate both together, or move only the camera).
- The existing night-lights shader patch reads `directionalLights[0].direction`; keep the sun as the first directional light or update the shader accordingly.
- Accuracy target: subsolar point within about 1 degree of published values. Builder must verify against known cases (equinox about 0° latitude; June solstice about +23.4°; December solstice about -23.4°; 12:00 UTC puts the subsolar longitude near 0°, offset by the equation of time: about 4° **west** in mid-November, when the Sun runs ~16 min fast, and about 3.5° **east** in mid-February, when it runs ~14 min slow), and confirm the texture's longitude orientation matches (for example, check that Africa/Europe are lit at midday UTC).
- Initial view: centred on Hanoi (my call, so the day/night state is meaningful to a Vietnam-based engineer and visibly changes through the day). Accepted consequence: during Hanoi's daytime the visible face is mostly lit with few amber city lights, unlike the night-time mockup. That is correct and stays; do not fake or bias the lighting to keep the mockup look.
- Keep the light in sync for tabs left open: recompute about once a minute (my call; cheap).

**Rendering requirements:** the globe is a lazy-loaded client-side piece (Astro island or equivalent script; `three` is not in the initial bundle). Reuse the existing Earth, clouds and atmosphere shader. Respect `prefers-reduced-motion`. The globe must not block page scrolling on touch devices.

**Starfield (decided by Khoa): transparent canvas.** The WebGL canvas renders with a transparent background (no `scene.background`). The starfield (`Gaia_EDR3_darkened.png`) is a CSS background on the whole hero, present from first paint whether or not WebGL works, so the text column and the globe sit on the same sky. The 3.2 MB PNG must be served compressed (WebP/AVIF at a sensible width, for example via Astro's image pipeline). Without WebGL2 the hero simply has no globe; layout and starfield are unchanged. The atmosphere glow (additive blending) must be checked to composite cleanly over the CSS background (no dark box or halo around the globe).

## Layout, type, motion (guidance, details left to the builder)

- Desktop: text left, globe right and partly bleeding off the right edge, sized so the headline stays readable. Mobile: globe smaller, behind or above the text, never covering the buttons.
- **Navigation (decided by Khoa):** a small top nav: name (links to `#home`) on the left, then Work · Experience · Skills · Contact. No hamburger menu; on phones the links stay visible (the name may shrink or hide to make room). Not sticky; the scroll-to-top button covers the way back. There is no separate About section; the hero summary and the contact section (photo, long availability line) take its place.
- Left-aligned text, lines under about 80 characters.
- Typography: one self-hosted family with real weights (the current Gilroy is loaded in Regular only, so bold is faux). Choose it deliberately, not a default family. Clear type scale.
- Motion: a single orchestrated moment (globe fade-in), motion that responds to user action, nothing else decorative.
- Quality floor: responsive down to phone width, visible keyboard focus, sufficient contrast (amber on ink passes), reduced motion respected.

## Technical constraints

- Package manager pnpm. `tsc`/Astro check must pass; unused locals fail the build under the current strict config, keep that strictness.
- Tailwind via its current supported Astro integration (builder to confirm the current recommended setup).
- Static output. Previously deployed from `./build`, probably on Vercel; the new output directory changes (Astro defaults to `dist`). Keep deployment working.
- Contact form posts JSON `{name, email, telephone, message}` to the messaging endpoint from an environment variable; rename it to Astro's public env convention and document it. No `.env` is committed.
- New files under `public/assets/` must be added with `git add -f` (the bare `assets` entry in `.gitignore`).
- `CLAUDE.md` describes the old architecture; update it as part of this work.
- Open Graph tags need absolute URLs: set Astro `site` to `https://khoa-nguyen-homepage.vercel.app` and build `og:image`/`og:url` from it.
- The bare `assets` entry in `.gitignore` matches any folder named `assets`, including `src/assets/`; new files there also need `git add -f`.

## Reference material and extra calls (added after reviewer pass)

- **Chosen mockup:** `.superpowers/brainstorm/1418-1794586914/content/hero-directions.html`, card "A. Globe as the stage". Match its composition (text left, large globe right, amber city lights, availability pill, two buttons). Add `.superpowers/` to `.gitignore`.
- **Reading the CV:** it is a .docx. Extract text by unzipping `word/document.xml` and stripping tags (for example with PowerShell `System.IO.Compression.ZipFile`, replacing `</w:p>` with newlines). If the file is missing or unreadable, stop and ask; do not write project copy from memory.
- **Globe motion (my call):** no automatic spinning, and the clouds are static too. The globe is static apart from the real-time lighting and the minute-by-minute refresh, and the visitor can drag to rotate it on desktop. On touch devices dragging must never block page scroll: no drag-to-rotate on touch. Note that three's `OrbitControls` sets `touch-action: none` on its element, so merely disabling rotation is not enough.
- **Decided by Khoa:** the Crossian work is public to describe (use the CV wording) but has no screenshots or links, because the original domains are gone, so the work cards are text-only and must carry the design themselves (typography, tech tags, the headline figure). The availability wording (see Content) replaces the mockup's "Available now · remote · UTC+7".
- **Endpoint tested 2026-11-13:** the live site (`https://khoa-nguyen-homepage.vercel.app`) calls `POST https://email-service-blue.vercel.app/api/discord` (found in its production bundle; the endpoint is a Discord relay). With the JSON body `{name, email, telephone, message}` it returns `200 {"success":true}`, and the CORS preflight succeeds (`Access-Control-Allow-Origin: *`). Use this URL as the endpoint value. Success means 2xx with `success: true`. Note `/api/email` on the same host is a different, non-working path (accepts POST with `200 {}` but delivers nothing); do not use it. Khoa should confirm the third test message arrived in Discord; the builder should still do one real browser submit from the deployed origin.
- **Form (Khoa's decision plus my call):** keep the form (a serverless function, believed to still work; the builder must confirm with a real test once the endpoint URL is supplied) and always show an "Email me" link beside it. Treat any non-2xx response or network failure as an error with an error toast; show success only on 2xx. If the endpoint env var is unset, hide the form and show only the email link.
- **Deployment (my call):** set Astro `outDir` to `build` so an existing Vercel setting keeps working.
- **Optimizely certification and photo (my call):** keep the certification; place the profile photo in the contact/about area, not the hero.

## Left to the builder

Component breakdown, exact spacing and scale, font choice, how the globe island is wired, how cards are laid out, solar-position implementation details, and deployment settings.
