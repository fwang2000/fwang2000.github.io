import { WEATHER_CODES } from "./enums/weather_codes.js";
import { WEATHER_TYPE } from "./enums/weather_type.js";
import { getWeather } from "./api/realtime_weather.js";

const WEATHER_CODE_TO_TYPE = [
    { code: WEATHER_CODES.SUNNY, type: WEATHER_TYPE.SUNNY },
    { code: WEATHER_CODES.RAINY, type: WEATHER_TYPE.RAINY },
    { code: WEATHER_CODES.CLOUDY, type: WEATHER_TYPE.CLOUDY },
    { code: WEATHER_CODES.SNOWY, type: WEATHER_TYPE.SNOWY },
]

function mapConditionToWeatherType(data) {
    const currentWeather = data.current;
    if (!currentWeather.is_day) {
        return WEATHER_TYPE.NIGHT;
    } else {
        let currentWeatherCode = currentWeather.condition.code;
        console.log("Current Weather Code: ", currentWeatherCode);
        return WEATHER_CODE_TO_TYPE.find(entry => entry.code.includes(currentWeatherCode))?.type ?? WEATHER_TYPE.CLOUDY;
    }
}

// True once the visitor manually selects a theme, so the async weather
// result (which resolves later) won't clobber their choice.
let userPickedTheme = false;

function applyTheme(weatherType) {
    document.body.setAttribute("data-theme", weatherType);
    markActiveTheme(weatherType);
}

// Marks the option matching the active theme with a checkmark. No-op until
// the picker markup exists (weather may resolve before the partial injects).
function markActiveTheme(theme) {
    document.querySelectorAll(".theme-option").forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.themeValue === theme);
    });
}

function setTheme() {

    let weatherType;

    getWeather().then(data => {
        weatherType = mapConditionToWeatherType(data);
        if (!userPickedTheme) {
            applyTheme(weatherType);
        }
    }).catch(err => {
        console.log(err);
        weatherType = WEATHER_TYPE.CLOUDY;
    });
}

function initThemePicker() {
    const toggle = document.getElementById("theme-toggle");
    const options = document.getElementById("theme-options");
    const modifier = document.getElementById("theme-modifier");
    if (!toggle || !options || !modifier) return;

    const setOpen = (open) => {
        toggle.setAttribute("aria-expanded", String(open));
    };

    toggle.addEventListener("click", () => {
        setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    options.querySelectorAll(".theme-option").forEach((btn) => {
        btn.addEventListener("click", () => {
            userPickedTheme = true;
            applyTheme(btn.dataset.themeValue);
            setOpen(false);
        });
    });

    // Close when clicking anywhere outside the modifier.
    document.addEventListener("click", (e) => {
        if (!modifier.contains(e.target)) {
            setOpen(false);
        }
    });

    // Reflect whatever theme is already applied (e.g. from weather).
    markActiveTheme(document.body.getAttribute("data-theme"));
}

setTheme();

export { initThemePicker };