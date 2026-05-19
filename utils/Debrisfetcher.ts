const DEBRIS_API_URL =
  "https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=tle";

const CACHE_KEY = "space_debris_cache";
const ONE_HOUR = 60 * 60 * 1000;

export const getLatestDebris = async () => {
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    if (now - timestamp < ONE_HOUR) {
      console.log("Using cached debris data");
      return data;
    }
  }

  try {
    console.log("Fetching fresh debris data...");

    // ❗ IMPORTANT CHANGE
    const response = await fetch(DEBRIS_API_URL);
    const text = await response.text(); // ✅ NOT json()

    console.log("RAW TEXT:", text);

    const lines = text
      .split("\n")
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const debris = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i + 1] && lines[i + 2]) {
        debris.push({
          name: lines[i],
          line1: lines[i + 1],
          line2: lines[i + 2],
        });
      }
    }

    console.log("DEBRIS NAMES:", debris.map(d => d.name));

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: now,
        data: debris,
      })
    );

    return debris;
  } catch (error) {
    console.error("Failed to fetch debris:", error);
    return cached ? JSON.parse(cached).data : [];
  }
};

export const getCachedDebris = () => {
  if (typeof window === "undefined") return [];
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached).data : [];
};