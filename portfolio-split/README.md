# Dasari Hemavathi — Portfolio Website

A professional, dark-themed portfolio website built with plain HTML, CSS, and JavaScript — split into separate files (no build tools, no frameworks, no dependencies except Google Fonts).

## File structure
```
portfolio-split/
├── index.html       → page structure and content
├── style.css        → all styling (colors, layout, typography)
├── script.js        → scroll-based nav highlighting + section fade-in
└── assets/
    └── photo.jpg     → profile photo
```

## Sections
1. **Hero** — name, role, circular photo, availability badge, quick links (Email / LinkedIn / GitHub)
2. **About** — short profile summary
3. **Experience & Education** — Dhee Coding Labs traineeship + B.Tech (CGPA 8.68)
4. **Skills** — grouped by Languages & Backend, Frontend, Tools & Testing (includes Version Control)
5. **Projects** — PavanX Pro (DSA Rookie Module), SkyCast Weather App, Personal Finance Tracker
6. **Coding Profiles** — LeetCode, HackerRank, CodeChef
7. **Contact** — Email, Phone, LinkedIn, GitHub

## Design
- Dark charcoal-navy background with soft gold and steel-blue accent glows
- Playfair Display (headings) + Cormorant Garamond italic (intro line) + Inter (body/UI)
- Rounded cards with layered shadows for a premium, professional feel
- Fully responsive — works on mobile, tablet, and desktop
- Small JS layer: highlights the active section in the nav bar as you scroll, and fades each section in on scroll

## How to use
1. **Preview locally** — double-click `index.html`, it opens directly in your browser (CSS and JS load automatically since they're in the same folder).
2. **Host it for free**:
   - **GitHub Pages**: create a repo, upload the whole folder, enable Pages in repo Settings → Pages.
   - **Vercel** or **Netlify**: drag-and-drop this folder into their dashboard for an instant live URL.
3. **Edit content**: open `index.html` for text/structure changes, `style.css` for colors/spacing/fonts, `script.js` for behavior.

## Notes
- SkyCast and Personal Finance Tracker don't have live/GitHub links yet — once you have them, update the `Details ↗` links in the Projects section of `index.html`.
- To swap your photo, just replace `assets/photo.jpg` with a new image of the same name.

## Want a React version instead?
This is currently plain HTML/CSS/JS, which needs no build step — you can open it directly or host it as-is. If you'd rather have it as a React app (components, JSX, npm build), let Claude know and a React version can be built using the same design.
