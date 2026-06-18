// lib/carbon/equivalents.ts
// Translate abstract kg CO2e into relatable, India-flavored equivalents.
// Raw kilograms mean little to people; "like driving 12 km" lands.

import { FACTORS } from "./factors";

export type Equivalent = { icon: string; text: string };

const AC_KWH_PER_HOUR = 0.85; // ~1.2 kW split unit, duty-cycled (~0.85 kWh/run-hour; BEE star-rating typicals)
const PHONE_KWH = 0.012; // ~12 Wh per full smartphone charge (~3000 mAh battery + charge losses)
const TREE_KG_PER_DAY = 21 / 365; // mature tree absorbs ~21 kg CO2/yr — common arboricultural convention (USDA/EPA-aligned)

export function equivalents(kg: number): Equivalent[] {
  const km = kg / FACTORS.carPetrolPerKm;
  const kwh = kg / FACTORS.gridPerKWh;
  const rupees = kwh * FACTORS.rupeePerKWh;
  const acHours = kwh / AC_KWH_PER_HOUR;
  const phoneCharges = kwh / PHONE_KWH;
  const treeDays = kg / TREE_KG_PER_DAY;

  return [
    { icon: "🚗", text: `like driving ${fmt(km)} km in a petrol car` },
    { icon: "❄️", text: `≈ ${fmt(acHours)} hours of air-conditioning` },
    { icon: "₹", text: `≈ ₹${fmt(rupees, 0)} of grid electricity` },
    { icon: "🔋", text: `≈ ${fmt(phoneCharges, 0)} full phone charges` },
    { icon: "🌳", text: `a tree needs ${fmt(treeDays, 0)} days to reabsorb this` },
  ];
}

/** Compact single equivalent for inline display. */
export function headlineEquivalent(kg: number): Equivalent {
  return equivalents(kg)[0];
}

function fmt(n: number, dp = 1): string {
  if (!isFinite(n) || n < 0) return "0";
  const rounded = dp === 0 ? Math.round(n) : Math.round(n * 10) / 10;
  return rounded.toLocaleString("en-IN");
}
