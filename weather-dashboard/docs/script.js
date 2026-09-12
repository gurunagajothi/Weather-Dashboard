/**
 * Weather Dashboard - Static (GitHub Pages) Version
 * -----------------------------------------------------
 * GitHub Pages can only serve static files (HTML/CSS/JS) — it CANNOT
 * run a Node.js/Express backend. So for this deployed version, the
 * exact same API-integration logic that lived in backend/server.js
 * has been moved here and runs directly in the browser using
 * async/await + fetch(). Open-Meteo's APIs support CORS, so this works
 * fine client-side.
 *
 * This keeps ALL assignment requirements intact:
 *   - Public weather API (Open-Meteo)
 *   - Current weather display
 *   - Search by city
 *   - Error handling for invalid inputs
 *   - Asynchronous programming (async/await, chained API calls)
 */

const form = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const statusArea = document.getElementById("status-area");
const weatherCard = document.getElementById("weather-card");

const els = {
  city: document.getElementById("weather-city"),
  region: document.getElementById("weather-region"),
  temp: document.getElementById("weather-temp"),
  desc: document.getElementById("weather-desc"),
  wind: document.getElementById("weather-wind"),
  winddir: document.getElementById("weather-winddir"),
  time: document.getElementById("weather-time"),
};

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

function setStatus(message, type) {
  statusArea.textContent = message || "";
  statusArea.className = "status-area" + (type ? ` ${type}` : "");
}

function showWeatherCard(data) {
  els.city.textContent = data.city;
  els.region.textContent = [data.region, data.country].filter(Boolean).join(", ");
  els.temp.textContent = `${Math.round(data.temperature)}°C`;
  els.desc.textContent = data.description;
  els.wind.textContent = `${data.windspeed} km/h`;
  els.winddir.textContent = `${data.winddirection}°`;
  els.time.textContent = new Date(data.time).toLocaleString();
  weatherCard.classList.remove("hidden");
}

function hideWeatherCard() {
  weatherCard.classList.add("hidden");
}

/**
 * Core async API integration:
 *   1. Geocode the city name -> latitude/longitude
 *   2. Fetch current weather for that location
 * Throws descriptive errors for each failure case so the UI can show
 * a friendly message.
 */
async function fetchWeather(city) {
  // ---- Step 1: Geocoding ----
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    city
  )}&count=1&language=en&format=json`;

  const geoResponse = await fetch(geoUrl);

  if (!geoResponse.ok) {
    const err = new Error("Unable to reach the location service. Please try again.");
    err.code = "SERVER_ERROR";
    throw err;
  }

  const geoData = await geoResponse.json();

  if (!geoData.results || geoData.results.length === 0) {
    const err = new Error(
      `Couldn't find a city named "${city}". Please check the spelling and try again.`
    );
    err.code = "CITY_NOT_FOUND";
    throw err;
  }

  const { latitude, longitude, name, country, admin1 } = geoData.results[0];

  // ---- Step 2: Current weather ----
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    const err = new Error("Weather service is currently unavailable. Please try again later.");
    err.code = "SERVER_ERROR";
    throw err;
  }

  const weatherData = await weatherResponse.json();

  if (!weatherData.current_weather) {
    const err = new Error("Weather data is currently unavailable for this location.");
    err.code = "NO_WEATHER_DATA";
    throw err;
  }

  const cw = weatherData.current_weather;

  return {
    city: name,
    region: admin1 || null,
    country: country || null,
    temperature: cw.temperature,
    windspeed: cw.windspeed,
    winddirection: cw.winddirection,
    weathercode: cw.weathercode,
    description: getWeatherDescription(cw.weathercode),
    time: cw.time,
  };
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  // ---- Client-side input validation ----
  if (!city) {
    setStatus("Please enter a city name.", "error");
    hideWeatherCard();
    return;
  }

  if (!/^[a-zA-Z\s\-',.]+$/.test(city)) {
    setStatus("City name can only contain letters, spaces, and basic punctuation.", "error");
    hideWeatherCard();
    return;
  }

  searchBtn.disabled = true;
  hideWeatherCard();
  setStatus("Loading weather data...", "loading");

  try {
    const data = await fetchWeather(city);
    setStatus("", "");
    showWeatherCard(data);
  } catch (err) {
    setStatus(err.message || "Something went wrong. Please try again.", "error");
    hideWeatherCard();
    console.error("Weather fetch error:", err);
  } finally {
    searchBtn.disabled = false;
  }
});
