# Demo: the courier ships a breaking release

About 5 minutes. Everything is deployed; no terminal needed on the day.

## What you are proving

> A third-party API changed without telling us. The app broke in production. Without
> anyone touching the code, an agent found the exact lines, fixed them, proved the fix
> against the live API, and handed us a PR. One click on Merge and production is fixed.

## Open these tabs beforehand

1. ShipWatch: `https://<shipwatch>.onrender.com`
2. ParcelPost on Render → Environment
3. `github.com/GlaDrancE/shipwatch` → Actions → **sma**
4. `src/parcel.js` and `src/view.js` on GitHub

Load both Render URLs once a few minutes before you start; the free tier sleeps.

## 1. It works today

Show ShipWatch: PP1001 is "On the way, Arriving 2026-10-24", with live Seattle weather
from the National Weather Service. Recent shipments are listed.

Say: *"Two third-party APIs: a courier, and the US weather service. Neither is ours."*

## 2. The courier ships v2

Render → parcelpost-api → Environment → `API_VERSION` = `v2` → Save. Wait for "Live" (~1 min).

Refresh ShipWatch:
- the shipment list: **`ParcelPost 400: unknown query parameter 'limit', use 'pageSize'`**
- the tracking card: **"Arriving undefined"**

Say: *"They renamed a parameter, renamed a field, and made a new field required. Nobody emailed us. This is production, broken."*

## 3. The agent picks it up

Actions → sma → **Run workflow** (or wait for the hourly run). About 2–3 minutes.

The run goes red. That's intended: exit 1 means "an API broke us". In the log:
- `parcelpost: 8 change(s), 5 breaking`, each with its rule (`PARAM_RENAMED`, `RESPONSE_FIELD_REMOVED`, `REQUIRED_PARAM_ADDED`)
- each mapped to `file:line`, including `src/view.js` and the tests, which never call the API directly
- `weather-gov: 0 change(s)`: the real spec is watched too, and it doesn't cry wolf
- `tests PASS`: sma ran the suite itself, against the live v2 API

Download the `sma-report` artifact for the HTML report.

## 4. The PR

Pull requests → `fix(parcelpost): patch 3 breaking API change(s)`:
- `?limit=` → `?pageSize=`
- `shipment.eta` → `shipment.estimatedDelivery`
- `senderId` threaded through `createShipment`, the route and the test

Say: *"The agent can only read and edit files, it can't run anything. sma ran the tests itself; that's the evidence, not the agent's word."*

## 5. Merge

Merge → Render redeploys ShipWatch (~1 min) → refresh: the list and "Arriving 2026-10-24" are back.

## Reset afterwards

1. Render → parcelpost-api → `API_VERSION` = `v1`.
2. On `main`, revert the merge and the `chore(sma): update spec baseline` commit:
   ```bash
   git pull
   git revert --no-edit -m 1 <merge-sha>
   git revert --no-edit <baseline-sha>
   git push
   ```
   The next run against v1 must report nothing broken.

## If something goes wrong

| Symptom | Fix |
|---|---|
| Run fails with exit 2, `no response` | Render was asleep. Open the ParcelPost URL in a browser, then re-run. |
| `gh pr create failed` | The "Allow GitHub Actions to create … pull requests" setting is off. The branch is already pushed; open the PR from it by hand. |
| Run is green, nothing found | The baseline already holds v2: a run happened between steps 2 and 3. Reset and repeat. |
| PR labelled `needs-human` | Tests failed or the agent touched an unexpected file. Show it anyway: that's the safety net working. |
