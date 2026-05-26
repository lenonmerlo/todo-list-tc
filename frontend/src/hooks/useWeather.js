import { useEffect, useState } from "react";

const OW_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export function useWeather() {
  const savedCity = localStorage.getItem("user_city");
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(() => savedCity);
  const [cep, setCep] = useState(() => localStorage.getItem("user_cep") || "");
  const [loading, setLoading] = useState(() => Boolean(savedCity));
  const [error, setError] = useState("");

  async function fetchWeatherByCity(cityName) {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName},BR&appid=${OW_KEY}&units=metric&lang=pt_br`,
    );
    if (!res.ok) throw new Error("Clima não encontrado");
    return res.json();
  }

  async function lookupCep(value) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${value}/json/`);
      if (!res.ok) throw new Error("Erro ao consultar CEP");
      const data = await res.json();
      if (data.erro || !data.localidade) throw new Error("CEP não encontrado");

      const cityName = data.localidade;
      setCity(cityName);
      localStorage.setItem("user_cep", value);
      localStorage.setItem("user_city", cityName);
      const w = await fetchWeatherByCity(cityName);
      setWeather(w);
    } catch {
      setError("CEP não encontrado ou clima indisponível.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!savedCity) return;

    fetchWeatherByCity(savedCity)
      .then(setWeather)
      .catch(() => {
        setError(
          "Nao foi possivel carregar o clima. Clique para informar o CEP novamente.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [savedCity]);

  return { weather, city, cep, setCep, loading, error, lookupCep };
}
