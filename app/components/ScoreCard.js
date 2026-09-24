// app/components/ScoreCard.js

const AXIS_LABELS = {
    power: 'Power Proximity',
    fiber: 'Fiber Connectivity',
    climate: 'Climate & Natural Risk',
    marketContext: 'Market Context',
    tax: 'Tax & Incentives',
    powerCost: 'Power Cost',
    sustainability: 'Grid Carbon · ESG',
    land: 'Land Economics',
    labor: 'Labor & Operations',
    regulatory: 'Regulatory Risk',
    hyperscaler: 'Hyperscaler Presence',
  };

  const DRIVER_KEYS = ['power', 'marketContext', 'fiber', 'regulatory'];

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

  function findKeyRisk(axes) {
    if (!axes) return null;
    let lowest = null;
    for (const [key, axis] of Object.entries(axes)) {
      if (!axis || typeof axis.score !== 'number') continue;
      if (!lowest || axis.score < lowest.score) {
        lowest = { key, score: axis.score, name: AXIS_LABELS[key] || key };
      }
    }
    if (!lowest || lowest.score >= 50) return null;
    return lowest;
  }
  
  export default function ScoreCard({ result }) {
    const { scoring, geocode, marketContext } = result;
    const rec = REC_STYLE[scoring.recommendation] || REC_STYLE['CAUTION / FURTHER DILIGENCE'];
    const axes = scoring.axes;
    const weights = scoring.weights;
    const keyRisk = findKeyRisk(axes);
  
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

        <div className="px-8 py-5 border-t border-[var(--border)] flex flex-col md:flex-row md:items-end gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 min-w-0">
            {DRIVER_KEYS.map((key) => {
              const axis = axes?.[key];
              if (!axis) return null;
              const weightPct = Math.round((weights?.[key] ?? 0) * 100);
              const flagged = keyRisk?.key === key;
              return (
                <div key={key} className={flagged ? 'underline decoration-[var(--tier-3)] underline-offset-4' : undefined}>
                  <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)] mb-1.5">
                    {AXIS_LABELS[key]} · {weightPct}%
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`font-serif text-3xl leading-none ${scoreColor(axis.score)}`}
                      style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50', fontWeight: 500 }}
                    >
                      {axis.score}
                    </span>
                    <span className="font-mono text-xs text-[var(--ink-3)]">/100</span>
                  </div>
                </div>
              );
            })}
          </div>
          {keyRisk && (
            <div className="flex items-center gap-1.5 text-[12px] leading-snug text-[var(--tier-3)] md:shrink-0 md:max-w-[14rem] md:text-right">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="h-3.5 w-3.5 shrink-0 fill-current"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                Key risk: {keyRisk.name} {keyRisk.score}/100
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }