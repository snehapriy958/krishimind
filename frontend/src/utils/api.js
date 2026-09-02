const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const apiFetch = async (path, options = {}) => {

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {

    const res = await fetch(`${BASE}${path}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API error ${res.status}`);
    }

    return res.json();

  } finally {
    clearTimeout(timeout);
  }

};

// POST /predict
export const predictPrice = (body) =>
  apiFetch("/predict", { method: "POST", body: JSON.stringify(body) });

// GET /news/{crop}
export const fetchNewsSentiment = (crop) =>
  apiFetch(`/news/${crop.toLowerCase()}`);

// GET /weather/{state}
export const fetchWeather = (state) =>
  apiFetch(`/weather/${encodeURIComponent(state)}`);

// POST /chat
export const sendChatMessage = (body) =>
  apiFetch("/chat", { method: "POST", body: JSON.stringify(body) });