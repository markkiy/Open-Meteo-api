
const capital = document.getElementById("capital");


async function getCountry(){

    let country = getCookie("country")
    if (!country) {
        capital.innerHTML = "Capital: N/A";
        return;
    }
    const res = await fetch(`https://restcountries.com/v3.1/translation/${encodeURIComponent(country)}`);

    const data = await res.json();
    
    capital.innerHTML = `Capital: ${data[0].capital?.[0] || "N/A"}`
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
