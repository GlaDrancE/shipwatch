// Runs against the real ParcelPost deployment (PARCELPOST_URL). sma runs this suite
// itself after the agent patches the code, so it is what proves a fix.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listShipments, getShipment, createShipment } from '../src/parcel.js';
import { describe } from '../src/view.js';

test('listShipments honours the page size', async () => {
  const list = await listShipments(2);
  assert.equal(list.length, 2);
  assert.equal(list[0].trackingId, 'PP1001');
});

test('describe shows when a shipment arrives', async () => {
  const view = describe(await getShipment('PP1001'));
  assert.equal(view.arriving, 'Arriving 2026-10-24');
  assert.equal(view.status, 'On the way');
  assert.equal(view.to, 'Ada Lovelace, Seattle, WA');
});

test('createShipment books a parcel', async () => {
  const s = await createShipment('Alan Turing', 'Boston, MA');
  assert.match(s.trackingId, /^PP\d+$/);
  assert.equal(describe(s).arriving, 'Arriving 2026-11-01');
});
