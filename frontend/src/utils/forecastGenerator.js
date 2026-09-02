// frontend/src/utils/forecastGenerator.js

/**
 * generateForecast — mock fallback used when backend is unreachable.
 */
export const generateForecast = (base, pred, days) =>
  Array.from({ length: days }, (_, i) => ({
    day:   i === 0 ? "Now" : `D${i + 1}`,
    price: +(base + (i * (pred - base)) / days + Math.sin(i * 0.4) * 0.7).toFixed(2),
    upper: +(base + (i * (pred - base)) / days + 1.8 + Math.sin(i * 0.4) * 0.7).toFixed(2),
    lower: +(base + (i * (pred - base)) / days - 1.4 + Math.sin(i * 0.4) * 0.7).toFixed(2),
  }));

/**
 * generateMandiBarData — mock fallback for mandi comparison chart.
 */
export const generateMandiBarData = (mandiNames, base, pred) =>
  mandiNames.slice(0, 4).map((name, i) => ({
    name:      name.split(" ")[0],
    today:     Math.round(base - i * 40),
    predicted: Math.round(pred - i * 50),
  }));

/**
 * transformApiForecasts — converts real API daily_forecast into chart format.
 * Used when backend responds successfully.
 */
export const transformApiForecasts = (dailyForecast) =>
  dailyForecast.map((d, i) => ({
    day:   i === 0 ? "Now" : `D${i + 1}`,
    price: d.predicted_price,
    upper: d.upper_bound,
    lower: d.lower_bound,
  }));