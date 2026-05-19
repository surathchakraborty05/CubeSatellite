// src/utils/satelliteFetcher.ts
const TLE_API_URL = "https://tle.ivanstanojevic.me/api/tle/?page-size=100";
const CACHE_KEY = "satellite_debris_cache";
const ONE_HOUR = 60 * 60 * 1000; // ms

export const getLatestSatellite = async () => {
  const cached = localStorage.getItem(CACHE_KEY);
  const now = Date.now();

  if (cached) {
    const { timestamp, data } = JSON.parse(cached);
    // If data is less than 1 hour old, return it immediately
    if (now - timestamp < ONE_HOUR) {
      console.log("Using cached satellite data (1-hour limit)");
      return data;
    }
    else if (now - timestamp > ONE_HOUR){
      console.log("Clearing Old Data");
      localStorage.removeItem(CACHE_KEY);
      console.log("Cleared Old Data");
    }
  }

  // Otherwise, fetch new data
  try {
    console.log("Fetching fresh TLE data from API...");
    const response = await fetch(TLE_API_URL);
    const result = await response.json();
    // 1. Log the raw API result to see the exact structure
    console.log("RAW API RESULT:", result);

    // 2. Log only the names to quickly scan what satellites were found
    if (result.member) {
      console.log("SATELLITE NAMES FETCHED:", result.member.map((s: any) => s.name));
    }
    // Format the API response to match your {name, line1, line2} structure
    const formattedData = result.member.map((sat: any) => ({
      name: sat.name,
      type: sat["@type"],
      line1: sat.line1,
      line2: sat.line2,
    }));

    // Store in local storage with current timestamp
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: now,
      data: formattedData
    }));

    return formattedData;
  } catch (error) {
    console.error("Failed to fetch TLE data:", error);
    // Fallback to cached data even if old, or return empty array
    return cached ? JSON.parse(cached).data : [];
  }
};
export const getCachedDebris = () => {
  if (typeof window === "undefined") return [];
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached).data : [];
};