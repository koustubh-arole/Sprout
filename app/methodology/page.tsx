import type { Metadata } from "next";
import Link from "next/link";
import { ANCHORS, FACTORS, FOOD } from "@/lib/carbon/factors";

export const metadata: Metadata = {
  title: "Methodology — Sprout",
  description:
    "Every emission factor Sprout uses, its value, vintage, and source. Plus why these four decisions, and the honest limits of individual action.",
};

type Row = { label: string; value: string; source: string; url: string };

const TRANSPORT: Row[] = [
  { label: "Grid electricity", value: `${FACTORS.gridPerKWh} kg/kWh`, source: "CEA CO₂ Baseline Database v20, FY2024-25 weighted average", url: "https://carbonneeti.com/blog/cea-grid-emission-factors-explained" },
  { label: "Petrol car (small, solo)", value: `${FACTORS.carPetrolPerKm} kg/km`, source: "DEFRA/DESNZ 2024 — small petrol car <1.4 L (0.1701)", url: "https://www.mycarbon.co.uk/2024/09/06/defra-ghg-emission-conversion-factors-update-2024/" },
  { label: "CNG auto-rickshaw", value: `${FACTORS.autoRickshawPerKm} kg/p-km`, source: "India GHG Program / Climatiq road transport factors", url: "https://indiaghgp.org/" },
  { label: "City bus", value: `${FACTORS.busPerKm} kg/p-km`, source: "India GHG Program road transport factors", url: "https://indiaghgp.org/" },
  { label: "Two-wheeler", value: `${FACTORS.twoWheelerPerKm} kg/p-km`, source: "India GHG Program road transport factors", url: "https://indiaghgp.org/" },
  { label: "Metro rail", value: `${FACTORS.metroPerKm} kg/p-km`, source: "Electric traction on the CEA grid, per passenger", url: "https://carbonneeti.com/blog/cea-grid-emission-factors-explained" },
  { label: "Train (AC class)", value: `${FACTORS.trainAcPerKm} kg/p-km`, source: "India GHG Program rail factors (network avg ~0.0078, 2014-15); AC coaches run higher per passenger", url: "https://indiaghgp.org/sites/default/files/Rail%20Transport%20Emission.pdf" },
  { label: "Domestic flight", value: `${FACTORS.flightDomesticPerKm} kg/p-km`, source: "DEFRA 2024 short-haul + radiative-forcing uplift", url: "https://www.mycarbon.co.uk/2024/09/06/defra-ghg-emission-conversion-factors-update-2024/" },
  { label: "Walking / cycling", value: `${FACTORS.activePerKm} kg/km`, source: "Zero tailpipe", url: "https://ourworldindata.org/travel-carbon-footprint" },
];

const FOODS: Row[] = [
  { label: "Veg thali (dal, sabzi, roti/rice)", value: `${FOOD.vegThali} kg/meal`, source: "Our World in Data / Poore & Nemecek 2018", url: "https://ourworldindata.org/environmental-impacts-of-food" },
  { label: "Egg dish", value: `${FOOD.eggMeal} kg/meal`, source: "Our World in Data / Poore & Nemecek 2018", url: "https://ourworldindata.org/environmental-impacts-of-food" },
  { label: "Chicken meal (~100 g)", value: `${FOOD.chickenMeal} kg/meal`, source: "Our World in Data / Poore & Nemecek 2018", url: "https://ourworldindata.org/environmental-impacts-of-food" },
  { label: "Paneer / cheese dish", value: `${FOOD.paneerCheeseMeal} kg/meal`, source: "Our World in Data / Poore & Nemecek 2018", url: "https://ourworldindata.org/environmental-impacts-of-food" },
  { label: "Red-meat thali (~100 g beef/mutton)", value: `${FOOD.beefMeal} kg/meal`, source: "Our World in Data / Poore & Nemecek 2018", url: "https://ourworldindata.org/less-meat-or-sustainable-meat" },
];

function FactorTable({ rows }: { rows: Row[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-stone-300 text-left text-stone-500">
            <th className="py-2 pr-4 font-semibold">Activity</th>
            <th className="py-2 pr-4 font-semibold">Factor</th>
            <th className="py-2 font-semibold">Source &amp; vintage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-b border-stone-100 align-top">
              <td className="py-2 pr-4 font-medium text-stone-900">{r.label}</td>
              <td className="py-2 pr-4 tabular-nums text-stone-700">{r.value}</td>
              <td className="py-2 text-stone-600">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
                  {r.source}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div className="flex flex-1 flex-col bg-stone-50 text-stone-900">
      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/" className="text-sm font-medium text-emerald-700 underline-offset-2 hover:underline">
          ← Back to Sprout
        </Link>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Methodology</h1>
        <p className="mt-3 text-stone-600">
          Sprout uses a single, disclosed vintage of emission factors. The AI coach never invents or
          changes numbers — every figure you see in the app originates in the table below. All values
          are kg CO₂e and India-localized where it matters.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Why these four decisions?</h2>
          <p className="mt-2 text-stone-700">
            The seminal review by{" "}
            <a href="https://iopscience.iop.org/article/10.1088/1748-9326/aa7541" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
              Wynes &amp; Nicholas (2017)
            </a>{" "}
            found four lifestyle choices dwarf all others: a plant-based diet (~0.8 t/yr), living
            car-free (~2.4 t/yr), avoiding flights (~1.6 t per transatlantic trip), and having one
            fewer child (~58.6 t/yr). Sprout tracks the first three directly as{" "}
            <strong>Food</strong>, <strong>Commute</strong>, and <strong>Travel</strong>.
          </p>
          <p className="mt-2 text-stone-700">
            We deliberately swap the fourth — &ldquo;have one fewer child&rdquo; — for{" "}
            <strong>Cooling (AC)</strong>. Family size is not a daily, actionable nudge and is
            ethically fraught; meanwhile cooling is the single biggest household electricity lever in
            India, on a grid that is still coal-heavy (~{FACTORS.gridPerKWh} kg CO₂ per kWh). For a
            daily-choice coach aimed at an Indian audience, AC is the higher-leverage, repeatable
            decision. On food we follow{" "}
            <a href="https://ourworldindata.org/food-choice-vs-eating-local" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
              Our World in Data
            </a>
            : <em>what</em> you eat matters far more than how far it travelled.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Transport &amp; electricity factors</h2>
          <FactorTable rows={TRANSPORT} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Food factors</h2>
          <FactorTable rows={FOODS} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Comparison anchors</h2>
          <p className="mt-2 text-stone-700">
            We compare your day against the average Indian&apos;s daily footprint (
            {(ANCHORS.avgIndianPerDay).toFixed(1)} kg/day, from{" "}
            {ANCHORS.avgIndianPerYear.toLocaleString("en-IN")} kg/yr). Both per-capita anchors are
            production-based for an apples-to-apples comparison:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
            <li>
              India: ~{(ANCHORS.avgIndianPerYear / 1000).toFixed(1)} t/yr —{" "}
              <a href="https://ourworldindata.org/co2/country/india" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
                EDGAR 2023 / IEA
              </a>
            </li>
            <li>
              United States: ~{(ANCHORS.avgUsPerYear / 1000).toFixed(1)} t/yr —{" "}
              <a href="https://ourworldindata.org/co2/country/united-states" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
                Our World in Data, 2023 (production-based)
              </a>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Relatable equivalents</h2>
          <p className="mt-2 text-stone-700">
            To make kilograms tangible we convert them using the same factors above plus: an AC unit
            drawing ~0.85 kWh per run-hour, ~12 Wh per full phone charge, and a mature tree absorbing
            ~21 kg CO₂/yr (a common arboricultural convention). These are illustrative, not precise
            offsets — a tree&apos;s real uptake varies widely by species, age, and climate.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">The village game (Sprigs &amp; meters)</h2>
          <p className="mt-2 text-stone-700">
            Your village, the <strong>Sprigs</strong> currency, and the Pollution / Ozone / Disaster
            meters are an <strong>illustrative model of your personal contribution</strong> — a way to
            make the carbon engine above tangible and motivating. They are <em>not</em> live planetary
            data or a literal claim that one person heals the ozone layer.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-stone-700">
            <li>You earn Sprigs from verified low-carbon actions (scaled by the kg CO₂e saved above).</li>
            <li>Spending Sprigs on structures lowers the meters by fixed, transparent amounts — a game economy, not a measurement.</li>
            <li>Village Health is a weighted blend of the three meters, so building anything good visibly helps.</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Our own AI footprint</h2>
          <p className="mt-2 text-stone-700">
            Sprout uses AI in two narrow places: a coach that <em>rephrases</em> pre-computed numbers, and
            on-demand photo verification. Neither runs continuously — inference happens only when you act.
            We keep the footprint deliberately small: a lightweight Flash-class model, short prompts, one
            image per scan, and a deterministic fallback so the app works with no AI at all. Training and
            running large models has a real carbon cost, so the honest move is to use the smallest model
            that does the job — and to say so.
          </p>
        </section>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-xl font-bold">Honest limits</h2>
          <p className="mt-2 text-stone-700">
            Individual action is real but partial. Most emissions are decided by energy systems,
            industry, and policy — not personal willpower. The &ldquo;carbon footprint&rdquo; framing
            itself was popularised by a{" "}
            <a href="https://theconversation.com/how-oil-companies-put-the-responsibility-for-climate-change-on-consumers-214132" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
              2004&ndash;06 BP campaign
            </a>{" "}
            that shifted blame toward consumers. As{" "}
            <a href="https://hannahritchie.substack.com/p/the-false-dichotomy-of-systemic-and" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-emerald-700">
              Hannah Ritchie argues
            </a>
            , systemic and individual action are not a dichotomy — they reinforce each other. Sprout
            is for building behaviour and hope, not guilt.
          </p>
        </section>
      </main>
    </div>
  );
}
