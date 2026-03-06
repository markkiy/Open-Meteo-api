
const capital = document.getElementById("capital");


async function getCountry(){
    const res = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(getCookie("country"))}?fullText=true`
    );

    const data = await res.json();
    
    capital.innerHTML = `Capital: ${data.capital?.[0] || "N/A"}`
}



function getCookie(name) {
    
 
    let cookies = document.cookie.split(";");
    console.log(cookies)
    for (let i = 0; i < cookies.length; i++) {
        let [key, value] = cookies[i].split("=");
        if (key === name) return value;   

    }

}

getCountry()
