const capital = document.getElementById("capital");


async function getCountry(){

    let country = getCookie("country")
    if (!country) {
        capital.innerHTML = "Capital: N/A";
        return;
    }
    const res = await fetch(`https://restcountries.com/v3.1/translation/${encodeURIComponent(country)}`);

    const data = await res.json();
    const c = data[0];

    document.getElementById("countryName").innerText = c.name.common;
    document.getElementById("flagImg").src = c.flags.png;
    document.getElementById("capital").innerText = c.capital ? c.capital[0] : "N/A";
    document.getElementById("population").innerText = c.population.toLocaleString('hu-HU');
        
    document.getElementById("region").innerText = `${c.region} (${c.subregion})`;
    document.getElementById("area").innerText = `${c.area.toLocaleString('hu-HU')} km²`;
    if (c.currencies) {
        const currencyKey = Object.keys(c.currencies)[0];
        document.getElementById("currency").innerText = `${c.currencies[currencyKey].name} (${c.currencies[currencyKey].symbol})`;
    }

        
    if (c.languages) {
        document.getElementById("language").innerText = Object.values(c.languages).join(", ");
    }      
    document.getElementById("timezone").innerText = c.timezones[0];
    if (c.coatOfArms && c.coatOfArms.png) {
        document.getElementById("armsImg").src = c.coatOfArms.png;
    } else {
        document.getElementById("armsImg").style.display = "none";
    }
}



function getCookie(name) {
    
 
    let cookies = document.cookie.split(";");
    console.log(cookies)
    for (let i = 0; i < cookies.length; i++) {
        let [key, value] = cookies[i].trim().split("=");
        if (key === name) return value;   

    }
    return null;

}

getCountry()