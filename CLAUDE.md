@AGENTS.md

# Project notes

- Code, comments and the README are in English; the site owner reviews each
  build step, so keep changes small and explain the "why" in comments where it
  is not obvious.
- Run `npm run check` and `npm run build` before committing.
- Never invent reviews, ratings or facts about real businesses. Placeholder
  content must be clearly marked as such.
- Deploying: Cloudflare builds and publishes `main`. The owner wants every
  finished change live, so after `npm run check` and `npm run build` pass,
  push the work branch and fast-forward `main` to it.
