import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "satellite-tracker-app" // IMPORTANT (nominatim requires this)
        }
      }
    )

    const data = await res.json()

    return NextResponse.json({
      full: data.display_name,
      city:
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        "Unknown",
      state: data.address?.state,
      country: data.address?.country
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

// import { NextResponse } from "next/server"

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)

//   const lat = searchParams.get("lat")
//   const lon = searchParams.get("lon")

//   if (!lat || !lon) {
//     return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 })
//   }

//   try {
//     const res = await fetch(
//       `https://api.positionstack.com/v1/reverse?access_key=758f810f1b9a5aa88101e6827d83b688&query=${lat},${lon}&limit=1`
//     )

//     const data = await res.json()

//     const result = data.data?.[0]

//     return NextResponse.json({
//       locality: result?.locality || result?.neighbourhood || "Unknown",
//       city: result?.region || "Unknown"
//     })

//   } catch (err) {
//     return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
//   }
// }