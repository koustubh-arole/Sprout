// lib/carbon/actions.ts
// The POSITIVE side of Sprout: real, photo-provable low-carbon actions a user
// takes. Each action's CO2 SAVED is computed against a realistic baseline using
// the same disclosed FACTORS as the rest of the engine — no invented numbers.

import { FACTORS, FOOD, type Category, round1 } from "./factors";

export type GreenAction = {
  id: string;
  label: string;
  emoji: string;
  category: Category;
  /** What the photo should show, to keep verification honest. */
  proofHint: string;
  /** kg CO2e avoided vs. the high-carbon baseline this action replaces. */
  savedKg: number;
  /** Gamification points (derived from savings, with a small floor). */
  points: number;
};

/** Points reward more savings but never zero — showing up matters. */
export function pointsFor(savedKg: number): number {
  return Math.max(5, Math.round(savedKg * 10));
}

const km10 = (perKm: number) => round1(perKm * 10);

// Each saving = (baseline activity) − (the greener activity the user actually did).
const CYCLE_SAVED = km10(FACTORS.carPetrolPerKm); // 10 km cycled instead of solo car
const METRO_SAVED = round1(km10(FACTORS.carPetrolPerKm) - km10(FACTORS.metroPerKm));
const BUS_SAVED = round1(km10(FACTORS.carPetrolPerKm) - km10(FACTORS.busPerKm));
const VEG_SAVED = round1(FOOD.chickenMeal - FOOD.vegThali); // veg instead of a chicken meal
const TRAIN_SAVED = round1(1150 * (FACTORS.flightDomesticPerKm - FACTORS.trainAcPerKm)); // train instead of Delhi–Mumbai flight
const FAN_SAVED = round1((4.8 - 0.6) * FACTORS.gridPerKWh); // fan-only night instead of AC@26

export const ACTIONS: GreenAction[] = [
  { id: "cycle", label: "Cycled / walked a trip", emoji: "🚲", category: "commute", proofHint: "A photo of your bike, helmet, or the route", savedKg: CYCLE_SAVED, points: pointsFor(CYCLE_SAVED) },
  { id: "metro", label: "Took the metro", emoji: "🚇", category: "commute", proofHint: "A photo inside the metro or of your ticket", savedKg: METRO_SAVED, points: pointsFor(METRO_SAVED) },
  { id: "bus", label: "Took the bus", emoji: "🚌", category: "commute", proofHint: "A photo on the bus or of your pass", savedKg: BUS_SAVED, points: pointsFor(BUS_SAVED) },
  { id: "veg", label: "Ate a plant-based meal", emoji: "🥗", category: "food", proofHint: "A photo of your veg thali / plate", savedKg: VEG_SAVED, points: pointsFor(VEG_SAVED) },
  { id: "fan", label: "Fan instead of AC", emoji: "🌬️", category: "energy", proofHint: "A photo of the fan / thermostat", savedKg: FAN_SAVED, points: pointsFor(FAN_SAVED) },
  { id: "train", label: "Train instead of a flight", emoji: "🚆", category: "travel", proofHint: "A photo of the platform or your ticket", savedKg: TRAIN_SAVED, points: pointsFor(TRAIN_SAVED) },
];

export function getAction(id: string): GreenAction | undefined {
  return ACTIONS.find((a) => a.id === id);
}

/** Total CO2 saved across a list of logged actions (rounded). */
export function totalSavedKg(saved: number[]): number {
  return round1(saved.reduce((s, v) => s + v, 0));
}
