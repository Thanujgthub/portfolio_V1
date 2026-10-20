# Thanuj — AI Engineer

Dependency-free static portfolio with a layered scenic hero, interactive project details, a skills constellation, milestones, and contact links.

Run `npm run dev`, then open http://127.0.0.1:5173.

Edit `dist/content.js` to replace the selected GitHub projects, skills, or milestones. Personal introduction and education copy are in `dist/index.html`. See `SOURCES.md` for verification and asset provenance.

`npm run check` checks JavaScript syntax. The deployment directory is `dist`.

Live portfolio: https://thanuj-ai-portfolio.vercel.app

Source repository: https://github.com/Thanujgthub/portfolio_V1

Deploy changes to Vercel from this directory with `npx vercel deploy --prod`. `vercel.json` serves `dist` without an installation or build step. The local project binding is ignored by Git.

Desktop and mobile browser checks cover responsive layouts, project dialog keyboard behavior, mobile navigation, skills filtering/selection, email copying, internal anchors, image loading, and reduced motion.
