const BASE = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8002"
).replace(/\/$/, "");


const apiFetch = async (path, options = {}) => {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {
    const response = await fetch(`${BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        detail: response.statusText,
      }));

      throw new Error(
        errorData.detail || `API error ${response.status}`
      );
    }

    return await response.json();

  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Request timed out. The prediction service took too long to respond."
      );
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
};


// =====================================================
// POST /predict
// =====================================================

export const predictPrice = (body) =>
  apiFetch("/predict", {
    method: "POST",
    body: JSON.stringify(body),
  });


// =====================================================
// GET /news/{crop}
// =====================================================

export const fetchNewsSentiment = (crop) =>
  apiFetch(`/news/${encodeURIComponent(crop.toLowerCase())}`);


// =====================================================
// GET /weather/{state}
// =====================================================

export const fetchWeather = (state) =>
  apiFetch(`/weather/${encodeURIComponent(state)}`);


// =====================================================
// POST /chat
// =====================================================

export const sendChatMessage = (body) =>
  apiFetch("/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });