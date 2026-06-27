// KELLO

function updateClock() {

    const now = new Date();

    const time =
        String(now.getHours()).padStart(2,"0")
        + ":" +
        String(now.getMinutes()).padStart(2,"0");

    document.getElementById("time").textContent =
    `🕒${time}`;
}

setInterval(updateClock,1000);
updateClock();


// AKKU

if (navigator.getBattery) {

    navigator.getBattery().then(battery => {

        function updateBattery(){

            const level =
            Math.round(battery.level * 100);

            document.getElementById("battery").textContent =
            `🔋${level}%`;
        }

        updateBattery();

        battery.addEventListener(
            "levelchange",
            updateBattery
        );

    });

}


// SÄÄ

function loadWeather(lat, lon, city){

    document.getElementById("city").textContent =
    `📍${city}`;


    fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    )

    .then(response => response.json())

    .then(data => {

        const temp =
        Math.round(
        data.current_weather.temperature
        );

        document.getElementById("weather").textContent =
        `☀️${temp}°C`;

    });

}


// SIJAINTI VERKON KAUTTA

function getLocation(){

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


getLocation();

// ===== VERKKOTESTI =====

function updateNetwork() {

    const signal = document.getElementById("signal");

    if (!signal) return;

    if (navigator.connection) {
        signal.textContent = "📶 " + (navigator.connection.effectiveType || "?");
    } else {
        signal.textContent = "📶 ?";
    }
}

updateNetwork();

if (navigator.connection) {
    navigator.connection.addEventListener("change", updateNetwork);
}
