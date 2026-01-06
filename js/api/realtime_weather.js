const API_KEY = '7783b3d74dee407bb4941150252612';
const API_BASE_URL = 'https://api.weatherapi.com/v1';
const API_CURRENT_WEATHER = '/current.json';
const CACHE_KEY = 'weather-data';
const CACHE_TTL = 60 * 60 * 1000;
const LOCATION = 'Vancouver';

async function fetchWeatherData() {
    const apiKey = 'key=' + API_KEY;
    const queryString = 'q=' + LOCATION + '&aqi=no';
    const queryParams = '?' + apiKey + '&' + queryString;
    const res = await fetch(API_BASE_URL + API_CURRENT_WEATHER + queryParams);

    if (!res.ok) {
        throw new Error("API Server Error");
    }

    return res.json();
}

async function getWeather() {
    const cachedWeatherData = localStorage.getItem(CACHE_KEY);

    if (cachedWeatherData) {
        const { data, timestamp } = JSON.parse(cachedWeatherData);
        if (Date.now() - timestamp < CACHE_TTL) {
            return data;
        }
    }

    const data = await fetchWeatherData();
    localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() })
    );

    return data;
}

export { getWeather };