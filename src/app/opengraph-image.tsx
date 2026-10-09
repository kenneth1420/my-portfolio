import { ImageResponse } from "next/og";

import { site } from "../data/site";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#090d16",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(56,189,248,0.22), transparent 55%), radial-gradient(circle at 100% 30%, rgba(16,185,129,0.14), transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 8,
            color: "#38bdf8",
            marginBottom: 28,
          }}
        >
          {site.location.label.toUpperCase()}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.05,
          }}
        >
          {site.name}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 44,
            color: "#38bdf8",
            marginTop: 16,
          }}
        >
          {site.role}
        </div>

        <div
          style={{
            display: "flex",
            width: 120,
            height: 6,
            background: "#38bdf8",
            borderRadius: 999,
            margin: "40px 0",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#999999",
          }}
        >
          {site.yearsExperience}+ years · C# / ASP.NET Core · React · React
          Native · 17 projects delivered
        </div>
      </div>
    ),
    size,
  );
}
