// app/components/SiteMapInner.js
'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Compute map bounds to comfortably fit site + all shown POIs
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length === 0) return;
    const bounds = points.map((p) => [p.lat, p.lng]);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  }, [map, points]);
  return null;
}

export default function SiteMapInner({ result }) {
  const { geocode, scoring, marketContext } = result;
  const site = { lat: geocode.lat, lng: geocode.lng };

  const substations = (scoring.axes.power.details.nearestThree || []).slice(0, 3);
  const fiberHubs = (scoring.axes.fiber.details.nearestThree || []).slice(0, 3);

  const marketForRing = marketContext.inMarket ? marketContext.market : marketContext.nearestMarket;

  const pointsForBounds = [
    site,
    ...substations.map((s) => ({ lat: s.lat, lng: s.lng })),
    ...fiberHubs.map((f) => ({ lat: f.lat, lng: f.lng })),
  ];

  return (
    <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-lg overflow-hidden">
      <div className="px-8 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between flex-wrap gap-2">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)]">
          Site Map · Power + Fiber Proximity
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tracking-widest uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
            <span className="text-[var(--text-dim)]">Site</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
            <span className="text-[var(--text-dim)]">Substation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
            <span className="text-[var(--text-dim)]">Fiber Hub</span>
          </div>
          {marketForRing && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-[var(--accent)]" />
              <span className="text-[var(--text-dim)]">Market Boundary</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[480px] w-full">
        <MapContainer
          center={[site.lat, site.lng]}
          zoom={10}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', background: '#f5f5f0' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <FitBounds points={pointsForBounds} />

          {/* Market boundary ring (if applicable) */}
          {marketForRing && (
            <Circle
              center={[marketForRing.center_lat, marketForRing.center_lng]}
              radius={marketForRing.radius_miles * 1609.34}
              pathOptions={{
                color: '#a87a00',
                weight: 1.5,
                fillColor: '#a87a00',
                fillOpacity: 0.04,
                dashArray: '6 6',
              }}
            />
          )}

          {/* Substations */}
          {substations.map((s) => (
            <CircleMarker
              key={`sub-${s.id}`}
              center={[s.lat, s.lng]}
              radius={8}
              pathOptions={{
                color: 'white',
                weight: 2,
                fillColor: '#ea580c',
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500 mb-1">Substation</div>
                <div className="font-semibold text-sm text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-600 mt-1">
                  {s.voltage_kv} kV · {s.utility}<br />
                  Est. available: {s.est_available_mw} MW<br />
                  Status: <span className={s.status === 'constrained' ? 'text-red-600' : s.status === 'limited' ? 'text-amber-600' : 'text-emerald-600'}>{s.status}</span><br />
                  Distance: {s.distanceMiles.toFixed(1)} mi
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Fiber hubs */}
          {fiberHubs.map((f) => (
            <CircleMarker
              key={`fiber-${f.city}`}
              center={[f.lat, f.lng]}
              radius={8}
              pathOptions={{
                color: 'white',
                weight: 2,
                fillColor: '#2563eb',
                fillOpacity: 0.9,
              }}
            >
              <Popup>
                <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500 mb-1">Fiber Hub · Tier {f.tier}</div>
                <div className="font-semibold text-sm text-slate-900">{f.city}, {f.state}</div>
                <div className="text-xs text-slate-600 mt-1 max-w-[220px]">
                  {f.description}<br />
                  Distance: {f.distanceMiles.toFixed(1)} mi
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Site marker — render last so it stays on top */}
          <CircleMarker
            center={[site.lat, site.lng]}
            radius={11}
            pathOptions={{
              color: 'white',
              weight: 3,
              fillColor: '#a87a00',
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="font-mono text-[10px] tracking-widest uppercase text-slate-500 mb-1">Target Site</div>
              <div className="font-semibold text-sm text-slate-900">{geocode.displayName}</div>
              <div className="text-xs text-slate-600 mt-1">
                Overall score: <span className="font-semibold">{scoring.overall}/100</span><br />
                {scoring.recommendation}
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>
      </div>

      <div className="px-8 py-4 border-t border-[var(--border)] bg-[var(--bg)] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)] mb-1">Nearest substation</div>
          <div className="text-[var(--text)]">
            {substations[0]?.name} · <span className="text-[var(--text-dim)]">{substations[0]?.distanceMiles.toFixed(1)} mi</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)] mb-1">Nearest fiber hub</div>
          <div className="text-[var(--text)]">
            {fiberHubs[0]?.city}, {fiberHubs[0]?.state} · <span className="text-[var(--text-dim)]">{fiberHubs[0]?.distanceMiles.toFixed(1)} mi</span>
          </div>
        </div>
        <div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)] mb-1">Market</div>
          <div className="text-[var(--text)]">
            {marketContext.inMarket ? marketContext.market.name : `near ${marketContext.nearestMarket.name}`}
          </div>
        </div>
      </div>
    </div>
  );
}