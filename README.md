# ShipWatch

A parcel tracker that keeps itself working when the APIs under it change.

It depends on two third-party APIs:

| API | What for | Who owns it |
|---|---|---|
| [ParcelPost](https://github.com/GlaDrancE/parcelpost-api) | shipments, ETAs, booking | "the courier" (really us, so we can break it on demand) |
| [api.weather.gov](https://www.weather.gov/documentation/services-web-api) | weather at the destination | the US National Weather Service, a real public API |

Both are watched by [self-maintaining-api](https://www.npmjs.com/package/self-maintaining-api) (`sma`),
installed from npm as a dev dependency. Every hour a GitHub Action fetches both
OpenAPI specs and diffs them against the baseline committed in `.sma/specs/`. If a
change breaks code this repo actually calls, a Claude Code agent patches it, sma runs
`npm test` against the live API itself, and a PR is opened. Nothing merges on its own.

## Run locally

```bash
npm install
# in ../parcelpost-api:  node server.mjs        (v1 on :8790)
npm start                                       # http://localhost:3000
npm test                                        # hits the courier API at PARCELPOST_URL
npx sma run                                     # check both specs; exit 1 = something broke us
```

## Layout

```
server.mjs          page + /api/track/:id, /api/shipments
src/parcel.js       every call to ParcelPost
src/weather.js      every call to api.weather.gov
src/view.js         what the page shows: reads courier fields far from the fetch
test/api.test.mjs   runs against the live courier; this is what proves a fix
watch.yaml          the APIs sma watches
.sma/specs/         the baseline. Committed on purpose: lose it and sma detects nothing
```

## Deploy (Render)

New → Web Service → this repo. Build `npm install`, start `node server.mjs`, Free.
Environment: `PARCELPOST_URL=https://<your-parcelpost>.onrender.com`. Auto-deploy on
push to `main` stays on, so merging an sma PR ships the fix.

GitHub repo settings:
- Secret `ANTHROPIC_API_KEY`: the repair agent.
- Variable `PARCELPOST_URL`: the same URL, so CI tests hit the live courier.
- Actions → General → "Allow GitHub Actions to create and approve pull requests".

See [DEMO.md](DEMO.md) for the live walkthrough.
