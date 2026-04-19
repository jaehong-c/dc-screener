// app/api/screen/route.js
// POST /api/screen
// Body: { address: string }
// Returns: geocode result, market detection, 11-axis scores, AI-generated memo

import Anthropic from '@anthropic-ai/sdk';
import { geocodeAddress } from '@/lib/geocode';
import { findMarket, nearestMarket } from '@/lib/location';
import { scoreSite } from '@/lib/scoring';
import { data } from '@/lib/dataLoader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address || typeof address !== 'string' || address.trim().length < 3) {
      return Response.json(
        { error: 'Please provide a valid US address.' },
        { status: 400 }
      );
    }

    // 1. Geocode
    let geo;
    try {
      geo = await geocodeAddress(address);
    } catch (e) {
      return Response.json(
        { error: `Could not geocode address: ${e.message}` },
        { status: 400 }
      );
    }

    if (!geo.state) {
      return Response.json(
        { error: 'Could not determine US state for this address. Is it a US location?' },
        { status: 400 }
      );
    }

    // 2. Market detection
    const marketIn = findMarket(geo.lat, geo.lng, data.markets);
    const marketNearest = marketIn || nearestMarket(geo.lat, geo.lng, data.markets);

    // 3. Score the 11 axes
    const scoring = scoreSite({
      lat: geo.lat,
      lng: geo.lng,
      state: geo.state,
      market: marketIn,
      data,
    });

    // 4. Generate AI memo
    let memo = null;
    let memoError = null;
    try {
      memo = await generateMemo({
        geo,
        marketIn,
        marketNearest,
        scoring,
      });
    } catch (e) {
      memoError = e.message;
      console.error('Memo generation failed:', e);
    }

    // 5. Return everything
    return Response.json({
      input: { address },
      geocode: geo,
      marketContext: {
        inMarket: !!marketIn,
        market: marketIn,
        nearestMarket: marketNearest,
      },
      scoring,
      memo,
      memoError,
    });
  } catch (error) {
    console.error('Screen API error:', error);
    return Response.json(
      { error: `Internal error: ${error.message}` },
      { status: 500 }
    );
  }
}

// ============================================================
// Claude memo generation
// ============================================================
async function generateMemo({ geo, marketIn, marketNearest, scoring }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured.');
  }

  const client = new Anthropic({ apiKey });

  const prompt = buildMemoPrompt({ geo, marketIn, marketNearest, scoring });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1400,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract text from response
  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : null;
}

function buildMemoPrompt({ geo, marketIn, marketNearest, scoring }) {
  const axes = scoring.axes;
  const marketLine = marketIn
    ? `Site is within ${marketIn.name} (${marketIn.tier} market, rank #${marketIn.rank}).`
    : `Site is NOT within a recognized US DC market. Nearest market is ${marketNearest.name} (~${Math.round(marketNearest.distanceFromCenterMiles)} mi away).`;

  return `You are a senior data center site acquisitions analyst preparing a screening memo for a hyperscaler or colocation operator. Write a concise, direct investment memo for the site below.

==== SITE ====
Address: ${geo.displayName}
State: ${geo.state}
Coordinates: ${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)}
${marketLine}

==== SCORES (0-100, higher is better) ====
Overall: ${scoring.overall} — Recommendation: ${scoring.recommendation}
Use profile: ${scoring.useProfile}

Power Proximity: ${axes.power.score} — ${axes.power.rationale}
Fiber Connectivity: ${axes.fiber.score} — ${axes.fiber.rationale}
Climate & Natural Risk: ${axes.climate.score} — ${axes.climate.rationale}
Market Context: ${axes.marketContext.score} — ${axes.marketContext.rationale}
Tax & Incentives: ${axes.tax.score} — ${axes.tax.rationale}
Power Cost: ${axes.powerCost.score} — ${axes.powerCost.rationale}
Sustainability / Grid Carbon: ${axes.sustainability.score} — ${axes.sustainability.rationale}
Land Economics: ${axes.land.score} — ${axes.land.rationale}
Labor & Operations: ${axes.labor.score} — ${axes.labor.rationale}
Regulatory Risk: ${axes.regulatory.score} — ${axes.regulatory.rationale}
Hyperscaler Presence: ${axes.hyperscaler.score} — ${axes.hyperscaler.rationale}

==== FORMAT ====
Produce a memo with these four sections, using the exact headers shown. Use plain prose (no bullet points inside sections; short paragraphs only). Total length: 300-450 words.

**Thesis**
One to two sentences. State the overall recommendation (${scoring.recommendation}) and what the site is best suited for (${scoring.useProfile}). Lead with the single most decisive factor.

**Strengths**
Identify the 2-3 axes where this site scores highest and explain, in a single paragraph, why these matter to a data center deployment decision. Be specific about what kind of tenant or use case benefits most.

**Risks & Mitigants**
Identify the 2-3 axes where this site scores lowest. For each, briefly note what the diligence team should investigate further, and whether the weakness is potentially mitigable (e.g., behind-the-meter generation, water-free cooling designs, tax abatement negotiation) or structural.

**Next Steps**
Propose 3 concrete actions a site acquisitions team would take next. Examples: utility interconnection inquiry (name the utility from the scoring details if known), entitlement conversation with local planning, climate and flood due diligence, ESG reporting alignment. Be specific and operational, not generic.

Write in the voice of an experienced institutional investor. No hedging fluff. No "further research required" filler unless you specify what research.`;
}