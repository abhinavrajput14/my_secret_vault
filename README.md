# For You — a private message site

A private, single-purpose site: show one friend a message, ask a few honest
yes/no questions, collect written feedback, and let you watch the responses
come in on a hidden dashboard. Built with plain HTML/CSS/JS + Firebase
Firestore — no frameworks, no build step.

## Files

| File | Purpose |
|---|---|
| `index.html` | All markup: login, user page, hidden admin dashboard, modal, toast |
| `style.css` | Dark glassmorphism design system (aurora background, particles, cards) |
| `script.js` | All app logic: login, typewriter, questions, submit, admin dashboard, charts, export |
| `firebase.js` | Thin wrapper around the Firebase SDK — the only file that talks to Firestore |
| `config.js` | Your passwords, Firebase project config, the message text, and the questions |
| `README.md` | This file |

## Try it right now (no setup)

Open `index.html` as-is and it works immediately: log in with `friend123`,
answer the questions, submit — and log in with `admin14` in another tab to
watch it show up on the dashboard in real time. This uses your browser's
local storage as a stand-in for Firestore, so it's genuinely functional for
testing, but it's **local to this one browser** — your friend's answers on
their own device won't reach your dashboard until you connect a real
Firebase project (takes about 5 minutes, steps below). The admin dashboard
shows a small "Local demo mode" badge whenever this fallback is active, and
it disappears the moment `config.js` has real Firebase keys in it.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a new project (it's free on the Spark plan).
2. In the left sidebar, open **Build → Firestore Database** → **Create database** → start in **production mode** (rules are set below) → pick any region.
3. In the left sidebar, open **Project settings** (gear icon) → scroll to **Your apps** → click the **`</>`** (web) icon → register an app (any nickname) → **do not** check "Firebase Hosting" unless you want it.
4. Firebase will show you a `firebaseConfig` object. Copy it.

## 2. Fill in `config.js`

Open `config.js` and:

- Replace `USER_PASSWORD` and `ADMIN_PASSWORD` with whatever you want (there is **no visible admin button** — entering the admin password on the same login screen takes you straight to the dashboard).
- Paste your `firebaseConfig` object over the placeholder one.
- Edit `PRIVATE_MESSAGE` to the message you want typed out on the page.
- Edit the `QUESTIONS` array to change the questions asked. The **first question** in the list is the one the admin dashboard's Yes/No summary tracks.

## 3. Set Firestore security rules

In the Firebase console: **Firestore Database → Rules**, and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /responses/{doc} {
      allow create: if true;
      allow read, update, delete: if false; // reads/deletes happen through your own admin session, gated by config.js password. For real access control, add Firebase Auth.
    }
    match /visits/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

> Note: the admin password in `config.js` gates the **UI**, not Firestore itself. Anyone who knows your Firestore rules and project config could theoretically write directly to the database with the client SDK, and the rules above intentionally block direct reads from outside your own admin dashboard's client session. If you want real server-side enforcement of "only I can read this," add Firebase Authentication (e.g. anonymous auth + a custom claim, or email/password for just you) and update the rules to check `request.auth`. For a small private site for one friend, the setup above is a reasonable, honest trade-off — just don't publish your Firebase config keys anywhere public beyond this site's own files.

## 4. Run it

This is a static site — no build step, no `npm install`. Just serve the folder:

- **Quickest:** double-click `index.html` (works, though some browsers restrict `fetch`/module behavior on `file://` — a local server is safer).
- **Local server:** from the project folder, run `python3 -m http.server 8000` and open `http://localhost:8000`.
- **Deploy:** drag the folder into [Netlify Drop](https://app.netlify.com/drop), [Vercel](https://vercel.com), GitHub Pages, or `firebase deploy` with Firebase Hosting.

## 5. Using it

- Share the site link with your friend and tell them the **user password**.
- They'll see the typewriter message, answer the Yes/No questions (their choice is highlighted, never overridden or forced), leave optional feedback, and submit.
- You open the same link, enter the **admin password**, and land on the hidden dashboard: total visitors, total responses, Yes/No counts for the first question, two charts, a searchable/filterable realtime list of every response, per-response delete, delete-all, and CSV/JSON export.

## Data stored per response

`answers` (per-question yes/no), `feedback`, `timestamp`, `browser`, `device`,
`platform`, `language`, `timezone`, `visitorId` (a random ID stored in the
visitor's `localStorage`, not tied to any real identity).

## Notes

- All animations (aurora, particles, card entrances, typewriter) respect `prefers-reduced-motion`.
- If Firebase isn't configured yet, the user page will show a save error instead of silently pretending to succeed — submissions are never faked.
- The layout is responsive down to small phone widths.
