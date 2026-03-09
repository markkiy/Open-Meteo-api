const searchBtn = document.getElementById("searchBtn");
const cityName = document.getElementById("location");
const temperatureValue = document.getElementById("temperature");
const windValue = document.getElementById("wind"); 
const humadityValue = document.getElementById("humidity");
const dateValue = document.getElementById("date");
const dateDayValue = document.getElementById("dateDay");
const iconData = document.getElementById("iconData");
const precipitationValue = document.getElementById("precipitation");
const statusValue = document.querySelector(".status")
const loader = document.getElementById("loader");
const moreInfo = document.getElementById("moreInfo")

async function GetWeather() {
    // UI várakozik
    temperatureValue.textContent = "...";
    cityName.textContent = "Betöltés...";
    windValue.textContent = "...";
    humadityValue.textContent = "...";
    precipitationValue.textContent = "...";
    searchBtn.disabled = true;
    loader.style.display = "block";
    //City input / vizsgálás
    const cityInput = document.getElementById("cityInput").value;
    if (!cityInput) return;


    //Geo API (Lekérjük a kordinátákat)
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityInput}&count=1&language=hu`)
    const geoData = await geoResponse.json();

    const lat = geoData.results[0].latitude
    const lon = geoData.results[0].longitude
    const timezone = geoData.results[0].timezone;
    if (!timezone) {
      getLocalStore();
      return;
    }

    // Open Meteo API (Lekerjük az időjárási adatokat)
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weather_code,temperature_2m_max&timezone=auto&hourly=relative_humidity_2m,precipitation_probability`)
    const weatherData = await weatherResponse.json();
    
    
    
    console.log(geoData.results[0].country)
    const countryValue = geoData.results[0].country;
    document.cookie = `country=${countryValue}; path=/; max-age=31536000; SameSite=Lax`; // 1 évig érvényes cookie
    const city = geoData.results[0].name;
    const humidity = weatherData.hourly.relative_humidity_2m[0];
    const wind = getKmh(weatherData.current_weather.windspeed);
    const temp = weatherData.current_weather.temperature;
    const icon = weatherData.current_weather.weathercode
    
    const perci = weatherData.hourly.precipitation_probability[0];
    writeData(city, temp, humidity, wind, timezone, icon, perci)
    searchBtn.disabled = false;
    loader.style.display = "none";
    dailyForcast(weatherData.daily)
    moreInfo.innerHTML = `Szeretnel többet megtudni <a href="moreinfo.html">${geoData.results[0].country}</a>-ról?`
    moreInfo.style.display = "block"


    // Tároljuk a legutolsó várost localStorage-ban
    localStorage.setItem('lastCity', city);

}

function dailyForcast(daily) {
  const forecastContainer = document.querySelector(".forecast")
  forecastContainer.innerHTML = ""

  for (let i = 1; i <= 5; i++) {
    const date = new Date(daily.time[i])
    const dayName = date.toLocaleDateString("hu-HU" , {weekday :"short"})
    const temp = Math.round(daily.temperature_2m_max[i])
    const iconCode = daily.weather_code[i]
    const icon = getWeatherIcon(iconCode)[0]
    

    const dayDiv = document.createElement("div");
    dayDiv.className = "day";

    dayDiv.innerHTML = `
      <p>${dayName}</p>
      <span>${icon}</span>
      <h4>${temp}°C</h4>
    `  
      forecastContainer.appendChild(dayDiv)
  }
  
}

searchBtn.addEventListener("click", GetWeather);


function writeData(city, temp, hum, wind, timezone, icon, perci) {
    cityName.textContent  = city;
    temperatureValue.textContent  = `${Math.round(temp)}°C`;
    windValue.textContent  = `${wind}km/h`;
    humadityValue.textContent  = `${hum}%`;
    const now = new Date();
    const options = {timeZone: `${timezone}`, year: 'numeric', month: 'short', day: 'numeric' };
    dateDayValue.textContent  =  now.toLocaleDateString("hu-HU", { weekday: "long",timeZone: `${timezone}` })
    dateValue.textContent  = now.toLocaleDateString("hu-HU",options);
    iconData.textContent  = getWeatherIcon(icon)[0];
    statusValue.textContent  = getWeatherIcon(icon)[1];
    
    precipitationValue.textContent  = `${perci}%`;
    

}

function getWeatherIcon(code) {
  switch (true) {
    case (code === 0):
      return ["☀️", "Napos"];

    case ([1, 2, 3].includes(code)):
      return ["🌤️", "Enyhén felhős"];

    case ([45, 48].includes(code)):
      return ["🌫️", "Ködös"];

    case ([51, 53, 55, 56, 57].includes(code)):
      return ["🌦️", "Szitálás / Gyenge eső"];

    case ([61, 63, 65, 66, 67].includes(code)):
      return ["🌧️", "Eső"];

    case ([71, 73, 75, 77].includes(code)):
      return ["❄️", "Havazás"];

    case ([80, 81, 82].includes(code)):
      return ["🌦️", "Zápor"];

    case ([85, 86].includes(code)):
      return ["🌨️", "Hózápor"];

    case (code === 95):
      return ["⚡", "Zivatar"];

    case ([96, 99].includes(code)):
      return ["⛈️", "Zivatar jégesővel"];

    default:
      return ["❓", "Ismeretlen időjárás"];
  }
}


function getKmh(mph){
    const changeNumber = 1.609344;
    return Math.floor(mph * changeNumber);
}


function getLocalStore() {
  const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        document.getElementById('cityInput').value = lastCity;
        GetWeather();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    getLocalStore();
});
