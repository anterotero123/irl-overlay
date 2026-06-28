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

    const batteryElement =
    document.getElementById("battery");

if (battery.charging && level < 100) {

    batteryElement.innerHTML =
    `<span class="charging">⚡</span>🔋${level}%`;

}

else {

    batteryElement.textContent =
    `🔋${level}%`;

}

}

        updateBattery();

        battery.addEventListener(
            "levelchange",
            updateBattery
        );

battery.addEventListener(
    "chargingchange",
    updateBattery
        
    });

}

function getWeatherIcon(code){

    if(code === 0){
        return "☀️";
    }

    if(code === 1 || code === 2){
        return "🌤️";
    }

    if(code === 3){
        return "☁️";
    }

    if(code >= 45 && code <= 48){
        return "🌫️";
    }

    if(code >= 51 && code <= 67){
        return "🌧️";
    }

    if(code >= 71 && code <= 77){
        return "❄️";
    }

    if(code >= 80 && code <= 82){
        return "🌦️";
    }

    if(code >= 95){
        return "⛈️";
    }

    return "🌡️";
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
`${getWeatherIcon(data.current_weather.weathercode)}${temp}°C`;

    });

}


// SIJAINTI GPS:LLÄ + VARALLA VERKKO

let lastWeatherUpdate = 0;
let lastCity = "";

async function onPosition(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fi`
        );

        const data = await response.json();

        const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Tuntematon";

        if (city !== lastCity) {
            document.getElementById("city").textContent = `📍${city}`;
            lastCity = city;
        }

        const now = Date.now();

        if (now - lastWeatherUpdate > 600000) {
            loadWeather(lat, lon, city);
            lastWeatherUpdate = now;
        }

    } catch (err) {
        console.log(err);
    }

}

function onError(error) {

    console.log("GPS-virhe:", error);

    if (lastCity === "") {
        getLocationByIP();
    }

}


// VARASIJANTI IP:LLÄ

function getLocationByIP(){

    document.getElementById("city").textContent =
"📍Overlay toimii";

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

    .catch(()=>{

        document.getElementById("city").textContent =
        "📍Sijaintivirhe";

    });

}

if (navigator.geolocation) {

    navigator.geolocation.watchPosition(
        onPosition,
        onError,
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 5000
        }
    );

} else {

    getLocationByIP();

}

// ===== YHTEYDEN LAATU =====

async function updateNetworkQuality() {

    const signal = document.getElementById("signal");

    if (!signal) return;

    let type = "4g";

    if (navigator.connection && navigator.connection.effectiveType) {
        type = navigator.connection.effectiveType;
    }

    const start = performance.now();

    try {

        await fetch("./ping.txt?cache=" + Date.now(), {
            cache: "no-store"
        });

        const ping = performance.now() - start;

        let bars = "▂▃▄▅█";
        let color = "#34C759";

        if (type === "2g") {

            bars = "▂";
            color = "#FF3B30";

        }

        else if (type === "3g") {

            bars = "▂▃▄";
            color = "#FF9F0A";

        }

        else if (type === "4g") {

            if (ping < 200) {

                bars = "▂▃▄▅█";
                color = "#34C759";

            }

            else if (ping < 600) {

                bars = "▂▃▄▅";
                color = "#FFD60A";

            }

            else {

                bars = "▂▃▄";
                color = "#FF9F0A";

            }

        }

        else {

            bars = "▂▃▄▅█";
            color = "#34C759";

        }

        signal.textContent = bars;

signal.style.color = color;

signal.classList.add("flash");

setTimeout(() => {

    signal.classList.remove("flash");

}, 250);

    }

    catch {

        signal.innerHTML =
            '<span style="color:#FF3B30;font-weight:bold;">✖</span>';

    }

}

updateNetworkQuality();

setInterval(updateNetworkQuality, 30000);

if (navigator.connection) {
    navigator.connection.addEventListener("change", updateNetworkQuality);
}
