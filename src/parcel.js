// ParcelPost courier API: the third party this app depends on.
export const BASE = process.env.PARCELPOST_URL || 'https://parcelpost-api.onrender.com';

async function json(res) {
  const body = await res.json();
  if (!res.ok) throw new Error(`ParcelPost ${res.status}: ${body.error ?? 'request failed'}`);
  return body;
}

export async function listShipments(limit = 5) {
  const res = await fetch(`${BASE}/shipments?pageSize=${limit}`);
  return json(res);
}

export async function getShipment(trackingId) {
  const res = await fetch(`${BASE}/shipments/${trackingId}`);
  return json(res);
}

export async function createShipment(recipient, city, senderId) {
  const res = await fetch(`${BASE}/shipments`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ recipient, city, senderId }),
  });
  return json(res);
}
