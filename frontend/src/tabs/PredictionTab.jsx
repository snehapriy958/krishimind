import { useState } from "react";
import { G } from "../styles/theme";

import { getCropData } from "../data/cropData";
import { getOrderedMandis, MANDIS_BY_STATE } from "../data/mandis";

import { predictPrice } from "../utils/api";
import {
  savePredictionToHistory,
} from "../utils/predictionHistory";
import {
  generateForecast,
  generateMandiBarData,
  transformApiForecasts,
} from "../utils/forecastGenerator";

import QuickPredict from "../components/prediction/QuickPredict";
import PriceSummary from "../components/prediction/PriceSummary";
import MandiComparison from "../components/prediction/MandiComparison";
import MarketSignals from "../components/prediction/MarketSignals";

import SectionTitle from "../components/layout/SectionTitle";
import PriceTrendChart from "../components/charts/PriceTrendChart";
import Card from "../components/common/Card";


// =====================================================
// LOOKUP DISTRICT FROM SELECTED MANDI
// =====================================================

const getDistrict = (mandiName, state) => {
  const list = MANDIS_BY_STATE[state] || [];

  const found = list.find(
    (m) => m.name === mandiName
  );

  return found?.district || mandiName.split(" ")[0];
};

const formatHistoryDate = (value) => {
  const date = value ? new Date(`${value}T00:00:00`) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
};


// =====================================================
// COMPONENT
// =====================================================

export default function PredictionTab({
  profile,
  activeCrop,
}) {

  const [predicted, setPredicted] = useState(false);

  const [result, setResult] = useState(null);

  const [apiData, setApiData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [apiError, setApiError] = useState(null);

  // A prediction belongs to the crop that created it.
  // When the user changes crops, stale prediction data is ignored
  // without calling setState from an effect.
  const activeResult =
    result?.cropId === activeCrop.id
      ? result
      : null;

  const hasActivePrediction =
    predicted &&
    activeResult &&
    apiData;


  // =====================================================
  // CROP + MANDI DATA
  // =====================================================

  const cdata = getCropData(activeCrop.id);

  const myMandis = getOrderedMandis(
    profile.mandi,
    profile.state
  );


  // =====================================================
  // RUN REAL BACKEND PREDICTION
  // =====================================================

  const handlePredict = async ({
    mandi,
    mandiIdx,
    days,
  }) => {

    setLoading(true);

    setApiError(null);

    setApiData(null);

    setPredicted(false);


    try {

      const district = getDistrict(
        mandi,
        profile.state
      );


      const data = await predictPrice({

        crop: activeCrop.id,

        market: mandi,

        state: profile.state,

        district,

        days_ahead: days,

        include_sentiment: true,

        include_weather: true,

      });


      console.log(
        "KrishiMind prediction response:",
        data
      );

      // Save only after the real backend prediction succeeds.
      // A newly created prediction does not have an actual price yet,
      // so it is stored as active and pending evaluation.
      try {
        savePredictionToHistory({
          date: formatHistoryDate(data.prediction_date),
          crop: `${activeCrop.emoji} ${activeCrop.label}`,
          cropId: activeCrop.id,
          mandi,
          days,
          predicted: Number(data.predicted_price_inr ?? 0),
          actual: null,
          accuracy: null,
          confidence: Number(data.confidence_score ?? 0),
          mape: Number(data.mape_score ?? 0),
          adv: data.advisory_action ?? "WAIT",
          status: "active",
        });
      } catch (historyError) {
        // History persistence must not make a successful prediction fail.
        console.error(
          "Unable to save prediction history:",
          historyError
        );
      }

      setApiData(data);


      setResult({
        cropId: activeCrop.id,
        mandi,
        mandiIdx,
        days,
      });


      setPredicted(true);

    } catch (error) {

      console.error(
        "Prediction API error:",
        error
      );


      setApiError(
        error.message ||
        "Unable to connect to the prediction API."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // FORECAST CHART DATA
  // =====================================================

  const currentPrice =
    Number(
      apiData?.current_price_inr ??
      cdata.base ??
      0
    );

  const predictedPrice =
    Number(
      apiData?.predicted_price_inr ??
      cdata.pred ??
      currentPrice
    );

  const backendForecast =
    Array.isArray(apiData?.daily_forecast)
      ? apiData.daily_forecast
      : [];


  const forecastData =
    backendForecast.length > 0

      ? transformApiForecasts(
          backendForecast
        )

      : activeResult

        ? generateForecast(
            currentPrice,
            predictedPrice,
            activeResult.days
          )

        : [];
    
  console.log(
  "Daily forecast from backend:",
  backendForecast
);

console.log(
  "Forecast data sent to chart:",
  forecastData
);


  // =====================================================
  // MANDI COMPARISON DATA
  // =====================================================

  const barData = activeResult
    ? generateMandiBarData(
        myMandis,
        apiData?.current_price_inr ?? cdata.base,
        apiData?.predicted_price_inr ?? cdata.pred,
        activeResult.mandi
      )
    : [];


  // =====================================================
  // SUMMARY DATA
  // =====================================================

  const displayData = hasActivePrediction

    ? {

        base:
          apiData.current_price_inr,

        pred:
          apiData.predicted_price_inr,

        conf:
          apiData.confidence_score,

        pct:
          apiData.price_change_pct,

        adv:
          apiData.advisory_action,

        mape:
          apiData.mape_score,

      }

    : cdata;


  // =====================================================
  // SAFE PERCENTAGE
  // =====================================================

  const pct = Number(
    displayData?.pct ?? 0
  );


  const pctDisplay =
    Math.abs(pct).toFixed(2);


  const trendSymbol =

    pct > 0

      ? "▲"

      : pct < 0

        ? "▼"

        : "●";


  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >


      {/* ============================================= */}
      {/* PREDICTION INPUT */}
      {/* ============================================= */}

      <QuickPredict

        myMandis={myMandis}

        cdata={cdata}

        cropEmoji={activeCrop.emoji}

        cropLabel={activeCrop.label}

        onPredict={handlePredict}

      />


      {/* ============================================= */}
      {/* LOADING */}
      {/* ============================================= */}

      {loading && (

        <Card
          style={{
            textAlign: "center",
            padding: "32px 24px",
          }}
        >

          <div
            style={{
              fontSize: 36,
              marginBottom: 10,
            }}
          >
            ⏳
          </div>


          <div
            style={{
              color: G.green,
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            Running LSTM model…
          </div>


          <div
            style={{
              fontSize: 11,
              color: G.muted,
              marginTop: 6,
            }}
          >
            Loading ML model prediction · weather · market sentiment
          </div>

        </Card>

      )}


      {/* ============================================= */}
      {/* API ERROR */}
      {/* ============================================= */}

      {apiError && !loading && (

        <Card
          style={{
            background:
              "rgba(180, 40, 40, 0.05)",

            border:
              "1px solid rgba(180, 40, 40, 0.2)",

            padding: "14px 16px",
          }}
        >

          <div
            style={{
              fontWeight: 700,
              marginBottom: 4,
            }}
          >
            Prediction service unavailable
          </div>


          <div
            style={{
              fontSize: 12,
              color: G.muted,
            }}
          >
            {apiError}
          </div>

        </Card>

      )}


      {/* ============================================= */}
      {/* PREDICTION RESULTS */}
      {/* ============================================= */}

      {hasActivePrediction &&
        !loading && (

        <>


          {/* ========================================= */}
          {/* KEY SUMMARY */}
          {/* ========================================= */}

          <div className="fu s1">

            <SectionTitle>
              Key Price Summary
            </SectionTitle>


            <PriceSummary

              cdata={displayData}

              days={activeResult.days}

            />

          </div>


          {/* ========================================= */}
          {/* PRICE TREND */}
          {/* ========================================= */}

          <div className="fu s2">

            <SectionTitle

              right={`${trendSymbol}${pctDisplay}%`}

            >

              Price Trend Chart · LSTM Forecast

            </SectionTitle>


            <Card>

              <PriceTrendChart

                data={forecastData}

                base={displayData.base}

                pred={displayData.pred}

                days={activeResult.days}

                cropName={
                  `${activeCrop.emoji} ${activeCrop.label}`
                }

                mandiName={activeResult.mandi}

              />

            </Card>

          </div>


          {/* ========================================= */}
          {/* MODEL INFORMATION */}
          {/* ========================================= */}

          <Card>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                fontSize: 12,
              }}
            >

              <div>

                <div
                  style={{
                    color: G.muted,
                    fontSize: 10,
                  }}
                >
                  MODEL
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    color: G.green,
                    marginTop: 3,
                  }}
                >
                  {apiData.model_used}
                </div>

              </div>


              <div>

                <div
                  style={{
                    color: G.muted,
                    fontSize: 10,
                  }}
                >
                  CONFIDENCE
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    marginTop: 3,
                  }}
                >
                  {apiData.confidence_score}%
                </div>

              </div>


              <div>

                <div
                  style={{
                    color: G.muted,
                    fontSize: 10,
                  }}
                >
                  MAPE
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    marginTop: 3,
                  }}
                >
                  {apiData.mape_score}%
                </div>

              </div>


              <div>

                <div
                  style={{
                    color: G.muted,
                    fontSize: 10,
                  }}
                >
                  ACTION
                </div>

                <div
                  style={{
                    fontWeight: 700,
                    marginTop: 3,
                    color: G.green,
                  }}
                >
                  {apiData.advisory_action}
                </div>

              </div>

            </div>

          </Card>


          {/* ========================================= */}
          {/* SENTIMENT + WEATHER */}
          {/* ========================================= */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",

              gap: 14,
            }}
          >


            <Card>

              <SectionTitle>
                Market Sentiment
              </SectionTitle>


              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {apiData.sentiment_label}
              </div>


              <div
                style={{
                  fontSize: 12,
                  color: G.muted,
                  lineHeight: 1.6,
                }}
              >
                {apiData.sentiment_reason}
              </div>

            </Card>


            <Card>

              <SectionTitle>
                Weather Impact
              </SectionTitle>


              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {apiData.weather_condition}
              </div>


              <div
                style={{
                  fontSize: 12,
                  color: G.muted,
                  lineHeight: 1.6,
                }}
              >
                {apiData.weather_impact}
              </div>

            </Card>


          </div>


          {/* ========================================= */}
          {/* WAREHOUSE */}
          {/* ========================================= */}

          {apiData.warehouse_advisory && (

            <div className="fu s3">

              <SectionTitle>
                Warehouse Advisory
              </SectionTitle>


              <Card
                style={{
                  background:
                    "rgba(27,107,53,0.03)",
                }}
              >

                <div
                  style={{
                    fontWeight: 700,
                    color: G.green,
                    marginBottom: 6,
                  }}
                >
                  {
                    apiData.warehouse_advisory.action
                  }
                </div>


                <div
                  style={{
                    fontSize: 12,
                    color: G.muted,
                    marginBottom: 8,
                  }}
                >
                  {
                    apiData.warehouse_advisory.reason
                  }
                </div>

              </Card>

            </div>

          )}


          {/* ========================================= */}
          {/* HINDI SUMMARY */}
          {/* ========================================= */}

          {apiData.hindi_summary && (

            <div

              className="fu s3"

              style={{

                background:
                  G.light,

                border:
                  `1px solid ${G.bdr}`,

                borderRadius: 12,

                padding:
                  "12px 16px",

                fontSize: 13,

                color:
                  G.green,

                fontWeight: 600,

              }}

            >

              🇮🇳 {apiData.hindi_summary}

            </div>

          )}


          {/* ========================================= */}
          {/* MANDI COMPARISON */}
          {/* ========================================= */}

          <div className="fu s4">

            <MandiComparison
              barData={barData}
              bestMandi={myMandis[0]}
              selectedMandi={activeResult.mandi}
            />

          </div>


          {/* ========================================= */}
          {/* MARKET SIGNALS */}
          {/* ========================================= */}

          <div className="fu s5">

            <MarketSignals />

          </div>


        </>

      )}


      {/* ============================================= */}
      {/* INITIAL STATE */}
      {/* ============================================= */}

      {!hasActivePrediction &&
        !loading &&
        !apiError && (

        <Card
          style={{
            textAlign: "center",
            padding: "44px 24px",
          }}
        >

          <div
            style={{
              fontSize: 42,
              marginBottom: 10,
            }}
          >
            🌾
          </div>


          <div

            style={{

              fontFamily:
                "'Playfair Display', serif",

              fontSize:
                18,

              fontWeight:
                700,

              color:
                G.green,

              marginBottom:
                7,

            }}

          >

            Namaste, {profile.name.split(" ")[0]}!

          </div>


          <div

            style={{

              fontSize:
                12,

              color:
                G.muted,

              maxWidth:
                380,

              margin:
                "0 auto",

              lineHeight:
                1.7,

            }}

          >

            Select mandi and forecast period above to run
            an AI-powered crop price prediction.

          </div>

        </Card>

      )}


    </div>

  );

}