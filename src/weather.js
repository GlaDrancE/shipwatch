// US National Weather Service: a real third-party API with a published OpenAPI spec.
// NWS rejects requests without a User-Agent.
const headers = { 'user-agent': 'shipwatch-demo (github.com/GlaDrancE/shipwatch)', accept: 'application/geo+json' };

// The forecast for a destination, or null if NWS has none (outside the US, or it's down).
// Weather is a nice-to-have: it must never break tracking.
export async function forecast(lat, lon) {
  if (lat == null || lon == null) return null;
  try {
    const point = await fetch(`https://api.weather.gov/points/${lat},${lon}`, { headers });
    if (!point.ok) return null;
    const { gridId, gridX, gridY } = (await point.json()).properties;
    const res = await fetch(`https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/forecast`, { headers });
    if (!res.ok) return null;
    const [now] = (await res.json()).properties.periods;
    return { summary: now.shortForecast, temperature: `${now.temperature}°${now.temperatureUnit}` };
  } catch {
    return null;
  }
}
