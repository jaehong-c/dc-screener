'use client';

const TOOLS = [
  { key: 'screener', label: 'Site Screener', href: 'https://dc-screener.vercel.app' },
  { key: 'lease', label: 'Lease', href: 'https://dc-lease.vercel.app' },
  { key: 'risk', label: 'Risk Register', href: 'https://dc-risk.vercel.app' },
];

export default function ToolSwitcher({ current }) {
  const border = 'var(--border, #c4c8d0)';
  const text = 'var(--text, #111827)';
  const dim = 'var(--text-dim, #6b7280)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: dim,
          fontFamily: 'var(--font-mono, monospace)',
        }}
      >
        DC tools
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: `1px solid ${border}`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {TOOLS.map((t, i) => {
          const isCurrent = t.key === current;
          const style = {
            padding: '0 10px',
            height: 26,
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 11.5,
            fontWeight: isCurrent ? 600 : 500,
            color: isCurrent ? 'var(--bg, #fff)' : dim,
            background: isCurrent ? text : 'transparent',
            borderLeft: i === 0 ? 'none' : `1px solid ${border}`,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          };
          return isCurrent ? (
            <span key={t.key} style={style}>{t.label}</span>
          ) : (
            <a key={t.key} href={t.href} target="_blank" rel="noreferrer" style={style}>
              {t.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}