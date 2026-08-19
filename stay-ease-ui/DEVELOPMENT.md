# Development / Run instructions (UI)

This file explains how to run the StayEase UI locally and contains seeded test accounts.

## Quick start

1. Clone the repository (if you haven't already):

   git clone <repo-url>

2. Checkout the UI branch:

   git checkout stayease_UI

3. Change into the UI folder:

   cd stay-ease-ui

4. Install dependencies:

   npm install

   (or `npm ci` for a clean, reproducible install)

5. Start the dev server:

   npm run dev

6. Open the app in your browser (Vite default):

   http://localhost:5173


## Build & preview (production)

- Build the production bundle:

  npm run build

- Preview the production build locally:

  npm run preview


## Seeded test users

Use any password (the demo ignores the password field). The seeded accounts and roles are:

- admin@stayease.com — role: ADMIN
- mgr1@stayease.com — role: MANAGER
- guest1@stayease.com — role: GUEST


## Notes & troubleshooting

- Node: Use Node.js 16+ (Node 18+ recommended) and a recent npm.
- If SVG imports fail in your environment, move `src/assets/hotel-default.svg` to the `public/` folder and reference it by `/hotel-default.svg`.
- If you need the branch pushed to origin: push from your machine so your credential helper or SSH key is used:

  git push -u origin stayease_UI

  If amending history locally and the original commit was already pushed, use:

  git push -u --force-with-lease origin stayease_UI


## Contact

If anything is unclear or you want a short demo GIF, ping the author in Slack.
