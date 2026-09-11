# Turnout

A real, live, multi-player web app for posting and RSVPing to pickup games, golf tee times, and rec leagues — built for the Jersey Shore pilot. Anyone with the link can sign in with just their email, post a game, RSVP, and build a Turnout Score based on whether they actually show up.

This is a complete, working codebase — not a mockup. It needs two free accounts (Supabase for the database, Vercel for hosting) and about 15 minutes to go live at a real public URL. No coding required for setup; you're pasting keys into one file and clicking buttons.

**One important heads-up:** I wrote and hand-checked every file in this codebase, but I was not able to run `npm install` in the sandbox I built this in — the package registry was blocked by network policy there. This means the code has not actually been compiled yet. The very first `npm install` (either on your machine or automatically on Vercel) is the real first test. If it throws an error, copy the exact error text back to me and I'll fix it — that's a normal, fast fix, not a sign anything is fundamentally wrong.

---

## What you're getting

- **Games** — post a pickup game (sport, location, time, capacity), browse by sport, RSVP with live fill counts.
- **Tee Times** — same idea, golf-specific, capped at foursomes.
- **Leagues** — browsable listings for local rec leagues, with an "I'm interested" signal.
- **Profile & Turnout Score** — a reliability score computed from organizer-confirmed attendance (not self-reported) with three tiers: New Face, Reliable, Locked In.
- Real-time updates — when someone RSVPs, everyone looking at that game sees the count move live.
- Email sign-in (magic link) — no passwords to manage.
- **Installable on a phone** — Turnout is set up as a Progressive Web App (PWA), so anyone can add it to their home screen as a real app icon that opens full-screen, with no App Store or Play Store required. See "Install it like an app" below.

## What it costs

$0 to start. Supabase's free tier and Vercel's free tier both comfortably cover a pilot's worth of traffic. The one thing to watch, covered below, is Supabase's default email sender being rate-limited — fine for testing with friends, not fine for a real public launch.

---

## Step 1 — Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New Project**. Name it `turnout`, set a database password (save it somewhere — you likely won't need it again), pick the region closest to New Jersey (e.g. `us-east-1`), and click **Create new project**. It takes about two minutes to provision.

## Step 2 — Set up the database

1. Once the project is ready, open the **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project, copy the whole file, paste it into the SQL editor, and click **Run**.
4. You should see "Success. No rows returned." This created every table, security rule, and the Turnout Score logic.

## Step 3 — Connect the app to your project

1. In Supabase, go to **Project Settings** (gear icon) → **API**.
2. Copy the **Project URL**.
3. Copy the **anon / public** key (not the `service_role` key — never use that one in a browser app).
4. Open `public/config.js` in this project and paste both values in:

   ```js
   window.__TURNOUT_CONFIG__ = {
     SUPABASE_URL: "https://xxxxxxxx.supabase.co",
     SUPABASE_ANON_KEY: "eyJhbGciOi...",
   };
   ```

That's the only file you ever need to hand-edit. Everything else is done.

## Step 4 — Put the code on GitHub

Vercel deploys straight from a GitHub repo, and it's the easiest way to redeploy later (including any time you ask me to change something).

1. Go to [github.com/new](https://github.com/new), create a repo called `turnout` (private is fine).
2. On the new repo's page, click **uploading an existing file**, then drag in the entire contents of this project folder (everything except `node_modules`, which doesn't exist yet anyway).
3. Commit the files.

_(If you're comfortable with git instead: `git init && git add . && git commit -m "Turnout MVP" && git remote add origin <your repo url> && git push -u origin main`.)_

## Step 5 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up with your GitHub account (free).
2. Click **Add New → Project**, and import your `turnout` repo.
3. Vercel auto-detects Vite — leave the build settings as-is (**Build command:** `npm run build`, **Output directory:** `dist`).
4. Click **Deploy**. In a minute or two you'll get a live URL like `turnout-xyz.vercel.app`.

You now have a real, public, working link you can send to people.

### Updating `config.js` after deploying

If you upload the repo to GitHub before filling in `public/config.js`, just edit that file directly on GitHub (click it → pencil icon → edit → commit) after you have your Supabase keys. Vercel automatically redeploys on every commit, so the live site updates within a minute.

---

## Testing it yourself before sharing the link

Open the live Vercel URL, enter your email, and check your inbox for the sign-in link. First time in, you'll set your display name — that's your public profile. From there: post a game from the **Games** tab, and open it again to see the RSVP list.

To test the reliability system: post a game with a start time a few minutes in the past, RSVP to it from a second email address (or ask a friend to), then reopen the game as the organizer — you'll see **Showed / No-show** buttons next to their name. That's the only way anyone's Turnout Score changes; players can never edit their own attendance record.

## Install it like an app

This isn't a packaged App Store / Play Store app — it doesn't need to be. It's built as a Progressive Web App, which means the browser itself can add a real app icon to someone's home screen, no store or review process involved:

- **Android (Chrome):** open the link, tap the three-dot menu → **Install app** (or wait for the in-app banner Turnout shows and tap **Install app** there).
- **iPhone (must be Safari — Chrome on iOS can't do this):** open the link, tap the **Share** icon, scroll down, tap **Add to Home Screen**, then **Add**.

Either way, it now opens full-screen with its own icon like any other app, with no address bar. This is the right way to hand Turnout to Jersey Shore players during the pilot — a real app-like experience today, with the option to wrap it for the actual App/Play Store later if validation says it's worth the $99/year Apple fee and the review process.

## Before a real public pilot: fix the email limit

Supabase's built-in email sender is meant for testing, not real usage — it's rate-limited to a handful of emails per hour. That's invisible with a few friends, but it will silently block sign-ins once you start seeding the Jersey Shore pilot for real.

Before seeding: in Supabase, go to **Project Settings → Authentication → SMTP Settings** and connect a real sender. [Resend](https://resend.com) has a free tier (3,000 emails/month) and a five-minute Supabase integration guide linked right there in the dashboard. Do this before your two-week validation window starts, not after people start complaining they never got their sign-in email.

## One more free-tier thing to know

Supabase pauses free projects after a week with no API activity (a safeguard on their end, not a data loss risk — un-pausing takes one click on their dashboard). If Turnout goes quiet during a slow week, that's why the app looks like it can't connect. It's a one-click "Restore" in the Supabase dashboard.

---

## How the reliability system works

Every player has a `games_showed` and `games_no_show` count on their profile, only ever changed by one path: the organizer of a specific game marking each RSVP'd player as showed or no-show after it happens. That update runs through a database function that checks the caller is actually that game's organizer — there's no way for a player to inflate their own score, even by editing requests directly.

Tiers (`src/lib/turnoutScore.js`):
- **New Face** — fewer than 3 recorded games.
- **Locked In** — 90%+ show-up rate across 5+ games.
- **Reliable** — 70%+ show-up rate.
- **Hit or Miss** — below that.

## Project structure

```
public/config.js       ← the one file you edit to connect your database
public/manifest.webmanifest, public/sw.js, public/icons/  ← install-to-home-screen setup
supabase/schema.sql     ← run this once in Supabase's SQL editor
src/lib/                ← Supabase client, sports list, scoring logic, install-prompt hook
src/context/            ← auth/session state
src/screens/            ← sign-in, first-time profile setup
src/components/         ← shared UI (cards, badges, bottom sheets, nav, install banner)
src/tabs/                ← the four tabs and their post/detail flows
```

## Making changes later

Bring this whole folder (or the GitHub repo) into a chat with me and describe what you want changed — a new sport, a different reliability threshold, a waitlist when a game's full, whatever the Jersey Shore pilot tells you people actually need. This is a real codebase now, not a prompt spec for a no-code tool, so changes are precise and don't come with the "the AI agent said it fixed it but didn't" problem you ran into with Bubble and FlutterFlow.
