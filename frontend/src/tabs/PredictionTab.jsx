import { useState, useEffect } from "react";
import { G } from "../styles/theme";
import { getCropData } from "../data/cropData";
import { getOrderedMandis, MANDIS_BY_STATE } from "../data/mandis";
import { predictPrice } from "../utils/api";
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


// Lookup district from mandi
const getDistrict = (mandiName, state) => {
  const list = MANDIS_BY_STATE[state] || [];
  const found = list.find((m) => m.name === mandiName);
  return found?.district || mandiName.split(" ")[0];
};


export default function PredictionTab({ profile, activeCrop }) {

  const [predicted, setPredicted] = useState(false);
  const [result, setResult] = useState(null);
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const cdata = getCropData(activeCrop.id);
  const myMandis = getOrderedMandis(profile.mandi, profile.state);


  // Reset when crop changes
  useEffect(() => {
    setPredicted(false);
    setResult(null);
    setApiData(null);
    setApiError(null);
  }, [activeCrop.id]);


  const handlePredict = async ({ mandi, mandiIdx, days }) => {

    setLoading(true);
    setApiError(null);
    setApiData(null);

    try {

      const district = getDistrict(mandi, profile.state);

      const data = await predictPrice({
        crop: activeCrop.id,
        market: mandi,
        state: profile.state,
        district: district,
        days_ahead: days,
        include_sentiment: true,
        include_weather: true,
      });

      setApiData(data);

    } catch (e) {

      setApiError(`Backend unavailable — showing mock data. (${e.message})`);

    } finally {

      setResult({ mandi, mandiIdx, days });
      setPredicted(true);
      setLoading(false);
    }
  };


  /*
  Chart data
  Prefer backend forecast.
  Only use mock if API fails.
  */

  const forecastData = apiData
    ? transformApiForecasts(apiData.daily_forecast)
    : result
    ? generateForecast(cdata.base, cdata.pred, result.days)
    : [];


  /*
  Mandi comparison bars
  */

  const barData = result
    ? generateMandiBarData(
        myMandis,
        apiData?.current_price_inr || cdata.base,
        apiData?.predicted_price_inr || cdata.pred
      )
    : [];


  /*
  Summary values
  */

  const displayData = apiData
    ? {
        base: apiData.current_price_inr,
        pred: apiData.predicted_price_inr,
        conf: apiData.confidence_score,
        pct: apiData.price_change_pct,
        adv: apiData.advisory_action,
      }
    : cdata;


  const pctDisplay = Math.abs(displayData.pct).toFixed(2);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      <QuickPredict
        myMandis={myMandis}
        cdata={cdata}
        cropEmoji={activeCrop.emoji}
        cropLabel={activeCrop.label}
        onPredict={handlePredict}
      />


      {loading && (
        <Card style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>⏳</div>

          <div style={{ color: G.green, fontWeight: 700, fontSize: 15 }}>
            Running LSTM model…
          </div>

          <div style={{ fontSize: 11, color: G.muted, marginTop: 6 }}>
            Fetching weather · news · warehouse data
          </div>
        </Card>
      )}


      {apiError && !loading && (
        <div
          style={{
            background: "rgba(184,120,10,0.09)",
            border: "1px solid rgba(184,120,10,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 11,
            color: "#B8780A",
          }}
        >
          ⚠ {apiError}
        </div>
      )}


      {predicted && result && !loading && (
        <>

          <div className="fu s1">
            <SectionTitle>Key Price Summary</SectionTitle>

            <PriceSummary cdata={displayData} days={result.days} />
          </div>


          <div className="fu s2">

            <SectionTitle
              right={`${displayData.pct > 0 ? "▲" : "▼"}${pctDisplay}%`}
            >
              Price Trend Chart · LSTM Forecast
            </SectionTitle>

            <Card>
              <PriceTrendChart
                data={forecastData}
                base={displayData.base}
                pred={displayData.pred}
                days={result.days}
                cropName={`${activeCrop.emoji} ${activeCrop.label}`}
                mandiName={result.mandi}
              />
            </Card>

          </div>


          {apiData?.warehouse_advisory && (
            <div className="fu s3">

              <SectionTitle>🏪 Warehouse Advisory</SectionTitle>

              <Card style={{ background: "rgba(27,107,53,0.03)" }}>

                <div style={{ fontWeight: 700, color: G.green, marginBottom: 6 }}>
                  {apiData.warehouse_advisory.action}
                </div>

                <div style={{ fontSize: 12, color: G.muted, marginBottom: 8 }}>
                  {apiData.warehouse_advisory.reason}
                </div>

              </Card>
            </div>
          )}


          {apiData?.hindi_summary && (
            <div
              className="fu s3"
              style={{
                background: G.light,
                border: `1px solid ${G.bdr}`,
                borderRadius: 12,
                padding: "12px 16px",
                fontSize: 13,
                color: G.green,
                fontWeight: 600,
              }}
            >
              🇮🇳 {apiData.hindi_summary}
            </div>
          )}


          <div className="fu s4">
            <MandiComparison barData={barData} bestMandi={myMandis[0]} />
          </div>


          <div className="fu s5">
            <MarketSignals />
          </div>

        </>
      )}


      {!predicted && !loading && (
        <Card style={{ textAlign: "center", padding: "44px 24px" }}>

          <div style={{ fontSize: 42, marginBottom: 10 }}>🌾</div>

          <div
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 18,
              fontWeight: 700,
              color: G.green,
              marginBottom: 7,
            }}
          >
            Namaste, {profile.name.split(" ")[0]}!
          </div>

          <div
            style={{
              fontSize: 12,
              color: G.muted,
              maxWidth: 380,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Select mandi and forecast period above to run prediction.
          </div>

        </Card>
      )}

    </div>
  );
}