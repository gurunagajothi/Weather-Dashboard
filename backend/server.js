/**
 * Weather Dashboard - Backend Server
 * ------------------------------------
 * Stack: Node.js + Express
 * Purpose:
 *   1. Serve the static frontend (HTML/CSS/JS)
 *   2. Expose a REST API endpoint (/api/weather) that:
 *        - Accepts a city name from the client
 *        - Calls Open-Meteo's Geocoding API to convert city name -> lat/lon
 *        - Calls Open-Meteo's Forecast API to get current weather conditions
 *        - Returns a clean JSON response to the frontend
 *        - Handles errors (invalid city, network issues, bad input) gracefully
 *
 * Why Open-Meteo?
 *   - 100% free, no API key / signup required
 *   - Great for learning async programming + API integration without
 *     worrying about key management
 *
 * AI-Assisted Development Notes (as required by the assignment):
 *   - AI (Claude) was used to scaffold the Express routes and async/await
 *     fetch logic for calling the two chained external APIs.
 *   - AI was used to review error-handling branches (city not found,
 *     network failure, malformed input) and suggest edge cases to cover.
 *   - See COMMIT_MESSAGES.md for AI-generated commit message documentation.
 */

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "frontend")));

// WMO Weather interpretation codes -> human readable text
// (Reference: https://open-meteo.com/en/docs)
const WEATHER_CODES = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherDescription(code) {
  return WEATHER_CODES[code] || "Unknown conditions";
}

/**
 * GET /api/weather?city=<cityName>
 * Main weather lookup endpoint.
 */
app.get("/api/weather", async (req, res) => {
  const city = (req.query.city || "").trim();

  // ---- Input validation / error handling ----
  if (!city) {
    return res.status(400).json({
      error: "MISSING_CITY",
      message: "Please enter a city name to search.",
    });
  }

  if (!/^[a-zA-Z\s\-',.]+$/.test(city)) {
    return res.status(400).json({
      error: "INVALID_CITY",
      message: "City name can only contain letters, spaces, and basic punctuation.",
    });
  }

  try {
    // ---- Step 1: Geocoding (city name -> lat/lon) ----
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error(`Geocoding API responded with status ${geoResponse.status}`);
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({
        error: "CITY_NOT_FOUND",
        message: `Couldn't find a city named "${city}". Please check the spelling and try again.`,
      });
    }

    const { latitude, longitude, name, country, admin1 } = geoData.results[0];

    // ---- Step 2: Current weather for that location ----
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error(`Forecast API responded with status ${weatherResponse.status}`);
    }

    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      return res.status(502).json({
        error: "NO_WEATHER_DATA",
        message: "Weather data is currently unavailable for this location. Try again later.",
      });
    }

    const cw = weatherData.current_weather;

    // ---- Success response ----
    return res.json({
      city: name,
      region: admin1 || null,
      country: country || null,
      latitude,
      longitude,
      temperature: cw.temperature,
      windspeed: cw.windspeed,
      winddirection: cw.winddirection,
      weathercode: cw.weathercode,
      description: getWeatherDescription(cw.weathercode),
      time: cw.time,
    });
  } catch (err) {
    // ---- Network / unexpected error handling ----
    console.error("Weather lookup failed:", err.message);
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Something went wrong while fetching weather data. Please try again in a moment.",
    });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Fallback: send index.html for any other route (simple SPA support)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Weather Dashboard server running at http://localhost:${PORT}`);
});
