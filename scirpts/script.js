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
let dailyData;
let currentWeatherData; 
let currentHumidity;
let currentPrecipitation;
let currentCity; 

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
      alert("Város nem található, kérlek próbáld újra!");
      return;
    }

    // Open Meteo API (Lekerjük az időjárási adatokat)
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto&hourly=relative_humidity_2m,precipitation_probability`)
    const weatherData = await weatherResponse.json();



    console.log(geoData.results[0].country)
    const countryValue = geoData.results[0].country;
    document.cookie = `country=${countryValue}; path=/; max-age=31536000; SameSite=Lax`; // 1 évig érvényes cookie


    const perci = weatherData.hourly.precipitation_probability[0];
    const time = weatherData.hourly.time[0];

    // Tároljuk a jelenlegi időjárási adatokat globális változókban
    currentWeatherData = weatherData.current_weather;
    currentHumidity = weatherData.hourly.relative_humidity_2m[0]; 
    currentPrecipitation = perci; 
    dailyData = weatherData.daily;
    
    // UI visszaállítása
    searchBtn.disabled = false;
    loader.style.display = "none";
    dailyForcast(dailyData)
    
    // Több infó link beállítása
    if (cityInput == "Little Saint James") {
      moreInfo.innerHTML = `Szeretnel többet megtudni <a href="https://da.wikipedia.org/wiki/Jeffrey_Epstein">Little Saint James</a>-ről?`
    }
    else{
      
      moreInfo.innerHTML = `Szeretnel többet megtudni <a href="moreinfo.html">${geoData.results[0].country}</a>-ről?`
    }
    moreInfo.style.display = "block"
    
    
    // Tároljuk a legutolsó várost localStorage-ban
    const city = geoData.results[0].name;
    currentCity = city; // Tároljuk globálisan
    console.log(currentCity);
    localStorage.setItem('lastCity', city);
    
    writeDayData(0); // Kiírjuk a mai nap adatait (0. index)
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
    dayDiv.dataset.index = i;

    dayDiv.innerHTML = `
      <p>${dayName}</p>
      <span>${icon}</span>
      <h4>${temp}°C</h4>
    `
      forecastContainer.appendChild(dayDiv)
  }


}

searchBtn.addEventListener("click", GetWeather);



function writeDayData(dayIndex) {
    let temp, hum, wind, icon, perci, date, dayName, dateStr;

    if (dayIndex === 0) {
        // Mai nap
        temp = currentWeatherData.temperature;
        hum = currentHumidity;
        wind = getKmh(currentWeatherData.windspeed);
        icon = currentWeatherData.weathercode;
        perci = currentPrecipitation;
        const now = new Date();
        dayName = now.toLocaleDateString("hu-HU", { weekday: "long" });
        dateStr = now.toLocaleDateString("hu-HU", { year: 'numeric', month: 'short', day: 'numeric' });
    } else {
        // Jövőbeli napok
        date = new Date(dailyData.time[dayIndex]);
        dayName = date.toLocaleDateString("hu-HU", { weekday: "long" });
        dateStr = date.toLocaleDateString("hu-HU", { year: 'numeric', month: 'short', day: 'numeric' });
        temp = dailyData.temperature_2m_max[dayIndex];
        hum = "N/A"; // Nincs napi humidity
        wind = getKmh(dailyData.windspeed_10m_max[dayIndex]);
        icon = dailyData.weather_code[dayIndex];
        perci = dailyData.precipitation_probability_max[dayIndex];
    }

    cityName.textContent = currentCity;
    temperatureValue.textContent = `${Math.round(temp)}°C`;
    windValue.textContent = `${wind}km/h`;
    humadityValue.textContent = `${hum}%`;
    precipitationValue.textContent = `${perci}%`;
    dateDayValue.textContent = dayName;
    dateValue.textContent = dateStr;
    iconData.textContent = getWeatherIcon(icon)[0];
    statusValue.textContent = getWeatherIcon(icon)[1];
}


// Eseményfigyelő a napokra, hogy amikor rákattintanak, megjelenítse a kiválasztott nap adatait
document.addEventListener("click", (e) =>{
  const clickedDayDiv = e.target.closest(".day");


  if (!clickedDayDiv) {
    return;
  }


  const allDays = document.querySelectorAll(".day");
  allDays.forEach(element => {
    element.classList.remove("active");
  });


  clickedDayDiv.classList.add("active");


  const dayIndex = parseInt(clickedDayDiv.dataset.index);
  writeDayData(dayIndex);

})







// Időjárás ikonok visszaadása kód alapján
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

// MPH-t km/h-ra váltó függvény
function getKmh(mph){
    const changeNumber = 1.609344;
    return Math.floor(mph * changeNumber);
}

// LocalStorage-ból lekéri a legutolsó várost és megjeleníti az időjárását
function getLocalStore() {
  const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        document.getElementById('cityInput').value = lastCity;
        GetWeather();
    }
}
// Oldal betöltésekor megpróbálja lekérni a legutolsó várost a localStorage-ból
window.addEventListener('DOMContentLoaded', () => {
    getLocalStore();
});
