// lib/geocode.js
// Geocoding via OpenStreetMap Nominatim (free, no API key required).
// Public use is allowed but rate-limited; we add a User-Agent per their policy.

export async function geocodeAddress(address) {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', address);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('countrycodes', 'us');
  
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'DC-Site-Screener/1.0 (Columbia MSRED Academic Project)',
      },
    });
  
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
  
    const results = await response.json();
  
    if (!results || results.length === 0) {
      throw new Error(`Address not found: ${address}`);
    }
  
    const result = results[0];
    const stateCode = extractStateCode(result);
  
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      displayName: result.display_name,
      state: stateCode,
      city: result.address?.city || result.address?.town || result.address?.village || null,
      county: result.address?.county || null,
      postcode: result.address?.postcode || null,
    };
  }
  
  // Nominatim returns full state names; convert to 2-letter codes.
  function extractStateCode(result) {
    const stateFullName = result.address?.state || '';
    const map = {
      'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
      'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
      'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
      'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
      'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
      'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
      'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
      'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
      'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
      'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
      'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
      'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
      'Wisconsin': 'WI', 'Wyoming': 'WY', 'District of Columbia': 'DC',
    };
    return map[stateFullName] || null;
  }