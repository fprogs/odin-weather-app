const CURRENT_WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";

const fetchCurrentWeather = (location) => fetch(`${CURRENT_WEATHER_API}?q=${location}&appid=${process.env.APPID}`)
    .then((response) => response.json())
    .then((data) => console.log(data));

const processCurrentWeatherData = (data) => ({
  weather: data.weather[0].main,
  description: data.weather[0].description,
  icon: data.weather[0].icon,
  temp: data.main.temp,
  feels_like: data.main.feels_like,
  temp_min: data.main.temp_min,
  temp_max: data.main.temp_max,
  humidity: data.main.humidity,
  visibility: data.visibility,
  wind_speed: data.wind.speed,
})
