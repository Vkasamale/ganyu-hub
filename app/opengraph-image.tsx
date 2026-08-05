import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// Branded 1200x630 link-preview card (homepage + any page without its own OG
// image). Pages that set their own openGraph.images (creative profiles,
// portfolio work) override this. ponytail: text+logo card, no design deps.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ganyu Hub — hire Malawian creatives";

export default async function OgImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo-g.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #069494 0%, #057a7a 55%, #045f5f 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={148} height={148} alt="" style={{ borderRadius: 32 }} />
        <div style={{ marginTop: 40, fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          Ganyu Hub
        </div>
        <div style={{ marginTop: 12, fontSize: 36, opacity: 0.9 }}>
          Hire Malawian creatives
        </div>
      </div>
    ),
    { ...size }
  );
}
