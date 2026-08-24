import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat/lon" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "satellite-tracker-app",
        },
      }
    );

    const data = await res.json();

    return NextResponse.json({
      full: data.display_name,
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "Unknown",
      state: data.address?.state,
      country: data.address?.country,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}