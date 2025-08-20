"use client";
import React, { useEffect, useState } from "react";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_KEY || "";

function getWeatherIcon(icon: string) {
  return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

export default function WeatherWidget({ city: cityProp = "London", accentColor = "#3b82f6" }: { city?: string; accentColor?: string }) {
  const [city, setCity] = useState(cityProp);
  const [inputCity, setInputCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setCity(cityProp);
  }, [cityProp]);

  useEffect(() => {
    fetchWeather(city);
    // eslint-disable-next-line
  }, [city]);

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
    } catch (e: any) {
      setError(e.message);
      setWeather(null);
    }
    setLoading(false);
  };

  const handleCityChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim()) {
      setCity(inputCity.trim());
      setInputCity("");
    }
  };

  return (
    <section className="col-span-1 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow p-6 flex flex-col items-center">
      <form onSubmit={handleCityChange} className="mb-2 flex gap-2 w-full justify-center">
        <input
          className="rounded px-2 py-1 border border-gray-200 dark:border-gray-700 bg-transparent text-center w-32"
          placeholder="City..."
          value={inputCity}
          onChange={e => setInputCity(e.target.value)}
        />
        <button className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" type="submit">Set</button>
      </form>
      {loading ? (
        <div className="text-gray-400 py-4">Loading weather...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : weather ? (
        <>
          <div className="text-2xl font-bold mb-1" style={{ color: accentColor }}>{Math.round(weather.main.temp)}°C</div>
          <div className="text-sm text-gray-500 mb-2">{weather.name}, {weather.sys.country}</div>
          <div className="flex items-center gap-2" style={{ color: accentColor }}>
            <img src={getWeatherIcon(weather.weather[0].icon)} alt="icon" className="w-8 h-8" />
            <span>{weather.weather[0].main}</span>
          </div>
        </>
      ) : null}
    </section>
  );
} 