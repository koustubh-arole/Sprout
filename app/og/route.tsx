import { ImageResponse } from "next/og";

export const runtime = "edge";

// Shareable "companion card" PNG from stats in the query string, e.g.
// /og?name=Mango&title=Sprout&saved=24.5&streak=6&health=82
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = (searchParams.get("name") ?? "My companion").slice(0, 24);
  const title = (searchParams.get("title") ?? searchParams.get("stage") ?? "Seedling").slice(0, 24);
  const saved = searchParams.get("saved") ?? "0";
  const streak = clampInt(searchParams.get("streak"), 0);
  const health = clampInt(searchParams.get("health"), 70);

  const v = health / 100;
  const sky = lerp("#cfe6e9", "#d9efd2", v);
  const tint = "#6cc46f";
  const dark = "#2e7d3a";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `radial-gradient(120% 90% at 50% 0%, ${sky} 0%, #eef3ec 70%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 40, fontWeight: 800, color: dark }}>🌱 Sprout</div>

        {/* clay creature */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "240px",
            height: "240px",
            marginTop: "16px",
            borderRadius: "9999px",
            background: `radial-gradient(circle at 38% 30%, #b6e6b9 0%, ${tint} 65%, ${dark} 100%)`,
            boxShadow: "0 24px 50px -18px rgba(40,90,50,0.5)",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: "44px", marginTop: "-20px" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "9999px", background: "#23331f" }} />
            <div style={{ width: "20px", height: "20px", borderRadius: "9999px", background: "#23331f" }} />
          </div>
        </div>

        <div style={{ display: "flex", marginTop: "28px", fontSize: 52, fontWeight: 800, color: "#1f3d23" }}>{name}</div>
        <div style={{ display: "flex", fontSize: 28, color: dark, marginTop: "4px" }}>{title}</div>
        <div style={{ display: "flex", marginTop: "18px", fontSize: 30, color: "#3f7a3a" }}>
          🍃 {saved} kg CO₂ saved · 🔥 {streak}-day streak
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

function clampInt(raw: string | null, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(9999, Math.round(n)));
}

function lerp(a: string, b: string, t: number): string {
  const tc = Math.max(0, Math.min(1, t));
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const m = pa.map((x, i) => Math.round(x + (pb[i] - x) * tc));
  return `rgb(${m[0]}, ${m[1]}, ${m[2]})`;
}
