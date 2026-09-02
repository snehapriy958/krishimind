const STORAGE_KEY = "krishimind_prediction_history";

// =====================================================
// GET PREDICTION HISTORY
// =====================================================

export const getPredictionHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const history = JSON.parse(stored);

    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Unable to read prediction history:", error);

    return [];
  }
};


// =====================================================
// SAVE NEW PREDICTION
// =====================================================

export const savePredictionToHistory = (prediction) => {
  try {
    const history = getPredictionHistory();

    // Accuracy should only exist when an actual/current
    // market price is available.
    const accuracyValue =
      prediction.accuracy ??
      prediction.confidence ??
      null;

    const newPrediction = {
      id:
        prediction.id ||
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`,

      date:
        prediction.date ||
        new Date().toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),

      crop: prediction.crop || "Unknown",

      cropId: prediction.cropId || "",

      mandi: prediction.mandi || "Unknown",

      days: Number(prediction.days || 0),

      // Predicted price
      predicted:
        prediction.predicted !== null &&
        prediction.predicted !== undefined
          ? Number(prediction.predicted)
          : null,

      // Actual/current market price.
      // This will normally be null for a newly created prediction.
      actual:
        prediction.actual !== null &&
        prediction.actual !== undefined
          ? Number(prediction.actual)
          : null,

      // Keep accuracy null until a real value exists.
      accuracy:
        accuracyValue !== null &&
        accuracyValue !== undefined
          ? Number(accuracyValue)
          : null,

      confidence:
        prediction.confidence !== null &&
        prediction.confidence !== undefined
          ? Number(prediction.confidence)
          : null,

      mape:
        prediction.mape !== null &&
        prediction.mape !== undefined
          ? Number(prediction.mape)
          : null,

      adv: prediction.adv || "WAIT",

      status: prediction.status || "active",

      createdAt: new Date().toISOString(),
    };

    // Newest prediction appears first.
    const updatedHistory = [
      newPrediction,
      ...history,
    ];

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    return newPrediction;

  } catch (error) {
    console.error(
      "Unable to save prediction history:",
      error
    );

    return null;
  }
};


// =====================================================
// UPDATE PREDICTION
// =====================================================

export const updatePredictionHistory = (
  id,
  updates
) => {
  try {
    const history = getPredictionHistory();

    const updatedHistory = history.map((item) =>
      item.id === id
        ? {
            ...item,
            ...updates,
          }
        : item
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    return (
      updatedHistory.find(
        (item) => item.id === id
      ) || null
    );

  } catch (error) {
    console.error(
      "Unable to update prediction history:",
      error
    );

    return null;
  }
};


// =====================================================
// DELETE PREDICTION
// =====================================================

export const deletePredictionFromHistory = (
  id
) => {
  try {
    const history = getPredictionHistory();

    const updatedHistory = history.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    return updatedHistory;

  } catch (error) {
    console.error(
      "Unable to delete prediction history:",
      error
    );

    return [];
  }
};


// =====================================================
// CLEAR ALL HISTORY
// =====================================================

export const clearPredictionHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error(
      "Unable to clear prediction history:",
      error
    );
  }
};