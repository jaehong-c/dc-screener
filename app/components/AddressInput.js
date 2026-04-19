// app/components/AddressInput.js
'use client';

import { useState } from 'react';

const EXAMPLE_ADDRESSES = [
  'Ashburn, VA',
  'Chandler, AZ',
  'New Albany, OH',
  'Douglasville, GA',
  'Eagle Mountain, UT',
];

export default function AddressInput({ onSubmit, loading }) {
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!address.trim() || loading) return;
    onSubmit(address.trim());
  };

  const handleExample = (example) => {
    setAddress(example);
    onSubmit(example);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-0 border border-[var(--border-bright)] bg-white rounded-md overflow-hidden focus-within:border-[var(--accent)] transition">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="21001 Loudoun County Pkwy · Chandler, AZ · Eagle Mountain, UT"
          className="flex-1 px-5 py-4 bg-transparent text-[var(--text)] placeholder-[var(--text-faint)] font-mono text-sm tracking-tight focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="px-7 bg-[var(--text)] text-white font-mono text-xs tracking-[0.2em] uppercase font-bold hover:bg-[var(--accent)] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Running' : 'Screen →'}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2 items-center font-mono text-[10px] tracking-widest uppercase">
        <span className="text-[var(--text-faint)] mr-1">Try</span>
        {EXAMPLE_ADDRESSES.map((ex) => (
          <button
            key={ex}
            onClick={() => handleExample(ex)}
            disabled={loading}
            className="px-3 py-1.5 border border-[var(--border)] bg-white hover:border-[var(--accent)] hover:text-[var(--accent)] text-[var(--text-dim)] rounded-sm transition disabled:opacity-40"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}