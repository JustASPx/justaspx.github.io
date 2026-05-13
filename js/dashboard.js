// Theme & Nav (shared)
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.querySelector("i").className = savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon";
themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.querySelector("i").className = next === "dark" ? "fas fa-sun" : "fas fa-moon";
});

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Weather App Logic
const RECENT_KEY = "zakaria_weather_recent";
let currentLat = 28.987, currentLon = -10.057;
let currentCityName = "Guelmim, Maroc";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locateBtn = document.getElementById("locateBtn");
const weatherContent = document.getElementById("weatherContent");
const recentContainer = document.getElementById("recentSearches");

const WMO_CODES = {
  0: { icon: "&#9728;", desc: "Ciel degage" },
  1: { icon: "&#127780;", desc: "Principalement degage" },
  2: { icon: "&#9925;", desc: "Partiellement nuageux" },
  3: { icon: "&#9729;", desc: "Couvert" },
  45: { icon: "&#127787;", desc: "Brouillard" },
  48: { icon: "&#127787;", desc: "Brouillard givrant" },
  51: { icon: "&#127782;", desc: "Bruine legere" },
  53: { icon: "&#127782;", desc: "Bruine moderee" },
  55: { icon: "&#127782;", desc: "Bruine dense" },
  61: { icon: "&#127783;", desc: "Pluie legere" },
  63: { icon: "&#127783;", desc: "Pluie moderee" },
  65: { icon: "&#127783;", desc: "Pluie forte" },
  71: { icon: "&#10052;", desc: "Neige legere" },
  73: { icon: "&#10052;", desc: "Neige moderee" },
  75: { icon: "&#10052;", desc: "Neige forte" },
  95: { icon: "&#9928;", desc: "Orage" },
  96: { icon: "&#9928;", desc: "Orage avec grele" },
  99: { icon: "&#9928;", desc: "Orage violent" }
};

function getWeatherInfo(code) {
  return WMO_CODES[code] || { icon: "&#10067;", desc: "Inconnu" };
}

function formatDay(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date();
  const diff = Math.floor((d - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
  if (diff === 0) return "Aujourd hui";
  if (diff === 1) return "Demain";
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

function showLoading() {
  weatherContent.innerHTML = "<div class=\"loading\"><div class=\"loader\"></div><p>Chargement des donnees meteo...</p></div>";
}

function showError(msg) {
  weatherContent.innerHTML = `<div class="error-box"><i class="fas fa-exclamation-triangle"></i><div><strong>Erreur</strong><p style="margin:0;font-size:0.9rem;">${msg}</p></div></div>`;
}

async function fetchWeather(lat, lon, cityName) {
  showLoading();
  currentLat = lat;
  currentLon = lon;
  currentCityName = cityName;
  addRecentSearch(cityName, lat, lon);

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,pressure_msl,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m&timezone=auto&forecast_days=7`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Meteo indisponible");
    const data = await res.json();
    renderWeather(data, cityName);
  } catch (err) {
    console.error(err);
    showError("Impossible de recuperer les donnees meteo. Verifiez votre connexion ou reessayez plus tard.");
  }
}

function renderWeather(data, cityName) {
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;
  const info = getWeatherInfo(current.weather_code);

  const nowIdx = new Date().getHours();
  const chartLabels = [];
  const chartData = [];
  for (let i = 0; i < 24; i++) {
    const idx = nowIdx + i;
    if (idx < hourly.time.length) {
      const h = new Date(hourly.time[idx]);
      chartLabels.push(h.getHours() + "h");
      chartData.push(hourly.temperature_2m[idx]);
    }
  }

  const html = `
    <div class="weather-main">
      <div class="weather-card">
        <h3>Actuellement</h3>
        <div class="current-weather">
          <div class="weather-icon">${info.icon}</div>
          <div>
            <div class="location"><i class="fas fa-map-marker-alt" style="color:var(--primary);"></i> ${escapeHtml(cityName)}</div>
            <div class="temp">${Math.round(current.temperature_2m)}&deg;</div>
            <div class="desc">${info.desc}</div>
            <div style="margin-top:0.5rem;font-size:0.9rem;color:var(--text-muted);">
              Ressenti ${Math.round(current.apparent_temperature)}&deg; &middot; 
              ${current.is_day ? "Jour" : "Nuit"}
            </div>
          </div>
        </div>
      </div>
      <div class="weather-card">
        <h3>Details</h3>
        <div class="details-grid">
          <div class="detail-item">
            <i class="fas fa-tint"></i>
            <div><strong>${current.relative_humidity_2m}%</strong>Humidite</div>
          </div>
          <div class="detail-item">
            <i class="fas fa-wind"></i>
            <div><strong>${current.wind_speed_10m} km/h</strong>Vent</div>
          </div>
          <div class="detail-item">
            <i class="fas fa-tachometer-alt"></i>
            <div><strong>${current.pressure_msl || "N/A"} hPa</strong>Pression</div>
          </div>
          <div class="detail-item">
            <i class="fas fa-sun"></i>
            <div><strong>${current.uv_index !== undefined ? current.uv_index : "N/A"}</strong>Index UV</div>
          </div>
          <div class="detail-item">
            <i class="fas fa-cloud-rain"></i>
            <div><strong>${current.precipitation} mm</strong>Precipitations</div>
          </div>
          <div class="detail-item">
            <i class="fas fa-eye"></i>
            <div><strong>${data.elevation !== undefined ? data.elevation + " m" : "N/A"}</strong>Altitude</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-container">
      <h3><i class="fas fa-chart-line" style="color:var(--primary);"></i> Temperatures horaires (24h)</h3>
      <canvas id="tempChart"></canvas>
    </div>

    <div class="forecast-section">
      <h3><i class="fas fa-calendar-alt" style="color:var(--primary);"></i> Previsions sur 7 jours</h3>
      <div class="forecast-grid">
        ${daily.time.map((date, i) => {
          const dInfo = getWeatherInfo(daily.weather_code[i]);
          return `
            <div class="forecast-day">
              <div class="day-name">${formatDay(date)}</div>
              <div class="day-icon">${dInfo.icon}</div>
              <div class="day-temps">
                <strong>${Math.round(daily.temperature_2m_max[i])}&deg;</strong> / ${Math.round(daily.temperature_2m_min[i])}&deg;
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">${dInfo.desc}</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  weatherContent.innerHTML = html;
  drawChart(chartLabels, chartData);
}

function drawChart(labels, data) {
  const canvas = document.getElementById("tempChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width, h = rect.height;
  const padding = { top: 30, right: 20, bottom: 40, left: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const min = Math.min(...data) - 2;
  const max = Math.max(...data) + 2;
  const range = max - min;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#e2e8f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartW, y);
    ctx.stroke();
    const val = Math.round(max - (range / 4) * i);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-muted").trim() || "#64748b";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(val + "\u00B0", padding.left - 8, y + 4);
  }

  const stepX = chartW / (data.length - 1);
  const getX = i => padding.left + stepX * i;
  const getY = v => padding.top + chartH - ((v - min) / range) * chartH;

  ctx.beginPath();
  ctx.moveTo(getX(0), getY(data[0]));
  for (let i = 1; i < data.length; i++) {
    const xc = (getX(i - 1) + getX(i)) / 2;
    const yc = (getY(data[i - 1]) + getY(data[i])) / 2;
    ctx.quadraticCurveTo(getX(i - 1), getY(data[i - 1]), xc, yc);
  }
  ctx.lineTo(getX(data.length - 1), getY(data[data.length - 1]));
  ctx.strokeStyle = "#059669";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineTo(getX(data.length - 1), padding.top + chartH);
  ctx.lineTo(getX(0), padding.top + chartH);
  ctx.closePath();
  ctx.fillStyle = "rgba(5,150,105,0.1)";
  ctx.fill();

  data.forEach((val, i) => {
    const x = getX(i), y = getY(val);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#059669";
    ctx.fill();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--surface").trim() || "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text-muted").trim() || "#64748b";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  labels.forEach((lbl, i) => {
    if (i % 3 === 0 || i === labels.length - 1) {
      ctx.fillText(lbl, getX(i), padding.top + chartH + 18);
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function searchCity(query) {
  if (!query.trim()) return;
  showLoading();
  try {
    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=fr&format=json`);
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      showError(`Aucune ville trouvee pour "${escapeHtml(query)}". Verifiez l orthographe.`);
      return;
    }
    const city = data.results[0];
    const name = `${city.name}${city.admin1 ? ", " + city.admin1 : ""}${city.country ? ", " + city.country : ""}`;
    await fetchWeather(city.latitude, city.longitude, name);
  } catch (err) {
    showError("Erreur lors de la recherche. Verifiez votre connexion.");
  }
}

searchBtn.addEventListener("click", () => searchCity(cityInput.value));
cityInput.addEventListener("keypress", (e) => { if (e.key === "Enter") searchCity(cityInput.value); });

locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("La geolocalisation n est pas supportee par votre navigateur.");
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${pos.coords.latitude},${pos.coords.longitude}&count=1&language=fr&format=json`);
        const data = await res.json();
        const name = data.results && data.results[0] ? data.results[0].name : "Ma position";
        await fetchWeather(pos.coords.latitude, pos.coords.longitude, name);
      } catch {
        await fetchWeather(pos.coords.latitude, pos.coords.longitude, "Ma position");
      }
    },
    () => {
      showError("Acces a la localisation refuse. Utilisez la recherche manuelle.");
    }
  );
});

function getRecent() {
  return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
}

function addRecentSearch(name, lat, lon) {
  let recent = getRecent().filter(r => r.name !== name);
  recent.unshift({ name, lat, lon, date: new Date().toISOString() });
  recent = recent.slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  renderRecent();
}

function renderRecent() {
  const recent = getRecent();
  if (recent.length === 0) {
    recentContainer.innerHTML = "";
    return;
  }
  recentContainer.innerHTML = "<span style=\"color:var(--text-muted);font-size:0.85rem;\">Recent :</span> " +
    recent.map(r => `<button data-lat="${r.lat}" data-lon="${r.lon}" data-name="${escapeHtml(r.name)}">${escapeHtml(r.name)}</button>`).join("");
  recentContainer.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      fetchWeather(parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lon), btn.dataset.name);
    });
  });
}

renderRecent();
fetchWeather(currentLat, currentLon, currentCityName);

window.addEventListener("resize", () => {
  const canvas = document.getElementById("tempChart");
  if (canvas) {
    fetchWeather(currentLat, currentLon, currentCityName);
  }
});
