// What the page shows for a shipment. Kept apart from parcel.js on purpose: it reads
// fields of the courier's response far from the fetch that returned them.
import { getShipment } from './parcel.js';
import { forecast } from './weather.js';

const STATUS = { pending: 'Label created', in_transit: 'On the way', delivered: 'Delivered' };

export function describe(shipment) {
  return {
    trackingId: shipment.trackingId,
    status: STATUS[shipment.status] ?? shipment.status,
    arriving: `Arriving ${shipment.eta}`,
    to: `${shipment.recipient}, ${shipment.destination.city}`,
    events: shipment.events,
  };
}

export async function track(trackingId) {
  const shipment = await getShipment(trackingId);
  const { lat, lon } = shipment.destination;
  return { ...describe(shipment), weather: await forecast(lat, lon) };
}
