// lib/distance.js
// Haversine formula to compute great-circle distance between two lat/lng points.

const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

// Find the N nearest points from a list to a target coordinate.
// Each point must have .lat and .lng fields.
export function nearestN(targetLat, targetLng, points, n = 1) {
  const withDist = points.map((p) => ({
    ...p,
    distanceMiles: haversineMiles(targetLat, targetLng, p.lat, p.lng),
  }));
  withDist.sort((a, b) => a.distanceMiles - b.distanceMiles);
  return withDist.slice(0, n);
}