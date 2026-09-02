/**
 * Returns a finite number only for actual numeric values.
 *
 * Prevents:
 * Number(null) === 0
 * Number("") === 0
 *
 * Missing API values must not become ₹0.
 */
const toFiniteNumber = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};


/**
 * generateForecast
 *
 * Mock fallback used only when the backend
 * prediction API is unavailable.
 */
export const generateForecast = (
  base,
  pred,
  days
) => {
  const safeBase =
    toFiniteNumber(base) ?? 0;

  const safePred =
    toFiniteNumber(pred) ?? safeBase;

  return Array.from(
    { length: days },
    (_, index) => {
      const progress =
        days > 1
          ? index / (days - 1)
          : 1;

      const price =
        safeBase +
        (safePred - safeBase) * progress +
        Math.sin(index * 0.4) * 0.7;

      return {
        day:
          index === 0
            ? "Now"
            : `D${index}`,

        price:
          Number(price.toFixed(2)),

        upper:
          Number(
            (price + 1.8).toFixed(2)
          ),

        lower:
          Number(
            (price - 1.4).toFixed(2)
          ),
      };
    }
  );
};


/**
 * generateMandiBarData
 *
 * Selected mandi uses real backend values.
 *
 * Other mandis are comparison estimates until
 * separate predictions are available.
 */
export const generateMandiBarData = (
  mandiNames = [],
  base,
  pred,
  selectedMandi
) => {
  const safeBase =
    toFiniteNumber(base) ?? 0;

  const safePred =
    toFiniteNumber(pred) ?? safeBase;

  /*
   * Put selected mandi first.
   */
  const orderedMandis = [
    selectedMandi,
    ...mandiNames.filter(
      (mandi) =>
        mandi &&
        mandi !== selectedMandi
    ),
  ].filter(Boolean);

  return orderedMandis
    .slice(0, 4)
    .map(
      (fullName, index) => {
        const isSelected =
          fullName === selectedMandi;

        const today =
          isSelected
            ? safeBase
            : safeBase - index * 40;

        const predicted =
          isSelected
            ? safePred
            : safePred - index * 50;

        return {
          name:
            String(fullName)
              .replace(" APMC", "")
              .split(" ")[0],

          /*
           * Used for exact selected mandi matching.
           */
          fullName,

          today:
            Math.round(today),

          predicted:
            Math.round(predicted),
        };
      }
    );
};


/**
 * transformApiForecasts
 *
 * Converts backend forecast response:
 *
 * {
 *   date,
 *   predicted_price,
 *   lower_bound,
 *   upper_bound
 * }
 *
 * Into PriceTrendChart format:
 *
 * {
 *   day,
 *   date,
 *   price,
 *   upper,
 *   lower
 * }
 */
export const transformApiForecasts = (
  dailyForecast = []
) => {
  if (!Array.isArray(dailyForecast)) {
    return [];
  }

  return dailyForecast
    .map(
      (item, index) => {
        if (!item) {
          return null;
        }

        const predictedPrice =
          toFiniteNumber(
            item.predicted_price
          );

        /*
         * Skip invalid forecast records.
         */
        if (predictedPrice === null) {
          return null;
        }

        const apiUpper =
          toFiniteNumber(
            item.upper_bound
          );

        const apiLower =
          toFiniteNumber(
            item.lower_bound
          );

        /*
         * Use API confidence bounds when available.
         * Otherwise create fallback bounds.
         */
        const upper =
          apiUpper !== null
            ? apiUpper
            : predictedPrice * 1.02;

        const lower =
          apiLower !== null
            ? apiLower
            : predictedPrice * 0.98;

        return {
          day:
            index === 0
              ? "Now"
              : `D${index}`,

          date:
            item.date || null,

          price:
            Number(
              predictedPrice.toFixed(2)
            ),

          upper:
            Number(
              upper.toFixed(2)
            ),

          lower:
            Number(
              lower.toFixed(2)
            ),
        };
      }
    )
    .filter(Boolean);
};