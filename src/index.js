const CURRENT_WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";

const fetchCurrentWeather = (location) => fetch(`${CURRENT_WEATHER_API}?q=${location}&appid=${process.env.APPID}`)
    .then((response) => response.json())
    .then((data) => console.log(data));
