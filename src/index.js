import "./style.css";

const { doc } = require("prettier");

/* eslint-disable no-restricted-syntax */
const CURRENT_WEATHER_API = "https://api.openweathermap.org/data/2.5/weather";
const GEOCODING_API = "http://api.openweathermap.org/geo/1.0/direct";

const RESPONSE_LIMIT = 10;

const fetchCurrentWeather = (lat, lon) => fetch(`${CURRENT_WEATHER_API}?lat=${lat}&lon=${lon}&units=imperial&appid=${process.env.APPID}`)
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
  name.textContent = `${location.name}, ${location.country}`;
  const geoCoordinates = li.appendChild(document.createElement("span"));
  geoCoordinates.textContent = `${location.lat.toFixed(3)}, ${location.lon.toFixed(3)}`;
  return li;
});

const createIndexPage = () => {
  const container = document.createElement("div");
  container.classList.add("container");
  const content = container.appendChild(document.createElement("div"));
  content.setAttribute("id", "content");
  const form = content.appendChild(document.createElement("form"));
  form.setAttribute("id", "searchForm");
  const searchContainer = form.appendChild(document.createElement("div"));
  searchContainer.setAttribute("id", "search-container");
  const input = searchContainer.appendChild(document.createElement("input"));
  input.setAttribute("type", "search");
  input.setAttribute("name", "location");
  input.setAttribute("id", "search");
  input.setAttribute("placeholder", "Search city");
  input.classList.add("full-width");
  const suggestions = searchContainer.appendChild(document.createElement("ul"));
  suggestions.setAttribute("id", "suggestions");
  suggestions.classList.add("full-width");
  const button = form.appendChild(document.createElement("button"));
  button.setAttribute("type", "submit");
  button.textContent = "Search";
  const main = content.appendChild(document.createElement("main"));
  main.setAttribute("id", "main");
  return container;
}

const createCurrentWeather = processedData => {
  const container = document.createElement("div");

  const locationContainer = container.appendChild(document.createElement("div"));
  locationContainer.setAttribute("id", "location-container")
  const location = locationContainer.appendChild(document.createElement("h2"));
  location.setAttribute("id", "location");
  location.innerHTML = `<span> Current conditions at:</span> ${processedData.name}, ${processedData.country}`;
  const coordinates = locationContainer.appendChild(document.createElement("p"));
  coordinates.setAttribute("id", "coordinates");
  coordinates.innerHTML = `<span>Lat:</span> ${processedData.lat.toFixed(2)} <span>Lon:</span> ${processedData.lon.toFixed(2)}`;

  const weatherContainer = container.appendChild(document.createElement("div"));
  weatherContainer.setAttribute("id", "weather-container")
  const weather = weatherContainer.appendChild(document.createElement("div"));
  weather.setAttribute("id", "weather");
  const image = weather.appendChild(document.createElement("img"));
  image.setAttribute("id", "weather-icon");
  image.setAttribute("src", `https://openweathermap.org/img/wn/${processedData.icon}@2x.png`);
  image.setAttribute("alt", processedData.weather);
  const info = weather.appendChild(document.createElement("div"));
  const description = info.appendChild(document.createElement("p"));
  info.setAttribute("id", "info");
  description.setAttribute("id", "description");
  description.textContent = processedData.description;
  const temp = info.appendChild(document.createElement("p"));
  temp.setAttribute("id", "temp");
  temp.textContent = `${processedData.temp}${String.fromCharCode(176)}F`;

  const additionalInfo = weatherContainer.appendChild(document.createElement("div"));
  const table = additionalInfo.appendChild(document.createElement("table"));
  const tableBody = table.appendChild(document.createElement("tbody"));

  const humidityRow = tableBody.appendChild(document.createElement("tr"));
  const humidityHeader = humidityRow.appendChild(document.createElement("th"));
  humidityHeader.textContent = "Humidity";
  humidityHeader.classList.add("align-right");
  const humidity = humidityRow.appendChild(document.createElement("td"));
  humidity.textContent = `${processedData.humidity}%`;

  const windSpeedRow = tableBody.appendChild(document.createElement("tr"));
  const windSpeedHeader = windSpeedRow.appendChild(document.createElement("th"));
  windSpeedHeader.textContent = "Wind Speed";
  windSpeedHeader.classList.add("align-right");
  const windSpeed = windSpeedRow.appendChild(document.createElement("td"));
  windSpeed.textContent = `${processedData.wind_speed} mph`;

  const visibilityRow = tableBody.appendChild(document.createElement("tr"));
  const visibilityHeader = visibilityRow.appendChild(document.createElement("th"));
  visibilityHeader.textContent = "Visibility";
  visibilityHeader.classList.add("align-right");
  const visibility = visibilityRow.appendChild(document.createElement("td"));
  visibility.textContent = `${(processedData.visibility / 1000).toFixed(2)} mi`;

  const feelsLikeRow = tableBody.appendChild(document.createElement("tr"));
  const feelsLikeHeader = feelsLikeRow.appendChild(document.createElement("th"));
  feelsLikeHeader.textContent = "Feels like";
  feelsLikeHeader.classList.add("align-right");
  const feelsLike = feelsLikeRow.appendChild(document.createElement("td"));
  feelsLike.textContent = `${processedData.feels_like}${String.fromCharCode(176)}F`;

  return container;
}

const removeChildren = parent => {
  parent.replaceChildren();
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
      removeChildren(ul);
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
              const weather = document.getElementById("main");
              removeChildren(weather);
              weather.appendChild(createCurrentWeather(processedData));
              weather.classList.add("border");
            });
          const search = document.getElementById("search");
          search.value = "";
          removeChildren(ul);
          ul.classList.remove("border", "no-top-border");
        });
        li.classList.add("suggestion");
        ul.appendChild(li);
      }
      if (ul.children.length > 0) ul.classList.add("border", "no-top-border");
    })
    .catch(err => console.log(err));
});
document.addEventListener("click", e => {
  const suggestions = document.getElementById("suggestions")
  removeChildren(suggestions);
  suggestions.classList.remove("border", "no-top-border");
});