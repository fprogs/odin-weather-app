const { doc } = require("prettier");

/* eslint-disable no-restricted-syntax */
const CURRENT_WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const GEOCODING_API = "http://api.openweathermap.org/geo/1.0/direct";

const RESPONSE_LIMIT = 10;

const fetchCurrentWeather = (lat, lon) => fetch(`${CURRENT_WEATHER_API}?lat=${lat}&lon=${lon}&appid=${process.env.APPID}`)
  .then(response => response.json())

const fetchSuggestions = location => fetch(`${GEOCODING_API}?q=${location}&limit=${RESPONSE_LIMIT}&appid=${process.env.APPID}`)
  .then(response => response.json())

const processCurrentWeatherData = data => ({
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

const processSuggestions = data => data.map(location => ({
    lat: location.lat,
    lon: location.lon,
    name: location.name,
    country: location.country,
}));

const createSuggestions = suggestions => suggestions.map(location => {
  const li = document.createElement("li");
  const name = li.appendChild(document.createElement("span"));
  name.textContent = `${location.name},${location.country}`;
  const geoCoordinates = li.appendChild(document.createElement("span"));
  geoCoordinates.textContent = `${location.lat.toFixed(3)},${location.lon.toFixed(3)}`;
  return li;
});

const createIndexPage = () => {
  const container = document.createElement("div");
  container.classList.add("container");
  const form = container.appendChild(document.createElement("form"));
  form.setAttribute("id", "searchForm");
  const searchContainer = form.appendChild(document.createElement("div"));
  const input = searchContainer.appendChild(document.createElement("input"));
  input.setAttribute("type", "search");
  input.setAttribute("name", "location");
  input.setAttribute("id", "search");
  input.setAttribute("placeholder", "Search city");
  const button = searchContainer.appendChild(document.createElement("button"));
  button.setAttribute("type", "submit");
  button.textContent = "Search";
  const suggestions = form.appendChild(document.createElement("ul"));
  suggestions.setAttribute("id", "suggestions");
  const content = container.appendChild(document.createElement("main"));
  content.setAttribute("id", "weather");
  return container;
}

const createCurrentWeather = processedData => {
  const container = document.createElement("div");

  const locationContainer = container.appendChild(document.createElement("div"));
  const location = locationContainer.appendChild(document.createElement("h2"));
  location.innerHTML = `<span> Current conditions at:</span> ${processedData.name}, ${processedData.country}`;
  const coordinates = locationContainer.appendChild(document.createElement("p"));
  coordinates.innerHTML = `<span>Lat:</span> ${processedData.lat} <span>Lon:</span> ${processedData.lon}`;

  const weatherContainer = container.appendChild(document.createElement("div"));
  const weather = weatherContainer.appendChild(document.createElement("div"));
  const image = weather.appendChild(document.createElement("img"));
  image.setAttribute("src", `https://openweathermap.org/img/wn/${processedData.icon}@2x.png`);
  image.setAttribute("alt", processedData.main);
  const description = weather.appendChild(document.createElement("p"));
  description.textContent = processedData.description;
  const temp = weather.appendChild(document.createElement("p"));
  temp.textContent = processedData.temp;

  const additionalInfo = weatherContainer.appendChild(document.createElement("div"));
  const table = additionalInfo.appendChild(document.createElement("table"));
  const tableBody = table.appendChild(document.createElement("tbody"));

  const humidityRow = tableBody.appendChild(document.createElement("tr"));
  const humidityHeader = humidityRow.appendChild(document.createElement("th"));
  humidityHeader.textContent = "Humidity";
  const humidity = humidityRow.appendChild(document.createElement("td"));
  humidity.textContent = processedData.humidity;

  const windSpeedRow = tableBody.appendChild(document.createElement("tr"));
  const windSpeedHeader = windSpeedRow.appendChild(document.createElement("th"));
  windSpeedHeader.textContent = "Wind Speed";
  const windSpeed = windSpeedRow.appendChild(document.createElement("td"));
  windSpeed.textContent = processedData.wind_speed;

  const visibilityRow = tableBody.appendChild(document.createElement("tr"));
  const visibilityHeader = visibilityRow.appendChild(document.createElement("th"));
  visibilityHeader.textContent = "Visibility";
  const visibility = visibilityRow.appendChild(document.createElement("td"));
  visibility.textContent = processedData.visibility;

  const feelsLikeRow = tableBody.appendChild(document.createElement("tr"));
  const feelsLikeHeader = feelsLikeRow.appendChild(document.createElement("th"));
  feelsLikeHeader.textContent = "Feels like";
  const feelsLike = feelsLikeRow.appendChild(document.createElement("td"));
  feelsLike.textContent = processedData.feels_like;

  return container;
}

document.body.appendChild(createIndexPage());
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const location = formData.get("location");
  fetchSuggestions(location)
    .then(data => {
      const suggestions = processSuggestions(data);
      const lis = createSuggestions(suggestions);
      const ul = document.getElementById("suggestions");
      ul.innerHTML = "";
      for (const li of lis) {
        li.addEventListener("click", e => {
          const index = [...ul.childNodes].indexOf(e.currentTarget);
          const suggestion = suggestions.at(index);
          fetchCurrentWeather(suggestion.lat, suggestion.lon)
            .then(data => {
              const processedData = processCurrentWeatherData(data);
              processedData.lat = suggestion.lat;
              processedData.lon = suggestion.lon;
              processedData.name = suggestion.name;
              processedData.country = suggestion.country;
              const weather = document.getElementById("weather");
              weather.innerHTML = "";
              weather.appendChild(createCurrentWeather(processedData));
            });
          const search = document.getElementById("search");
          search.value = "";
          ul.innerHTML = "";
        });
        ul.appendChild(li);
      }
    })
    .catch(err => console.log(err));
});