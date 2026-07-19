# Flux Screensaver — Agent Instructions

## Project State

- **Current version:** v2.1.0 (`feat/tabatha-context-view` branch, PR pending review)
- **Current focus:** Tabatha Context View mode shipped to branch; Phase 1 housekeeping still open
- **Architecture:** Electron app registered as Windows screensaver (.scr)
- **Installation path:** `C:\ProgramData\FluxScreensaver\FluxScreensaver.scr`
- **Build command:** `npm run electron:build`
- **Dev command:** `npm run dev` + `npm run electron:serve`

---

## Critical Files (Read These First)

Only read what you need. Practice **progressive disclosure** — start with the roadmap, then drill into the specific phase plan you're working on.

| File | Purpose | When to read |
|------|---------|-------------|
| `FLUX-ROADMAP-v1.md` | Master roadmap, all phases | Always — first thing |
| `FLUX-DESKTOP-PLAN.md` | Desktop app phases 1–4 detail | When working on the screensaver app |
| `FLUX-WEBSITE-PLAN.md` | Website plan (Phase 5) | When working on the website |
| `FLUX-MARKETING-PLAN.md` | Monetization, distribution, campaigns | When working on launch / business |
| `FLUX-MOBILE-LAUNCHER-PRD.md` | Mobile launcher PRD | When working on mobile app |
| `FLUX-DESKTOP-WALLPAPER-PLAN.md` | Future wallpaper mode | Only if asked about wallpaper |
| `package.json` | Version, scripts, deps | Before building or versioning |
| `electron/main.js` | Main process, window creation | Before modifying Electron behavior |
| `src/App.tsx` | Config window UI + settings | Before modifying settings UI |
| `src/FlipClock.tsx` | Clock component + settings model | Before modifying clock behavior |
| `src/FlipClock.css` | Clock visual styles | Before modifying clock appearance |
| `install.ps1` | Windows installer script | Before releasing a build |
| `FLUX-ARCHITECTURE.md` | Architecture decision log (ADRs) | Before making or changing technical decisions |

**Do NOT read every file every time.** Read the roadmap → identify your phase → read only the files relevant to that phase.

---

## How to Approach This Project

1. **Check the roadmap first.** Read `FLUX-ROADMAP-v1.md` to understand where we are.
2. **Identify your phase.** Work on the current phase only. Don't scope-creep into future phases.
3. **Read the phase plan.** The desktop or website plan has file-level detail for each phase.
4. **Build incrementally.** Each phase is an independent release. Test before moving on.
5. **Respect the version.** Use `npm version patch|minor` — never hardcode versions. See **Versioning Policy** below.
6. **Site sync protocol.** After any version bump, ensure `website/site-data.json` is updated (see `FLUX-WEBSITE-PLAN.md` § Site–App Sync Protocol). If the sync script doesn't exist yet, flag it in your session notes.
7. **Maintain the architecture log.** When making or changing a technical implementation decision (e.g., data format, storage location, protocol choice), add or update an entry in `FLUX-ARCHITECTURE.md`. Never delete old entries — supersede them. Link to the plan artifact that details the decision.

---

## Versioning Policy

**Every distinct change increments the version by exactly 1 in the appropriate position.** This applies to all three positions (`major.minor.patch`).

- **Patch** (`x.x.+1`): A single bug fix, config tweak, or non-functional change.
- **Minor** (`x.+1.0`): A single new feature, new setting, or behavioral change.
- **Major** (`+1.0.0`): A single breaking change, architectural shift, or major milestone.

**If a release contains multiple changes, the version increments by the count of changes at the highest applicable position.**

Examples:
- 3 bug fixes → `v2.0.0` → `v2.0.3`
- 4 new features → `v2.0.0` → `v2.4.0`
- 2 features + 1 bug fix → `v2.0.0` → `v2.2.1`
- 1 breaking change + 2 features → `v2.0.0` → `v3.2.0`

**Why:** This makes version numbers meaningful. Looking at `v2.0.0` → `v2.4.0` tells you "4 distinct features were added." Looking at `v2.0.0` → `v2.1.0` tells you it was a single addition. It prevents version inflation from bulk releases while ensuring every change is individually represented.

---

## Session Handoff Protocol

**After every session, update the `Session Log` section below.** Append a new entry. Do not modify or delete previous entries.

**NEVER modify the sections above** (Project State through How to Approach). Those are managed by Malkio and updated only during planning sessions.

Exception: You MAY update the `Current version` and `Current focus` lines in "Project State" if you ship a new version, but nothing else above the session log.

---

## Session Log

<!-- AGENTS: Append a new entry below after every session. Never delete previous entries. -->

| Date | Agent | Phase | Work Done | Version After | Next Steps |
|------|-------|-------|-----------|---------------|------------|
| 2026-04-19 | Antigravity | Planning | Created roadmap, split plans into desktop/website/wallpaper documents | v2.0.0 (unchanged) | Begin Phase 1 when approved |
| 2026-04-25 | Antigravity | Session Intelligence | Created implementation plan for inactive time, smart skip, session logging, task widget. Created `FLUX-ARCHITECTURE.md` with 4 ADRs. Updated versioning policy in `agents.md`. | v2.0.0 (unchanged) | Implement after approval |
| 2026-07-18 | Dex (Claude Fable 5) | Tabatha Context View | Added a "Tabatha Context View" mode (single new feature → minor bump): config-window toggle (persisted `fluxSettings.enableTabathaContextView`, pushed to main over new `flux-settings-updated` IPC and written to `userData/flux-settings.json` since main can't read renderer localStorage), primary-display screensaver window loads `https://tabatha.pondocean.co/sidecar/?embed=desk` when enabled (secondary displays stay on the flip clock), hardened webPreferences for that window (`webSecurity:true`, `nodeIntegration:false`, `contextIsolation:true`, `partition:'persist:tabatha'`), `did-fail-load` fallback back to the local flip clock, and a "Sign in to Tabatha…" button opening an interactive window on the same `persist:tabatha` partition for one-time auth. Local flip-clock window's webPreferences left as-is. | v2.1.0 | PR review/merge by CeeCee; native per-display Context View config; Pomodoro/other sidecar surfaces as they ship |

---

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- HEADBOX STATUS: none | PREP: not started                           -->
<!-- Headbox System: Mojo/headbox/ | Spec: Mojo/headbox/HEADBOX-SPEC.md -->
<!-- ═══════════════════════════════════════════════════════════════════ -->

## Headbox (Not Yet Active)

This workspace is part of the Headbox system but does not yet have an
active headbox. A Headbox standardizes agent instructions, session tracking,
and cross-project consistency.

**Agent behavior during prep:**

1. **Work normally.** Prioritize the user's task above all else.
2. **Observe & infer.** As you work, note the project's structure, key files,
   conventions, and workflows. Write observations to `headbox-prep-notes.md`.
   Infer answers from the codebase before asking — state what you think and let
   the user correct you.
3. **Elicit naturally.** When conversation allows (max 1 per 5-7 exchanges):
   - State what you observe: "This looks like a React + Vite project — right?"
   - Piggyback on user descriptions to fill fields without explicit questions
   - Ask directly only when you can't infer: "What's the current version?"
4. **Fill prep notes.** Each answer goes into `headbox-prep-notes.md`.
5. **Escalate if stalled.** After 3 sessions with no progress, be more direct.
   After 10 sessions, draft with `[TBD]` gaps and present.
6. **When ready, offer activation.**
   > "I've collected enough context to draft a Headbox for this project.
   > Want me to generate it?"

**Full prep protocol:** `Mojo/headbox/prep/headbox-prep-interview.md`

<!-- ═══════════════════════════════════════════════════════════════════ -->
<!-- END HEADBOX PREP                                                   -->
<!-- ═══════════════════════════════════════════════════════════════════ -->
