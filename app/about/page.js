import Header from '../components/Header';
import Footer from '../components/Footer';

const REPO = 'https://github.com/jaehong-c/dc-screener';

const SECTIONS = [
  {
    h: 'What this is',
    p: [
      'DC Site Screener takes any US address and produces a first-pass siting assessment for a data center: a composite score, eleven axis scores with weights, a map of the site against nearby substations and fiber, and an AI-written investment memo. It is the first step in a three-tool set: screen the site, compare the lease economics, then manage lifecycle risk.',
      'It was built in one day as a Columbia GSAPP MSRED assignment and is maintained as a portfolio prototype.',
    ],
  },
  {
    h: 'How scoring works',
    p: [
      'The address is geocoded with OpenStreetMap Nominatim. The engine then locates the nearest recognized data center market and scores eleven axes against curated data layers: substation proximity, power cost, climate and hazard exposure, fiber access, hyperscaler presence, labor and operations depth, land economics, regulatory risk, sustainability signals, tax incentives, and market maturity. Each axis is scored 0 to 100 by deterministic rules and combined with fixed weights into a composite.',
      'Scores are reproducible. The AI does not score anything; it reads the axis results and writes a memo in the language an investment committee expects, including what would change the view.',
    ],
  },
  {
    h: 'Data and limitations',
    p: [
      'All data layers are static JSON files curated by the author from public sources for a prototype. Substation and fiber positions are approximate, market boundaries are simplified, and power costs and incentives are state or market level rather than parcel level. Nothing here replaces a utility interconnection study, a Phase I environmental assessment, or a title review.',
      'For production use, the layers should be replaced with licensed or agency datasets (utility GIS, FEMA National Risk Index, state incentive statutes) and refreshed on a schedule.',
    ],
  },
  {
    h: 'Roadmap',
    p: [
      'Parcel-level power data where utilities publish hosting capacity maps; county-level hazard scores from the FEMA National Risk Index; a handoff into the Risk Register so a screened site can open directly as a lifecycle risk profile; and PDF export of the memo and axis chart.',
    ],
  },
  {
    h: 'Stack',
    p: [
      'Next.js (App Router, JavaScript), static JSON data layer, deterministic scoring in plain JavaScript, Leaflet map, Anthropic API for the memo behind a server route, deployed on Vercel from GitHub.',
    ],
  },
];

export default function About() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-8">
        <div className="card" style={{ maxWidth: 800, padding: '32px 36px' }}>
          <p className="eyebrow mb-2">About</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-tight text-[var(--ink)]">
            First-pass siting intelligence for data center development
          </h1>
          <p className="mt-3 text-[14px] text-[var(--ink-2)]">
            Built by Jae Chung. Code and data are public on{' '}
            <a href={REPO} target="_blank" rel="noreferrer" className="underline text-[var(--ink)]">GitHub</a>.
          </p>

          {SECTIONS.map((s) => (
            <section key={s.h} className="mt-8">
              <p className="eyebrow mb-2">{s.h}</p>
              {s.p.map((t, i) => (
                <p key={i} className="mb-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
                  {t}
                </p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}