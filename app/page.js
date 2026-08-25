'use client';

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
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
      <Header />

      <main className="mx-auto max-w-7xl px-6 pt-10 pb-8">
        <section className="animate-fadeup card">
          <div className="max-w-3xl">
            <p className="eyebrow mb-3">Eleven-axis screening · AI-written memo</p>
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-[var(--ink)]">
              Underwrite any US data center site.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
              Enter any US address. The engine geocodes it, finds the nearest data center market,
              scores eleven siting axes from substation proximity to regulatory risk, and writes an
              institutional investment memo.
            </p>
          </div>
          <div className="mt-6">
            <AddressInput onSubmit={handleScreen} loading={loading} />
          </div>
        </section>

        {loading && (
          <section className="mt-6 card animate-fadeup">
            <div className="flex items-center gap-3">
              <span className="spinner" />
              <div>
                <p className="text-[13.5px] text-[var(--ink)]">
                  Geocoding, scoring 11 axes, drafting the memo
                </p>
                <p className="text-[12px] text-[var(--ink-3)]">Usually 20 to 40 seconds</p>
              </div>
            </div>
          </section>
        )}

        {error && !loading && (
          <section className="mt-6 card animate-fadeup" style={{ boxShadow: '0 0 0 1px var(--tier-3)' }}>
            <p className="eyebrow mb-1" style={{ color: 'var(--tier-3)' }}>Screening failed</p>
            <p className="text-[13.5px] text-[var(--ink)]">{error}</p>
            <p className="mt-2 text-[12px] text-[var(--ink-3)]">
              Try a simpler form like &ldquo;Ashburn, VA&rdquo; or &ldquo;Chandler, AZ&rdquo;.
            </p>
          </section>
        )}

        {result && !loading && (
          <section className="mt-6 space-y-6">
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

      <Footer />
    </>
  );
}