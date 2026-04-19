// app/components/SiteMap.js
'use client';

import dynamic from 'next/dynamic';

// Leaflet needs window, so load client-side only.
const SiteMapInner = dynamic(() => import('./SiteMapInner'), {
  ssr: false,
  loading: () => (
    <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-lg overflow-hidden">
      <div className="px-8 py-3 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)]">
          Site Map · Loading…
        </div>
      </div>
      <div className="h-[420px] bg-[var(--bg)]" />
    </div>
  ),
});

export default function SiteMap({ result }) {
  return <SiteMapInner result={result} />;
}