()=>{

document.getElementById("city").textContent =
"📍Haetaan verkosta...";


fetch("https://ipapi.co/json/")

.then(r=>r.json())

.then(data=>{

document.getElementById("city").textContent =
`📍${data.city || "Ei kaupunkia"}`;


loadWeather(
data.latitude,
data.longitude,
data.city || "Tuntematon"
);

})

.catch(error=>{

document.getElementById("city").textContent =
"📍Sijaintivirhe";

});

}
