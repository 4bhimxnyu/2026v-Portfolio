# Abhimanyu Singh: portfolio

The personal site of Abhimanyu Singh, full stack developer (and bassist).
Live at **[4bhimxnyu.vercel.app](https://4bhimxnyu.vercel.app)**.

A single-page Next.js site with a dithered WebGL hero, a site-wide glowing
cursor, a 3D point field for skills, a crumple-able resume, and a playable bass
fretboard with a groove you can switch on.

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with live reload |
| `npm run build` | Production build |
| `npm start` | Serve the production build (run `build` first) |
| `npm run lint` | ESLint |
| `npm run prepare-assets` | Publish the resume and profile photo into `public/` (runs automatically before `dev` and `build`) |

Requires Node.js 20 or newer.

## Updating the content

Almost everything lives in plain data files, so most updates need no component changes.

| To change | Edit |
| --- | --- |
| Name, role, email, social links, status line | `src/config/site.js` |
| Selected work and other projects | `src/data/projects.js` |
| Work experience and education | `src/data/experience.js` |
| Skills (grouped by area) | `src/data/skills.js` |
| Resume | Replace the PDF in `Resume/` |
| Profile photo on the Contact card | Add `src/assets/avatar.jpg` (or `.png` / `.webp`) |
| Project images | Add to `public/images/projects/` and set `image` in `projects.js` |

**Resume.** `scripts/prepare-assets.mjs` copies the PDF from `Resume/` to
`public/resume/Abhimanyu_Singh_Resume.pdf` and renders page 1 to
`public/resume/preview.webp` (used by the crumple-able paper in the resume
pop-up). Both are generated on every build, so just replace the PDF and push.

**Profile photo.** Drop `avatar.jpg`, `avatar.png` or `avatar.webp` into
`src/assets/`. It is published to `public/images/avatar.*` on the next
`dev`/`build` and appears on the Contact card. Without one the card shows initials.
A roughly 4:5 portrait works best.

## What's on the page

| Section | Notes |
| --- | --- |
| Hero | DitherVeil portrait (hover to reveal, click for a ripple), name with an iridescent hover |
| About | Includes a split-flap board: design, prototype, build, ship |
| Experience | Timeline from `experience.js` |
| Selected work | Three projects with screenshots, plus "Other projects" |
| Skills | Tabs per area; a three.js point field morphs for each |
| Groove | Playable bass fretboard and a looping funk groove (Web Audio) |
| Contact | Message box with a sling-shot send button, and a ProfileCard |
| Resume | Not on the page: the navbar **Resume** button opens a pop-up with the crumple-able resume, **Download** and **View** |

### The groove

The bass is **physically modelled**, not an oscillator, and voiced as a 1979
Fender Precision Bass. `src/lib/stringModel.js` simulates a plucked string
(extended Karplus–Strong): a delay line one period long, excited with a
fingertip-pluck shape, losing high harmonics and energy on every pass like a
real string, with an all-pass filter for the fractional part of the period so
every fret is exactly in tune (open to fret 20). It also models the P-bass
split-coil pickup: its position along the string (E/A half and D/G half at
slightly different spots) notches the harmonics that give a P its voice.
`src/lib/bass.js` plays those notes through a valve-amp and 8x10-cab chain (low
end, low-mid thump, upper-mid bark, pickup resonance, gentle valve drive),
keeps one note per string (a new pluck chokes the last),
and adds a synthesized drum kit and a swung 16th-note sequencer playing a
two-bar E-minor funk line at 98 BPM.

On the fretboard (`src/components/Groove/`):

- **E / A / D / G** buttons play the open strings (E1, A1, D2, G2).
- **Keys 1 / 2 / 3 / 4** (desktop) play the open E / A / D / G strings while
  the fretboard is on screen (not while typing in the contact form).
- **Click or tap a fret** to play that exact note; the readout names it.
- **Slide:** press a fret and drag along the same string; the ringing note
  glides fret by fret (works with touch too: swipe sideways along a string).
- **Strum:** hold and drag across the strings; hovering just makes them shimmer.
- **Shake to play** (phones and tablets): a quick shake right plays E, left A,
  up D, down G. iPhones ask for motion permission.
- **Haptics** (phones): every note buzzes, longer for the thicker strings
  (Vibration API on Android; the iOS 18+ switch-control haptic on iPhone).

Browsers only allow audio after a click or tap, so the site stays silent until
the visitor presses something. Edit `BASSLINE` in `bass.js` to write your own
line: each entry is `[step, string, fret, length, ghost?]` on a 32-step grid.

## Tech

- **Next.js 16** (App Router) and **React 19**, plain CSS Modules, **Urbanist** via `next/font`
- **three.js** with **React Three Fiber** for the skills point field
- **React Bits** components, vendored into `src/components/`: DitherVeil,
  GlowCursor, GooeyNav, SplitFlapText, SlingButton, ProfileCard, PaperCrumple.
  A few carry small, commented "Portfolio addition" changes (for example, GlowCursor's
  site-wide mode and GooeyNav's scroll-following active state).
- **pdf.js** and **@napi-rs/canvas** (build time only) to render the resume preview
- Deployed on **Vercel**; every push to `main` deploys to production

## Project structure

```text
Resume/                    Resume PDF (+ LaTeX source): the source of truth
scripts/prepare-assets.mjs Publishes resume + avatar into public/
src/
  app/                     layout, page, global styles
  assets/                  avatar.* goes here
  components/              page sections + vendored React Bits components
  config/site.js           personal details and links
  data/                    projects, experience, skills
  hooks/                   media queries, in-view, WebGL detection
  lib/bass.js              Web Audio bass, drums and sequencer
  lib/stringModel.js       physically modelled P-bass string and pickup
  lib/haptics.js           phone vibration (Android) and iOS haptic tick
public/images/             project screenshots, card pattern
```

## Accessibility and performance

- Respects `prefers-reduced-motion` (the cursor trail, string vibration and
  most animation turn off; everything stays usable).
- Everything interactive works by keyboard: the resume pop-up is a native
  `<dialog>`, skill areas are tabs, bass strings have buttons.
- WebGL effects check for support and fall back to static content, and pause
  when they're off-screen or idle.

## Contact form (Web3Forms)

Messages are delivered to your inbox by [Web3Forms](https://web3forms.com),
straight from the browser, with no server code involved.

1. Go to https://web3forms.com, enter the email address you want messages sent
   to, and create an access key. The key arrives in that inbox.
2. Put it in `src/config/site.js` as `web3formsKey`, **or** add it in Vercel
   (Project, then Settings, then Environment Variables) as `NEXT_PUBLIC_WEB3FORMS_KEY`
   and redeploy. The env var wins if both are set.

Access keys are public by design, so committing it is fine. Each email has the
visitor as Reply-To, so replying answers them directly. The free plan covers
250 submissions a month. A hidden honeypot field filters simple bots.

With no key set, the form falls back to opening the visitor's own email app
with the message pre-filled.
