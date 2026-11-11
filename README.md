# Whiskey Student — strategy website

A small website for the plan behind the channel:

- **Overview**: your two goals, the 1,000-follower target, and links to everything.
- **Content strategy**: positioning, pillars, series, production rhythm, distillery playbook, learning resources.
- **Growth plan**: monetization requirements, the Instagram and YouTube growth engines, schedules, brand-deal readiness.
- **Calendar**: the weekly posting template and all 12 weeks (Nov 9 – Jan 31), colour-coded by pillar.
- **Ideas**: all 60 ideas with their opening hooks.

It uses the same look as the Whiskey Student app, works on phone, iPad and desktop, follows light and dark mode, and tells search engines not to index it.

## Edit the content

Everything lives in `content/`:

| File | What it is |
|---|---|
| `strategy.md` | Content strategy (Markdown) |
| `growth.md` | Growth plan (Markdown) |
| `calendar.json` | The 12-week calendar and weekly template |
| `ideas.json` | The idea bank |

Edit a file on GitHub (pencil icon) and commit. The site rebuilds itself. To preview on your Mac first: `npm install`, then `npm run build`, then open `dist/index.html`.

The app is still where you work day to day. This site is the shareable, read-only version of the plan. If you change the strategy in the app, copy the text across (Plan → Strategy → Edit, select all, paste into `content/strategy.md` or `growth.md`).

## Option A: GitHub Pages (free, public)

**Anyone with the link can read it**, including your follower targets and brand-deal plan. It's hidden from search engines, but not private.

1. Create a new repo, e.g. `whiskey-student-strategy`, and upload everything in this folder (including the hidden `.github` folder).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. The included workflow builds and publishes on every push. The site appears at `https://<your-username>.github.io/whiskey-student-strategy/`.

## Option B: Private, with Cloudflare Pages + Access (free)

The code still lives on GitHub (the repo can be private), but only people whose email you approve can open the site.

1. Push this folder to a **private** GitHub repo.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick the repo.
   - Build command: `npm run build`
   - Build output directory: `dist`
3. After the first deploy: **Zero Trust → Access → Applications → Add an application → Self-hosted**, set the domain to your `*.pages.dev` address, and add a policy: **Allow → Emails →** your email (plus anyone you choose).
4. Visitors get a one-time code by email before the site opens. Delete the `.github/workflows` folder if you go this way, since GitHub Pages isn't used.

Access is free for small teams (up to 50 users). Check Cloudflare's current plan limits when you sign up.
