// lib/location.js
// Determine which data center market (if any) a coordinate falls within,
// and provide state-level lookups.

import { haversineMiles } from './distance.js';

// Returns the market object from dc_markets.json that contains the given
// coordinate, or null if the coordinate is not within any defined market radius.
export function findMarket(lat, lng, markets) {
  for (const market of markets) {
    const dist = haversineMiles(lat, lng, market.center_lat, market.center_lng);
    if (dist <= market.radius_miles) {
      return { ...market, distanceFromCenterMiles: dist };
    }
  }
  return null;
}

// Returns the nearest market regardless of radius, useful for non-market sites
// to provide comparative context.
export function nearestMarket(lat, lng, markets) {
  let best = null;
  let bestDist = Infinity;
  for (const market of markets) {
    const dist = haversineMiles(lat, lng, market.center_lat, market.center_lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = { ...market, distanceFromCenterMiles: dist };
    }
  }
  return best;
}