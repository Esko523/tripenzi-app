"use client";

import React, { useState, useEffect } from 'react';

// --- IKONY ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c0-1.7-1.3-3-3-3h-11a4 4 0 0 1-3.8-2.7 4 4 0 0 1 1.6-4.8 5 5 0 0 1 6.6 0 3 3 0 0 1 1.6 2.5 5 5 0 0 1 8.6 3.2c0 2.7-2.1 4.8-4.8 4.8Z"/></svg>;
const RainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/></svg>;
const SnowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10 14-4.24 2.83"/><path d="m14 14 4.24 2.83"/><path d="M10 10 5.76 7.17"/><path d="M14 10l4.24-2.83"/><path d="M12 22v-6.5"/><path d="M12 8.5V2"/></svg>;

interface WeatherProps {
  city?: string;
}

export default function WeatherWidget({ city }: WeatherProps) {
  const [temp, setTemp] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number | null>(null);
  const [foundName, setFoundName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!city) return;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        // Geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=cz&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) return;

        const { latitude, longitude, name, country_code } = geoData.results[0]; 
        
        if (country_code) {
            setFoundName(`${name}, ${country_code}`);
        } else {
            setFoundName(name);
        }

        // Weather data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code`);
        const weatherData = await weatherRes.json();

        setTemp(weatherData.current.temperature_2m);
        setWeatherCode(weatherData.current.weather_code);
      } catch (err) {
        console.error("Chyba počasí", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  if (!city || temp === null) return null;

  const getWeatherIcon = (code: number) => {
    if (code <= 1) return <SunIcon />;
    if (code <= 48) return <CloudIcon />;
    if (code <= 67) return <RainIcon />;
    if (code <= 77) return <SnowIcon />;
    if (code <= 82) return <RainIcon />;
    if (code <= 86) return <SnowIcon />;
    return <RainIcon />;
  };

  // ZDE JSME ZMĚNILI rounded-lg NA rounded-xl PRO VÍCE HRANATÝ DESIGN
  return (
    <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold border border-white/10 flex items-center gap-2 text-white shadow-sm animate-in fade-in select-none">
      {getWeatherIcon(weatherCode || 0)}
      <span>{temp.toFixed(1)}°C</span>
      <span className="w-0.5 h-3 bg-white/30 rounded-full"></span>
      <span className="opacity-90 truncate max-w-[100px] sm:max-w-none">{foundName}</span>
    </div>
  );
}