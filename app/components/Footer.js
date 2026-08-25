export default function Footer() {
    return (
      <footer className="mt-16 border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-[12px] text-[var(--ink-3)]">
          <span>© 2026 Jae Chung. All rights reserved.</span>
          <span className="mono">v0.2.0 / curated static data, not live sources</span>
        </div>
      </footer>
    );
  }