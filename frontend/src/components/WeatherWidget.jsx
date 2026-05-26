import { useState } from "react";
import kawaiiCloud from "../assets/kawaii-cloud.svg";
import kawaiiMoon from "../assets/kawaii-moon.svg";
import kawaiiSun from "../assets/kawaii-sun.svg";
import { useWeather } from "../hooks/useWeather";

const WEATHER_STICKER = {
  Clear: { icon: kawaiiSun, alt: "Ceo limpo" },
  Clouds: { icon: kawaiiCloud, alt: "Nublado" },
  Rain: { icon: kawaiiCloud, alt: "Chuvoso" },
  Drizzle: { icon: kawaiiCloud, alt: "Garoa" },
  Thunderstorm: { icon: kawaiiCloud, alt: "Trovoada" },
  Snow: { icon: kawaiiCloud, alt: "Neve" },
  Mist: { icon: kawaiiMoon, alt: "Neblina" },
  Fog: { icon: kawaiiMoon, alt: "Nevoeiro" },
};

export default function WeatherWidget() {
  const { weather, city, cep, loading, error, lookupCep } = useWeather();
  const [input, setInput] = useState(cep);
  const [showForm, setShowForm] = useState(!city);

  function handleSubmit(e) {
    e.preventDefault();
    const clean = input.replace(/\D/g, "");
    if (clean.length !== 8) return;
    lookupCep(clean);
    setShowForm(false);
  }

  const weatherMain = weather?.weather?.[0]?.main;
  const weatherVisual = weatherMain ? WEATHER_STICKER[weatherMain] : null;

  return (
    <div className="weather-widget">
      {showForm ? (
        <form onSubmit={handleSubmit} className="weather-form">
          <span className="weather-label">📍 Qual seu CEP?</span>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            className="weather-input"
          />
          <button type="submit" className="weather-btn">
            Ver clima
          </button>
        </form>
      ) : loading ? (
        <span className="weather-loading">Buscando clima...</span>
      ) : error ? (
        <span className="weather-error" onClick={() => setShowForm(true)}>
          {error} Tentar novamente.
        </span>
      ) : weather ? (
        <div
          className="weather-info"
          onClick={() => setShowForm(true)}
          title="Clique para alterar o CEP"
        >
          <span className="weather-emoji" aria-hidden="true">
            {weatherVisual ? (
              <img
                src={weatherVisual.icon}
                alt={weatherVisual.alt}
                className="weather-sticker-icon"
              />
            ) : (
              "🌡️"
            )}
          </span>
          <span className="weather-temp">
            {Math.round(weather.main.temp)}°C
          </span>
          <span className="weather-city">{city}</span>
          <span className="weather-desc">{weather.weather[0].description}</span>
        </div>
      ) : (
        <button
          type="button"
          className="weather-empty"
          onClick={() => setShowForm(true)}
        >
          📍 Definir CEP
        </button>
      )}
    </div>
  );
}
