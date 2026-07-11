# Stack Rush 🏗️

A polished, addictive one-tap tower-stacking arcade game. Pure HTML/JS/Canvas — **no build step, no dependencies, no server**. Just a single `index.html`.

## Play locally
Double-click `index.html`, or open it in any browser. Works offline. High scores save via `localStorage`.

## Deploy (free hosting)
Because it's a single static file, you can host it anywhere:

- **Netlify / Vercel / Cloudflare Pages** — drag the folder in, done.
- **GitHub Pages** — push the folder, enable Pages.
- **itch.io** — upload as an HTML game (great for organic traffic + built-in audience).

## Monetize with ads — AdSense go-live checklist
The site is already **AdSense-ready**: two marked ad slots (top leaderboard + a bottom box that shows on the game-over screen), a **privacy policy** (`privacy.html`), a **cookie/consent notice**, and an **`ads.txt`** placeholder.

Before applying / after approval:
1. **Fill the placeholders** (required):
   - In `privacy.html`, replace `[your-contact-email]` with a real contact address.
   - In `ads.txt`, replace `pub-0000000000000000` with your AdSense publisher ID (after approval).
2. **Apply for Google AdSense** with your live URL (needs some real traffic/content first).
3. **After approval**, paste your AdSense `<script>` tag into the `<head>` of `index.html` (commented placeholder is there).
4. **Replace each `.ad-slot` div** with your AdSense unit `<ins>` code.
5. **Consent for EEA/UK:** enable Google's free built-in consent message in your AdSense dashboard (Privacy & messaging → GDPR). Google requires a certified CMP there for personalised ads in those regions; the on-site cookie bar is a general notice, not a full CMP.
6. Commit + push — it auto-deploys.

**Tips for real ad revenue on hyper-casual games:**
- Game-over interstitials convert best — the bottom slot is positioned for that.
- Add a "Continue?" reward-ad button later (rewarded video pays the most per impression).
- Traffic is everything: post clips to TikTok/Reels/Shorts, submit to game portals (CrazyGames, Poki, itch.io), and consider a catchy domain.
- AdSense has policies — don't click your own ads, don't place ads over gameplay.

## Features & where to wire real services
- **Endless mode** + **Daily Challenge** (a deterministic seed from the calendar date gives everyone the same target that day — resets at midnight local time).
- **Local leaderboard** (top 10, saved on the device) with 3-letter initials.
- **Rewarded-ad "Continue"** on game over (one per run) — revives the tower so players keep going.

Two clearly-commented hooks in `index.html`:

1. **Rewarded ad** — `playRewardedAd()` currently runs a self-contained *simulation* (3-2-1 countdown, no network). Replace its body with a real call:
   - **Google H5 Ad Placement API**: `adBreak({ type:'reward', rewardGranted:onReward, ... })` (needs the H5 games ad API enabled on AdSense).
   - **CrazyGames SDK**: `CrazyGames.SDK.ad.requestAd('rewarded', { adFinished:onReward })`.
   - **Poki SDK**: `PokiSDK.rewardedBreak().then(ok => ok && onReward())`.
   Rewarded video is the highest-paying ad format in casual games — worth enabling early.

2. **Global leaderboard** — works local-only out of the box. To go global, deploy the included **`worker.js`** (a complete Cloudflare Worker + KV leaderboard — free tier) and paste its URL into `LEADERBOARD_API` at the top of the `<script>` in `index.html`. The game then submits scores and shows a live global top-10, falling back to the local board if the network is down. Deploy steps are documented at the top of `worker.js`.

3. **Share button** — on the game-over screen. Uses the native share sheet on mobile (`navigator.share`) and copies a "I stacked N — beat me!" message + link to the clipboard on desktop. Free organic growth; no setup needed.

## Customize
Everything lives in `index.html`. Easy knobs near the top of the `<script>`:
- `BASE_W` — starting block width (difficulty)
- `speedFor(s)` — how block speed ramps with score (gentle start → cap)
- `perfectTol()` — how forgiving "perfect" stacks are (loosens early, tightens later)
- `dailyTarget` formula in `reset()` — daily challenge difficulty
- `spawnConfetti()` / `perfectChime()` — celebration + sound feel
- Colors via `colorFor()` / CSS `:root` variables

## Owning it
It's 100% your code — one static file, no licenses or dependencies to worry about. To make it *officially* yours online: buy a domain, host the folder (Netlify/Vercel/Cloudflare Pages/GitHub Pages), and put your name/copyright in the footer.
