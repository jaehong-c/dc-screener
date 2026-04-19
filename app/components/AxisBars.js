// app/components/AxisBars.js

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
  
  const GROUPS = [
    { label: 'Infrastructure', keys: ['power', 'fiber', 'climate'] },
    { label: 'Economics', keys: ['powerCost', 'tax', 'land'] },
    { label: 'Market Depth', keys: ['marketContext', 'hyperscaler'] },
    { label: 'Operational', keys: ['labor', 'sustainability'] },
    { label: 'Risk', keys: ['regulatory'] },
  ];
  
  function barColor(score) {
    if (score >= 70) return 'bg-[var(--good)]';
    if (score >= 50) return 'bg-[var(--warn)]';
    return 'bg-[var(--bad)]';
  }
  
  function scoreColor(score) {
    if (score >= 70) return 'text-[var(--good)]';
    if (score >= 50) return 'text-[var(--warn)]';
    return 'text-[var(--bad)]';
  }
  
  export default function AxisBars({ axes, weights }) {
    return (
      <div className="border border-[var(--border)] bg-[var(--bg-card)] rounded-lg overflow-hidden">
        <div className="px-8 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--text-faint)]">
            Eleven-Axis Diagnostic
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)]">
            Σ weights = 100%
          </div>
        </div>
  
        <div className="p-8 space-y-10">
          {GROUPS.map((group, groupIdx) => (
            <div key={group.label}>
              <div className="font-serif italic text-xl text-[var(--accent)] mb-5">
                {group.label}
              </div>
              <div className="space-y-5">
                {group.keys.map((key, idx) => {
                  const axis = axes[key];
                  if (!axis) return null;
                  const weight = weights[key];
                  return (
                    <div key={key} className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-12 md:col-span-3">
                        <div className="text-sm text-[var(--text)] font-medium">{AXIS_LABELS[key]}</div>
                        <div className="font-mono text-[10px] text-[var(--text-faint)] tracking-wider uppercase mt-0.5">
                          wt {(weight * 100).toFixed(0)}%
                        </div>
                      </div>
  
                      <div className="col-span-12 md:col-span-7">
                        <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor(axis.score)} animate-bar`}
                            style={{ width: `${axis.score}%`, animationDelay: `${(groupIdx * 0.1) + (idx * 0.05)}s` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-[var(--text-dim)] leading-relaxed">
                          {axis.rationale}
                        </div>
                      </div>
  
                      <div
                        className={`col-span-12 md:col-span-2 text-right font-serif text-3xl ${scoreColor(axis.score)}`}
                        style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50', fontWeight: 500 }}
                      >
                        {axis.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }