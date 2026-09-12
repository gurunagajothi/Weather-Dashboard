/**
 * Weather Dashboard - Frontend Logic
 * ------------------------------------
 * Handles:
 *   - Form submission (search by city)
 *   - Async fetch call to our own backend (/api/weather)
 *   - Loading state while waiting for the response
 *   - Displaying weather data on success
 *   - Displaying friendly error messages on failure
 *     (empty input, invalid characters, city not found, server/network errors)
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

async function fetchWeather(city) {
  const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
  const data = await response.json();

  if (!response.ok) {
    // Backend sends a structured error object: { error, message }
    const error = new Error(data.message || "Something went wrong.");
    error.code = data.error;
    throw error;
  }

  return data;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const city = cityInput.value.trim();

  // ---- Client-side validation (fast feedback before hitting the network) ----
  if (!city) {
    setStatus("Please enter a city name.", "error");
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
    // Network failure (fetch itself throws) vs backend structured error
    if (err.code) {
      setStatus(err.message, "error");
    } else {
      setStatus(
        "Unable to reach the server. Please check your connection and try again.",
        "error"
      );
    }
    hideWeatherCard();
    console.error("Weather fetch error:", err);
  } finally {
    searchBtn.disabled = false;
  }
});
