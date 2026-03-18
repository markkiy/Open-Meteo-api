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
let dailyData; // Globális változó a napi adatok tárolására

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
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=auto&hourly=relative_humidity_2m,precipitation_probability`)
    const weatherData = await weatherResponse.json();
    
    
    
    console.log(geoData.results[0].country)
    const countryValue = geoData.results[0].country;
    document.cookie = `country=${countryValue}; path=/; max-age=31536000; SameSite=Lax`; // 1 évig érvényes cookie
    
    
    const perci = weatherData.hourly.precipitation_probability[0];
    
    writeDayData(0); // Kiírjuk a mai nap adatait
    searchBtn.disabled = false;
    loader.style.display = "none";
    dailyData = weatherData.daily; // Tároljuk a napi adatokat
    dailyForcast(dailyData)
    
    if (cityInput == "Little Saint James") {
      moreInfo.innerHTML = `Szeretnel többet megtudni <a href="https://da.wikipedia.org/wiki/Jeffrey_Epstein">Little Saint James</a>-ról?`  
    }
    else{

      moreInfo.innerHTML = `Szeretnel többet megtudni <a href="moreinfo.html">${geoData.results[0].country}</a>-ról?`
    }
    moreInfo.style.display = "block"
    
    
    // Tároljuk a legutolsó várost localStorage-ban
    const city = geoData.results[0].name;
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

function writeDayData(dayIndex) {
    const date = new Date(dailyData.time[dayIndex]);
    const dayName = date.toLocaleDateString("hu-HU", { weekday: "long" });
    const dateStr = date.toLocaleDateString("hu-HU", { year: 'numeric', month: 'short', day: 'numeric' });
    const tempMax = Math.round(dailyData.temperature_2m_max[dayIndex]);
    const tempMin = Math.round(dailyData.temperature_2m_min[dayIndex]);
    const icon = dailyData.weather_code[dayIndex];
    const wind = getKmh(dailyData.windspeed_10m_max[dayIndex]);
    const perci = dailyData.precipitation_probability_max[dayIndex];

    cityName.textContent = document.getElementById("cityInput").value; // Város neve marad
    temperatureValue.textContent = `${tempMax}°C`;
    windValue.textContent = `${wind}km/h`;
    humadityValue.textContent = "N/A"; // Nincs napi humidity
    precipitationValue.textContent = `${perci}%`;
    dateDayValue.textContent = dayName;
    dateValue.textContent = dateStr;
    iconData.textContent = getWeatherIcon(icon)[0];
    statusValue.textContent = getWeatherIcon(icon)[1];
}


//Nap választó

document.addEventListener("click", (e) =>{
  const clickedDayDiv = e.target.closest(".day");

  // Ha a kattintás nem egy .day elemen vagy annak a belsejében történt, kilépünk a függvényből
  if (!clickedDayDiv) {
    return; 
  }

  // 2. Leszedjük az összes .day elemről az "active" osztályt
  const allDays = document.querySelectorAll(".day");
  allDays.forEach(element => {
    element.classList.remove("active");
  });

  // 3. Rátesszük az "active" osztályt arra a .day div-re, amelyikben a kattintás történt
  clickedDayDiv.classList.add("active");

  // 4. Kiírjuk az adott nap adatait
  const dayIndex = parseInt(clickedDayDiv.dataset.index);
  writeDayData(dayIndex);

})








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
