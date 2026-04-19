// lib/scoring.js
// Deterministic scoring engine for data center site evaluation.
// Each axis returns { score, rationale, details } where score is 0-100.

import { haversineMiles, nearestN } from './distance.js';

// -------- Weights (sum to 1.00) --------
export const WEIGHTS = {
  power:         0.18,
  marketContext: 0.12,
  hyperscaler:   0.10,
  fiber:         0.10,
  tax:           0.10,
  powerCost:     0.08,
  sustainability:0.08,
  land:          0.08,
  climate:       0.06,
  labor:         0.05,
  regulatory:    0.05,
};

// Clamp helper
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

// ============================================================
// 1. Power Proximity
// ============================================================
export function scorePower(lat, lng, substations) {
  const nearest3 = nearestN(lat, lng, substations, 3);
  const closest = nearest3[0];

  // Distance score: <3mi=100, 3-10mi=80-100, 10-25mi=40-80, 25-50mi=20-40, >50mi=0-20
  let distanceScore;
  const d = closest.distanceMiles;
  if (d <= 3) distanceScore = 100;
  else if (d <= 10) distanceScore = 100 - ((d - 3) / 7) * 20;
  else if (d <= 25) distanceScore = 80 - ((d - 10) / 15) * 40;
  else if (d <= 50) distanceScore = 40 - ((d - 25) / 25) * 20;
  else distanceScore = Math.max(0, 20 - (d - 50) / 5);

  // Capacity score: sum of est_available_mw across nearest 3 substations
  const totalMW = nearest3.reduce((sum, s) => sum + (s.est_available_mw || 0), 0);
  let capacityScore;
  if (totalMW >= 500) capacityScore = 100;
  else if (totalMW >= 250) capacityScore = 80;
  else if (totalMW >= 100) capacityScore = 60;
  else if (totalMW >= 50) capacityScore = 40;
  else if (totalMW > 0) capacityScore = 20;
  else capacityScore = 5;

  // Weighted: distance 60%, capacity 40%
  const score = clamp(0.6 * distanceScore + 0.4 * capacityScore);

  let rationale;
  if (closest.status === 'constrained') {
    rationale = `Nearest substation (${closest.name}) is ${d.toFixed(1)} mi away but marked as capacity-constrained. Significant interconnection delays likely.`;
  } else {
    rationale = `Nearest high-voltage substation is ${closest.name} at ${d.toFixed(1)} mi (${closest.voltage_kv} kV, ~${closest.est_available_mw} MW estimated available). Total capacity across nearest 3 substations: ${totalMW} MW.`;
  }

  return {
    score: Math.round(score),
    rationale,
    details: {
      closestSubstation: closest,
      nearestThree: nearest3,
      totalNearbyMW: totalMW,
    },
  };
}

// ============================================================
// 2. Fiber Connectivity
// ============================================================
export function scoreFiber(lat, lng, fiberHubs) {
  const nearest = nearestN(lat, lng, fiberHubs, 3);
  const closest = nearest[0];
  const d = closest.distanceMiles;

  // Distance-based, with tier multiplier
  let base;
  if (d <= 5) base = 100;
  else if (d <= 25) base = 95 - ((d - 5) / 20) * 25;
  else if (d <= 75) base = 70 - ((d - 25) / 50) * 30;
  else if (d <= 150) base = 40 - ((d - 75) / 75) * 20;
  else base = Math.max(0, 20 - (d - 150) / 10);

  // Tier 1 hub gets full score; tier 2 gets 85% multiplier
  const tierMult = closest.tier === 1 ? 1.0 : 0.85;
  const score = clamp(base * tierMult);

  const rationale = `Nearest fiber hub: ${closest.city}, ${closest.state} (Tier ${closest.tier}) at ${d.toFixed(1)} mi. ${closest.description}`;

  return {
    score: Math.round(score),
    rationale,
    details: { closestHub: closest, nearestThree: nearest },
  };
}

// ============================================================
// 3. Climate & Natural Risk
// ============================================================
export function scoreClimate(state, climateByState) {
  const c = climateByState[state];
  if (!c) {
    return { score: 50, rationale: `Climate data unavailable for ${state}.`, details: {} };
  }

  // CDD: 0=100, 3000+=0 (linear)
  const cddScore = clamp(100 - (c.cdd_annual / 3000) * 100);

  // Risks: inverted 1-5 scale → 100-0
  const riskAvg = (c.hurricane + c.tornado + c.earthquake + c.wildfire + c.water_stress + c.flood) / 6;
  const riskScore = clamp(100 - ((riskAvg - 1) / 4) * 100);

  // Weighted: risk 60%, cdd 40%
  const score = clamp(0.6 * riskScore + 0.4 * cddScore);

  const topRisks = [
    ['hurricane', c.hurricane],
    ['tornado', c.tornado],
    ['earthquake', c.earthquake],
    ['wildfire', c.wildfire],
    ['water stress', c.water_stress],
    ['flood', c.flood],
  ].filter(([_, v]) => v >= 4).map(([name]) => name);

  const rationale = topRisks.length > 0
    ? `Annual CDD ${c.cdd_annual}. Elevated risk factors: ${topRisks.join(', ')}.`
    : `Annual CDD ${c.cdd_annual}. No high-risk natural hazards identified.`;

  return { score: Math.round(score), rationale, details: c };
}

// ============================================================
// 4. Market Context
// ============================================================
export function scoreMarketContext(market) {
  if (!market) {
    return {
      score: 25,
      rationale: 'Site is not within a recognized US data center market. Greenfield deployment required.',
      details: { inMarket: false },
    };
  }

  // Tier: primary 90, secondary 70, tertiary 50
  const tierBase = market.tier === 'primary' ? 90 : market.tier === 'secondary' ? 70 : 50;

  // Vacancy: <1%=+10, 1-3%=+5, 3-6%=0, >6%=-5
  let vacancyAdj;
  if (market.vacancy_pct < 1) vacancyAdj = 10;
  else if (market.vacancy_pct < 3) vacancyAdj = 5;
  else if (market.vacancy_pct < 6) vacancyAdj = 0;
  else vacancyAdj = -5;

  const score = clamp(tierBase + vacancyAdj);

  const rationale = `${market.name} is a ${market.tier} DC market (rank #${market.rank}). ${market.total_mw_supply} MW total supply, ${market.vacancy_pct}% vacancy, ~$${market.pricing_kw_month_usd}/kW-month.`;

  return { score: Math.round(score), rationale, details: market };
}

// ============================================================
// 5. Tax & Incentives
// ============================================================
export function scoreTax(state, taxByState) {
  const t = taxByState[state];
  if (!t) {
    return { score: 50, rationale: `Tax data unavailable for ${state}.`, details: {} };
  }

  // Overall 1=100, 5=0
  const base = clamp(100 - ((t.overall_score - 1) / 4) * 100);
  const score = clamp(base);

  const rationale = `${t.notes} State corporate income tax: ${t.state_income_tax_rate}%.`;

  return { score: Math.round(score), rationale, details: t };
}

// ============================================================
// 6. Power Cost
// ============================================================
export function scorePowerCost(state, powerCosts) {
  const rate = powerCosts[state];
  if (rate == null) {
    return { score: 50, rationale: `Power cost data unavailable for ${state}.`, details: {} };
  }

  // 5c=100, 7c=85, 9c=65, 12c=35, 18c=0
  let score;
  if (rate <= 5) score = 100;
  else if (rate <= 7) score = 100 - ((rate - 5) / 2) * 15;
  else if (rate <= 9) score = 85 - ((rate - 7) / 2) * 20;
  else if (rate <= 12) score = 65 - ((rate - 9) / 3) * 30;
  else if (rate <= 18) score = 35 - ((rate - 12) / 6) * 35;
  else score = 0;

  const benchmark =
    rate < 7 ? 'excellent' :
    rate < 8.5 ? 'good' :
    rate < 10 ? 'average' :
    'expensive';

  const rationale = `Industrial electricity rate: ${rate}¢/kWh (${benchmark}). US average: 8.3¢/kWh.`;

  return { score: Math.round(clamp(score)), rationale, details: { rate } };
}

// ============================================================
// 7. Sustainability / Grid Carbon
// ============================================================
export function scoreSustainability(state, sustainabilityByState) {
  const s = sustainabilityByState[state];
  if (!s) {
    return { score: 50, rationale: `Sustainability data unavailable for ${state}.`, details: {} };
  }

  // Carbon: 0=100, 800+=0
  const carbonScore = clamp(100 - (s.grid_carbon_intensity_gco2_kwh / 800) * 100);

  // Renewable %: direct
  const renewableScore = clamp(s.renewable_pct * 1.5);

  // PPA maturity: 1=100, 5=0
  const ppaScore = clamp(100 - ((s.ppa_market_maturity - 1) / 4) * 100);

  // Weighted
  const score = clamp(0.4 * carbonScore + 0.3 * renewableScore + 0.3 * ppaScore);

  const rationale = `Grid carbon ${s.grid_carbon_intensity_gco2_kwh} gCO2/kWh, ${s.renewable_pct}% renewable mix. 24/7 CFE feasibility: ${s["247_cfe_feasibility"]}/5.`;

  return { score: Math.round(score), rationale, details: s };
}

// ============================================================
// 8. Land Economics
// ============================================================
export function scoreLand(market, landByMarket, landDefault) {
  const l = market ? landByMarket[market.name] : landDefault;
  if (!l) {
    return { score: 50, rationale: 'Land economics data unavailable.', details: {} };
  }

  // Price/acre: $0.2M=100, $1M=70, $3M=40, $8M=10
  const price = l.avg_land_price_per_acre_usd;
  let priceScore;
  if (price <= 0.2) priceScore = 100;
  else if (price <= 1) priceScore = 100 - ((price - 0.2) / 0.8) * 30;
  else if (price <= 3) priceScore = 70 - ((price - 1) / 2) * 30;
  else if (price <= 8) priceScore = 40 - ((price - 3) / 5) * 30;
  else priceScore = 10;

  // Entitlement months: <6=100, 12=70, 18=40, 24+=20
  let entScore;
  if (l.entitlement_months <= 6) entScore = 100;
  else if (l.entitlement_months <= 12) entScore = 100 - ((l.entitlement_months - 6) / 6) * 30;
  else if (l.entitlement_months <= 24) entScore = 70 - ((l.entitlement_months - 12) / 12) * 50;
  else entScore = 20;

  // Greenfield: 1-5, invert
  const greenfieldScore = clamp(100 - ((l.greenfield_availability - 1) / 4) * 100);

  const score = clamp(0.4 * priceScore + 0.3 * entScore + 0.3 * greenfieldScore);

  const rationale = `Avg land ~$${l.avg_land_price_per_acre_usd}M/acre. Typical entitlement timeline: ${l.entitlement_months} months. ${l.notes}`;

  return { score: Math.round(score), rationale, details: l };
}

// ============================================================
// 9. Labor & Operations
// ============================================================
export function scoreLabor(market, laborByMarket, laborDefault) {
  const l = market ? laborByMarket[market.name] : laborDefault;
  if (!l) {
    return { score: 50, rationale: 'Labor data unavailable.', details: {} };
  }

  // Workforce: 15000+=100, 5000=75, 2000=50, 500=25
  const wf = l.estimated_dc_workforce;
  let wfScore;
  if (wf >= 15000) wfScore = 100;
  else if (wf >= 5000) wfScore = 75 + ((wf - 5000) / 10000) * 25;
  else if (wf >= 2000) wfScore = 50 + ((wf - 2000) / 3000) * 25;
  else if (wf >= 500) wfScore = 25 + ((wf - 500) / 1500) * 25;
  else wfScore = Math.max(5, (wf / 500) * 25);

  // Availability 1-5, invert
  const availScore = clamp(100 - ((l.labor_availability_score - 1) / 4) * 100);

  // Construction cost: 80=100, 100=70, 130=30
  const costScore = clamp(100 - ((l.construction_labor_cost_index - 80) / 50) * 70);

  // Airport: <15mi=100, 30mi=60, 50mi=20
  let airportScore;
  if (l.nearest_major_airport_miles <= 15) airportScore = 100;
  else if (l.nearest_major_airport_miles <= 30) airportScore = 100 - ((l.nearest_major_airport_miles - 15) / 15) * 40;
  else if (l.nearest_major_airport_miles <= 50) airportScore = 60 - ((l.nearest_major_airport_miles - 30) / 20) * 40;
  else airportScore = 20;

  const score = clamp(0.35 * wfScore + 0.25 * availScore + 0.2 * costScore + 0.2 * airportScore);

  const rationale = `Est. DC workforce: ${l.estimated_dc_workforce.toLocaleString()}. Construction cost index: ${l.construction_labor_cost_index} (100=avg). Nearest major airport: ${l.nearest_major_airport_miles} mi.`;

  return { score: Math.round(score), rationale, details: l };
}

// ============================================================
// 10. Regulatory Risk
// ============================================================
export function scoreRegulatory(market, regulatoryByMarket, regulatoryDefault) {
  const r = market ? regulatoryByMarket[market.name] : regulatoryDefault;
  if (!r) {
    return { score: 50, rationale: 'Regulatory data unavailable.', details: {} };
  }

  if (r.active_moratorium) {
    return {
      score: 5,
      rationale: `ACTIVE MORATORIUM: ${r.notes}`,
      details: r,
    };
  }

  // Entitlement risk, moratorium risk, community opposition: 1-5 invert, averaged
  const avgRisk = (r.entitlement_risk_score + r.moratorium_risk + r.community_opposition_level) / 3;
  let score = clamp(100 - ((avgRisk - 1) / 4) * 100);

  // NIMBY precedent: -10
  if (r.nimby_precedent) score -= 10;

  // Strict noise ordinance: -5
  if (r.noise_ordinance_strict) score -= 5;

  score = clamp(score);

  const rationale = `${r.notes}`;

  return { score: Math.round(score), rationale, details: r };
}

// ============================================================
// 11. Hyperscaler Presence
// ============================================================
export function scoreHyperscaler(market, hyperscalerByMarket, hyperscalerDefault) {
  const h = market ? hyperscalerByMarket[market.name] : hyperscalerDefault;
  if (!h) {
    return { score: 50, rationale: 'Hyperscaler presence data unavailable.', details: {} };
  }

  // Hyperscaler count: 6=100, 4=75, 2=50, 0=10
  const hsCount = h.hyperscaler_count;
  let hsScore;
  if (hsCount >= 6) hsScore = 100;
  else if (hsCount >= 4) hsScore = 75 + ((hsCount - 4) / 2) * 25;
  else if (hsCount >= 2) hsScore = 50 + ((hsCount - 2) / 2) * 25;
  else if (hsCount >= 1) hsScore = 30;
  else hsScore = 10;

  // Tenant depth 1-5 invert
  const depthScore = clamp(100 - ((h.hyperscaler_tenant_depth_score - 1) / 4) * 100);

  // Cloud on-ramps: 8+=100, 5=75, 3=50, 0=0
  const orCount = h.cloud_on_ramps_available;
  let orScore;
  if (orCount >= 8) orScore = 100;
  else if (orCount >= 5) orScore = 75 + ((orCount - 5) / 3) * 25;
  else if (orCount >= 3) orScore = 50 + ((orCount - 3) / 2) * 25;
  else if (orCount >= 1) orScore = 25 + ((orCount - 1) / 2) * 25;
  else orScore = 0;

  const score = clamp(0.4 * hsScore + 0.35 * depthScore + 0.25 * orScore);

  const hsList = h.hyperscalers_present.length > 0 ? h.hyperscalers_present.join(', ') : 'none';
  const rationale = `${h.hyperscaler_count} hyperscalers operational (${hsList}). ${h.cloud_on_ramps_available} cloud on-ramps available.`;

  return { score: Math.round(score), rationale, details: h };
}

// ============================================================
// Master scorer
// ============================================================
export function scoreSite({ lat, lng, state, market, data }) {
  const power = scorePower(lat, lng, data.substations);
  const fiber = scoreFiber(lat, lng, data.fiberHubs);
  const climate = scoreClimate(state, data.climateByState);
  const marketContext = scoreMarketContext(market);
  const tax = scoreTax(state, data.taxByState);
  const powerCost = scorePowerCost(state, data.powerCosts);
  const sustainability = scoreSustainability(state, data.sustainabilityByState);
  const land = scoreLand(market, data.landByMarket, data.landDefault);
  const labor = scoreLabor(market, data.laborByMarket, data.laborDefault);
  const regulatory = scoreRegulatory(market, data.regulatoryByMarket, data.regulatoryDefault);
  const hyperscaler = scoreHyperscaler(market, data.hyperscalerByMarket, data.hyperscalerDefault);

  const axes = {
    power, fiber, climate, marketContext, tax, powerCost,
    sustainability, land, labor, regulatory, hyperscaler,
  };

  // Weighted overall
  const overall =
    power.score * WEIGHTS.power +
    fiber.score * WEIGHTS.fiber +
    climate.score * WEIGHTS.climate +
    marketContext.score * WEIGHTS.marketContext +
    tax.score * WEIGHTS.tax +
    powerCost.score * WEIGHTS.powerCost +
    sustainability.score * WEIGHTS.sustainability +
    land.score * WEIGHTS.land +
    labor.score * WEIGHTS.labor +
    regulatory.score * WEIGHTS.regulatory +
    hyperscaler.score * WEIGHTS.hyperscaler;

  // Recommendation
  let recommendation;
  if (overall >= 75) recommendation = 'STRONG GO';
  else if (overall >= 60) recommendation = 'GO WITH CONSIDERATIONS';
  else if (overall >= 45) recommendation = 'CAUTION / FURTHER DILIGENCE';
  else recommendation = 'NO-GO / LOW SUITABILITY';

  // Use profile (hyperscaler vs colo fit)
  let useProfile;
  if (hyperscaler.score >= 70 && power.score >= 60) useProfile = 'Hyperscaler-ready';
  else if (fiber.score >= 70 && marketContext.score >= 70) useProfile = 'Colocation-friendly';
  else if (sustainability.score >= 75) useProfile = 'ESG-oriented deployment';
  else useProfile = 'Enterprise / edge deployment';

  return {
    overall: Math.round(overall),
    recommendation,
    useProfile,
    axes,
    weights: WEIGHTS,
  };
}