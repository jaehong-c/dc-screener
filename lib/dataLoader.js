// lib/dataLoader.js
import dcMarkets from '../data/dc_markets.json';
import substations from '../data/substations.json';
import fiberHubs from '../data/fiber_hubs.json';
import powerCosts from '../data/power_costs.json';
import climateRisk from '../data/climate_risk.json';
import taxIncentives from '../data/tax_incentives.json';
import sustainability from '../data/sustainability.json';
import landEconomics from '../data/land_economics.json';
import laborOperations from '../data/labor_operations.json';
import regulatoryRisk from '../data/regulatory_risk.json';
import hyperscalerPresence from '../data/hyperscaler_presence.json';

export const data = {
  markets: dcMarkets.markets,
  substations: substations.substations,
  fiberHubs: fiberHubs.fiber_hubs,
  powerCosts: powerCosts.rates_by_state,
  powerCostsMeta: {
    national_average: powerCosts.national_average,
    benchmarks: powerCosts.benchmarks,
  },
  climateByState: climateRisk.states,
  taxByState: taxIncentives.states,
  sustainabilityByState: sustainability.states,
  landByMarket: landEconomics.markets,
  landDefault: landEconomics.default_for_non_market,
  laborByMarket: laborOperations.markets,
  laborDefault: laborOperations.default_for_non_market,
  regulatoryByMarket: regulatoryRisk.markets,
  regulatoryDefault: regulatoryRisk.default_for_non_market,
  hyperscalerByMarket: hyperscalerPresence.markets,
  hyperscalerDefault: hyperscalerPresence.default_for_non_market,
};