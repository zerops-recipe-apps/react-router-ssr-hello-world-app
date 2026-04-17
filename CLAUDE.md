# react-router-ssr-hello-world-app

React Router v7 SSR app with PostgreSQL on Zerops nodejs@22, served by `react-router-serve`.

## Zerops service facts

- HTTP port: `3000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `nodejs@22`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `npm run dev`
- In-container rebuild without deploy: `npm run build`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- Build uses `os: ubuntu` for the glibc Rollup binary; runtime stays on default Alpine (pure-JS runtime deps).
- React Router v7 server bundle is NOT self-contained — `node_modules` is deployed alongside `build/` so `pg` and `react-router-serve` resolve at runtime.
- Dev envVariables set `PORT: "3000"` so `npm run dev` binds to the Zerops-expected port.
