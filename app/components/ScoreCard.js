// app/components/ScoreCard.js

const REC_STYLE = {
    'STRONG GO': { bg: 'bg-[var(--good)]/8', border: 'border-[var(--good)]', text: 'text-[var(--good)]' },
    'GO WITH CONSIDERATIONS': { bg: 'bg-[var(--good)]/8', border: 'border-[var(--good)]', text: 'text-[var(--good)]' },
    'CAUTION / FURTHER DILIGENCE': { bg: 'bg-[var(--warn)]/8', border: 'border-[var(--warn)]', text: 'text-[var(--warn)]' },
    'NO-GO / LOW SUITABILITY': { bg: 'bg-[var(--bad)]/8', border: 'border-[var(--bad)]', text: 'text-[var(--bad)]' },
  };
  
  function scoreColor(score) {
    if (score >= 70) return 'text-[var(--good)]';
    if (score >= 50) return 'text-[var(--warn)]';
    return 'text-[var(--bad)]';
  }
  
  export default function ScoreCard({ result }) {
    const { scoring, geocode, marketContext } = result;
    const rec = REC_STYLE[scoring.recommendation] || REC_STYLE['CAUTION / FURTHER DILIGENCE'];
  
    return (
      <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-lg overflow-hidden">
        <div className="px-8 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)]">
            Overall Site Suitability · Weighted Composite
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)]">
            {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
  
        <div className="px-8 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="flex items-baseline gap-3">
              <div
                className={`font-serif text-[140px] leading-none tracking-tight ${scoreColor(scoring.overall)}`}
                style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50', fontWeight: 500 }}
              >
                {scoring.overall}
              </div>
              <div className="font-mono text-xl text-[var(--text-faint)]">/100</div>
            </div>
          </div>
  
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)] mb-2">
                Recommendation
              </div>
              <div className={`inline-block px-3 py-1.5 border ${rec.border} ${rec.bg} ${rec.text} font-mono text-xs tracking-[0.15em] uppercase font-bold`}>
                {scoring.recommendation}
              </div>
            </div>
  
            <div>
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)] mb-2">
                Use Profile
              </div>
              <div className="font-serif text-2xl italic text-[var(--text)]">{scoring.useProfile}</div>
            </div>
          </div>
        </div>
  
        <div className="px-8 py-5 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)] mb-1.5">
              Location
            </div>
            <div className="text-sm text-[var(--text)] leading-relaxed">
              {geocode.displayName}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)] mb-1.5">
              Market Context
            </div>
            <div className="text-sm text-[var(--text)] leading-relaxed">
              {marketContext.inMarket ? (
                <>
                  Within <span className="text-[var(--accent)] font-semibold">{marketContext.market.name}</span>
                  <span className="text-[var(--text-dim)]"> · {marketContext.market.tier} tier · rank #{marketContext.market.rank}</span>
                </>
              ) : (
                <>
                  <span className="text-[var(--text-dim)]">Outside primary markets · nearest:</span>{' '}
                  <span className="text-[var(--accent)] font-semibold">{marketContext.nearestMarket.name}</span>
                  <span className="text-[var(--text-dim)]"> · ~{Math.round(marketContext.nearestMarket.distanceFromCenterMiles)} mi</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }