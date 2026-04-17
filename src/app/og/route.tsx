import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/** ModulCA brand tokens — kept inline so the edge runtime needs no extra imports. */
const BRAND = {
  teal: "#115e59", // teal-800
  tealDeep: "#0B3F3C",
  amber: "#f59e0b", // amber-500
  bone: "#FAF8F5",
  charcoal: "#1F2937",
} as const;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title =
    searchParams.get("title") || "Design Your Modular Home in Minutes";
  const subtitle =
    searchParams.get("subtitle") ||
    "AI-powered platform for modular construction";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "stretch",
          background: BRAND.bone,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          padding: "80px",
        }}
      >
        {/* Subtle grid backdrop */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            opacity: 0.06,
            backgroundImage: `linear-gradient(${BRAND.teal} 1px, transparent 1px), linear-gradient(90deg, ${BRAND.teal} 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            display: "flex",
            background: `linear-gradient(90deg, ${BRAND.teal} 0%, ${BRAND.teal} 60%, ${BRAND.amber} 60%, ${BRAND.amber} 100%)`,
          }}
        />

        {/* Top row: logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: BRAND.teal,
              letterSpacing: "-1.5px",
            }}
          >
            Modul
          </span>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 800,
              color: BRAND.amber,
              letterSpacing: "-1.5px",
            }}
          >
            CA
          </span>
        </div>

        {/* Middle: title + subtitle, left-aligned */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            zIndex: 1,
            maxWidth: "1040px",
          }}
        >
          <div
            style={{
              fontSize: "82px",
              fontWeight: 800,
              color: BRAND.tealDeep,
              lineHeight: 1.05,
              letterSpacing: "-2px",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: "28px",
              fontSize: "32px",
              fontWeight: 500,
              color: BRAND.charcoal,
              opacity: 0.75,
              lineHeight: 1.35,
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Bottom row: 3x3 module glyph + domain */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", gap: "8px" }}>
            {[0, 1, 2].map((row) => (
              <div
                key={row}
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {[0, 1, 2].map((col) => (
                  <div
                    key={col}
                    style={{
                      width: "28px",
                      height: "28px",
                      background:
                        (row + col) % 2 === 0 ? BRAND.teal : BRAND.amber,
                      borderRadius: "4px",
                      display: "flex",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "22px",
              fontWeight: 600,
              color: BRAND.teal,
            }}
          >
            <span>modulca.eu</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
