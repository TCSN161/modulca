import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Design Your Modular Home in Minutes";
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
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1a3a2a 0%, #2d5a3d 40%, #3a6b4a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #d4a24e 0%, #e8b84a 50%, #d4a24e 100%)",
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-1px",
            }}
          >
            Modul
          </span>
          <span
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#e8b84a",
              letterSpacing: "-1px",
            }}
          >
            CA
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            maxWidth: "900px",
            lineHeight: 1.2,
            marginBottom: "16px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            maxWidth: "700px",
            display: "flex",
          }}
        >
          {subtitle}
        </div>

        {/* Bottom modules illustration */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            gap: "12px",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: "60px",
                height: "60px",
                border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.3)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              3×3
            </div>
          ))}
        </div>

        {/* Domain badge */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "50px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.5)",
            display: "flex",
          }}
        >
          modulca.eu
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
