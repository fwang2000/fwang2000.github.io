import { WEATHER_CODES } from "./enums/weather_codes.js";
import { WEATHER_TYPE } from "./enums/weather_type.js";
import { getWeather } from "./realtime_weather.js";

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
        currentWeatherCode = currentWeather.condition.code;
        return WEATHER_CODE_TO_TYPE.find(entry => entry.code.includes(currentWeatherCode))?.type ?? WEATHER_TYPE.CLOUDY;
    }
}

function setTheme() {

    let weatherType;

    getWeather().then(data => {
        weatherType = mapConditionToWeatherType(data);
        document.body.setAttribute("data-theme", weatherType);
    }).catch(err => {
        console.log(err);
        weatherType = WEATHER_TYPE.CLOUDY;
    });
}

setTheme();