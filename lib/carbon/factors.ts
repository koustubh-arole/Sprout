// lib/carbon/factors.ts
// India-localized emission factors. A SINGLE disclosed vintage; every value is
// sourced inline and surfaced on the /methodology page. All values are kg CO2e.
// The LLM coach NEVER invents numbers — they all originate here.

/** Base activity factors (kg CO2e per unit). */
export const FACTORS = {
  // Electricity — CEA national grid, FY2024-25 weighted average (~0.71 kg/kWh).
  // Source: CEA "CO2 Baseline Database for the Indian Power Sector", v20 (Dec 2024).
  // https://carbonneeti.com/blog/cea-grid-emission-factors-explained
  gridPerKWh: 0.71,

  // Transport — kg CO2e per passenger-km.
  carPetrolPerKm: 0.17, // small petrol car (<1.4 L), ~1 occupant. DEFRA/DESNZ 2024: 0.1701 kg/km. https://www.mycarbon.co.uk/2024/09/06/defra-ghg-emission-conversion-factors-update-2024/
  autoRickshawPerKm: 0.11, // CNG auto-rickshaw, per passenger (India GHG Program / Climatiq)
  busPerKm: 0.05, // city bus, per passenger (India GHG Program road transport factors)
  twoWheelerPerKm: 0.05, // petrol scooter / motorcycle (India GHG Program)
  metroPerKm: 0.02, // metro rail, per passenger (electric traction on CEA grid)
  trainAcPerKm: 0.012, // AC class, per passenger. Network avg ~0.0078 (India GHG Program, 2014-15); AC coaches run higher per passenger. https://indiaghgp.org/sites/default/files/Rail%20Transport%20Emission.pdf
  flightDomesticPerKm: 0.15, // short-haul domestic, per passenger (incl. radiative-forcing uplift; DEFRA 2024 domestic + RFI)
  activePerKm: 0, // walking / cycling

  // Average domestic electricity tariff, for rupee-relatable equivalents (₹/kWh).
  rupeePerKWh: 8,
} as const;

// Food — kg CO2e per typical serving.
// Source: Our World in Data (Poore & Nemecek, 2018). Land use + farm stage are
// >80% of a food's footprint, so WHAT you eat dominates food-miles.
// https://ourworldindata.org/food-choice-vs-eating-local
export const FOOD = {
  beefMeal: 15.5,
  paneerCheeseMeal: 4.5,
  chickenMeal: 1.8,
  eggMeal: 1.1,
  vegThali: 0.7,
} as const;

// Context anchors (kg CO2e) for hope-framing + normative comparison.
// Both production-based per-capita figures, for an apples-to-apples comparison.
// India ~2.0 t: EDGAR 2023 / IEA ("around 2 tonnes").
// US ~14.3 t: Our World in Data, production-based 2023. https://ourworldindata.org/co2/country/united-states
export const ANCHORS = {
  avgIndianPerYear: 2000,
  avgUsPerYear: 14300,
  avgIndianPerDay: 2000 / 365, // ~5.48 kg/day
} as const;

export type Tier = "low" | "medium" | "high";
export type Category = "food" | "commute" | "energy" | "travel";

export type ChoiceOption = {
  id: string;
  label: string;
  detail: string;
  kg: number;
};

export type Decision = {
  id: string;
  category: Category;
  emoji: string;
  prompt: string; // the "before you choose" question
  context: string; // why this choice matters (India-localized)
  unit: string; // what the numbers describe, e.g. "per 10 km"
  options: ChoiceOption[]; // authored LOW -> HIGH (default-ordering nudge)
};

/**
 * The high-impact daily decisions. We deliberately track only a FEW choices that
 * matter (Wynes & Nicholas 2017) instead of exhaustive logging, which is the #2
 * cause of tracking fatigue. Options are ordered low->high so the low-carbon
 * choice is surfaced first (choice-architecture nudge).
 */
export const DECISIONS: Decision[] = [
  {
    id: "lunch",
    category: "food",
    emoji: "🍽️",
    prompt: "What's on your plate today?",
    context:
      "What you eat matters far more than food miles — a red-meat meal can out-emit a month of veg thalis.",
    unit: "per meal",
    options: [
      { id: "veg", label: "Veg thali", detail: "Dal, sabzi, roti/rice", kg: FOOD.vegThali },
      { id: "chicken", label: "Chicken meal", detail: "~100 g chicken", kg: FOOD.chickenMeal },
      { id: "paneer", label: "Paneer / cheese", detail: "Dairy-heavy dish", kg: FOOD.paneerCheeseMeal },
      { id: "beef", label: "Red-meat thali", detail: "~100 g beef/mutton", kg: FOOD.beefMeal },
    ],
  },
  {
    id: "commute",
    category: "commute",
    emoji: "🛺",
    prompt: "How will you travel 10 km today?",
    context:
      "Cities run on short trips — swapping a solo car ride for the metro is one of the easiest daily wins.",
    unit: "per 10 km",
    options: [
      { id: "active", label: "Cycle / walk", detail: "Zero tailpipe", kg: 0 },
      { id: "metro", label: "Metro", detail: "Per passenger", kg: round1(FACTORS.metroPerKm * 10) },
      { id: "auto", label: "Auto-rickshaw", detail: "CNG, per passenger", kg: round1(FACTORS.autoRickshawPerKm * 10) },
      { id: "car", label: "Car (solo)", detail: "Petrol, 1 occupant", kg: round1(FACTORS.carPetrolPerKm * 10) },
    ],
  },
  {
    id: "cooling",
    category: "energy",
    emoji: "❄️",
    prompt: "How will you stay cool tonight?",
    context:
      "Electricity is ~44% of India's CO₂ and the grid is coal-heavy — AC settings are the single biggest household lever.",
    unit: "per night (~8 h)",
    options: [
      { id: "fan", label: "Fan only", detail: "~0.6 kWh", kg: round1(0.6 * FACTORS.gridPerKWh) },
      { id: "ac26", label: "AC at 26°C + fan", detail: "~4.8 kWh", kg: round1(4.8 * FACTORS.gridPerKWh) },
      { id: "ac18", label: "AC at 18°C all night", detail: "~9.6 kWh", kg: round1(9.6 * FACTORS.gridPerKWh) },
    ],
  },
  {
    id: "trip",
    category: "travel",
    emoji: "✈️",
    prompt: "Delhi → Mumbai. How do you go?",
    context:
      "'Growth-stage' choices like a first flight are the highest-leverage moments — one flight can dwarf months of daily choices.",
    unit: "~1,150 km trip",
    options: [
      { id: "skip", label: "Video call instead", detail: "Skip the trip", kg: 0 },
      { id: "train", label: "AC train", detail: "Per passenger", kg: round1(1150 * FACTORS.trainAcPerKm) },
      { id: "flight", label: "Domestic flight", detail: "Per passenger", kg: round1(1150 * FACTORS.flightDomesticPerKm) },
    ],
  },
];

export function getDecision(id: string): Decision | undefined {
  return DECISIONS.find((d) => d.id === id);
}

/**
 * How a choice changes the living world's health. The best option in a decision
 * HEALS the world (+5); the worst WILTS it (-12). Loss aversion on the specific
 * choice, but always redeemable — a good next choice heals it back.
 */
export function healthDelta(decision: Decision, choiceId: string): number {
  const chosen = decision.options.find((o) => o.id === choiceId);
  if (!chosen) return 0;
  const kgs = decision.options.map((o) => o.kg);
  const best = Math.min(...kgs);
  const worst = Math.max(...kgs);
  if (worst === best) return 5;
  const badness = (chosen.kg - best) / (worst - best); // 0 (best) .. 1 (worst)
  const HEAL = 5;
  const WILT = -12;
  return Math.round(HEAL + badness * (WILT - HEAL));
}

/** Relative tier within a decision, for the nudge label (low / medium / high). */
export function tierOf(decision: Decision, choiceId: string): Tier {
  const chosen = decision.options.find((o) => o.id === choiceId);
  if (!chosen) return "low";
  const kgs = decision.options.map((o) => o.kg);
  const best = Math.min(...kgs);
  const worst = Math.max(...kgs);
  if (worst === best) return "low";
  const badness = (chosen.kg - best) / (worst - best);
  if (badness <= 0.15) return "low";
  if (badness >= 0.6) return "high";
  return "medium";
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
