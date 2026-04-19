// app/page.js
'use client';

import { useState } from 'react';
import AddressInput from './components/AddressInput';
import ScoreCard from './components/ScoreCard';
import SiteMap from './components/SiteMap';
import AxisBars from './components/AxisBars';
import MemoPanel from './components/MemoPanel';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScreen = async (address) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Screening failed.');
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] animate-pulse-dim" />
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-[var(--text-dim)]">
              DC · Site · Intelligence
            </div>
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)] hidden sm:block">
            Columbia MSRED / AI × Real Estate
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pt-20 pb-24">
        <section className="animate-fadeup">
          <div className="max-w-4xl">
            <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-[var(--accent)] mb-6">
              Eleven-Axis Screening · Claude-Generated Memo
            </div>
            <h1
              className="font-serif tracking-tight text-[var(--text)]"
              style={{
                fontSize: 'clamp(3rem, 7vw, 5.5rem)',
                lineHeight: 1.05,
                fontWeight: 500,
                fontVariationSettings: '"opsz" 144, "SOFT" 50',
              }}
            >
              Underwrite any<br />
              <span className="italic text-[var(--text-dim)]">US data center site.</span>
            </h1>
            <p className="mt-8 text-lg text-[var(--text-dim)] max-w-2xl leading-relaxed">
              Enter any US address. The engine geolocates, identifies the nearest market, scores eleven siting axes from power proximity to regulatory risk, and writes an institutional investment memo.
            </p>
          </div>
        </section>

        <section className="mt-14 animate-fadeup" style={{ animationDelay: '0.15s' }}>
          <AddressInput onSubmit={handleScreen} loading={loading} />
        </section>

        {loading && (
          <section className="mt-24 text-center animate-fadeup">
            <div className="inline-flex items-center gap-3 font-mono text-xs tracking-widest uppercase text-[var(--text-dim)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-dim" />
              Geocoding → Scoring 11 axes → Drafting memo
            </div>
            <div className="mt-4 text-sm text-[var(--text-faint)]">
              Claude is writing a 400-word institutional memo. 20-40 seconds.
            </div>
          </section>
        )}

        {error && !loading && (
          <section className="mt-14 max-w-2xl animate-fadeup">
            <div className="border border-[var(--bad)] bg-[var(--bad)]/5 rounded-lg p-5">
              <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--bad)] mb-2">
                Screening failed
              </div>
              <div className="text-sm text-[var(--text)]">{error}</div>
              <div className="mt-3 text-xs text-[var(--text-faint)]">
                Try a simpler form like &ldquo;Ashburn, VA&rdquo; or &ldquo;Chandler, AZ&rdquo;.
              </div>
            </div>
          </section>
        )}

        {result && !loading && (
          <section className="mt-20 space-y-8">
            <div className="animate-fadeup">
              <ScoreCard result={result} />
            </div>
            <div className="animate-fadeup" style={{ animationDelay: '0.08s' }}>
              <SiteMap result={result} />
            </div>
            <div className="animate-fadeup" style={{ animationDelay: '0.16s' }}>
              <AxisBars axes={result.scoring.axes} weights={result.scoring.weights} />
            </div>
            <div className="animate-fadeup" style={{ animationDelay: '0.24s' }}>
              <MemoPanel memo={result.memo} memoError={result.memoError} />
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-8 py-8 flex items-center justify-between flex-wrap gap-4">
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)]">
            Data is illustrative · Not a substitute for utility interconnection studies
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)]">
            Built with Claude · Deployed on Vercel
          </div>
        </div>
      </footer>
    </>
  );
}