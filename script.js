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

        function updateBattery() {

            const level =
                Math.round(battery.level * 100);

            const batteryElement =
                document.getElementById("battery");

            const dividers =
                document.querySelectorAll(".divider");

            let icon = "🔋";
            let color = "#FFFFFF";

            // Akun väri ja ikoni

            if (level <= 20) {

                icon = "🪫";
                color = "#FF3B30";

            }

            else if (level <= 40) {

                color = "#FFD60A";

            }

            // Dividerit punaisiksi kun akku on vähissä

            if (level <= 15) {

                dividers.forEach(divider => {

                    divider.classList.add("low-power");

                });

            }

            else {

                dividers.forEach(divider => {

                    divider.classList.remove("low-power");

                });

            }

            // Alhaisen akun animaatio

            const batteryClass =
                level <= 15 ? "low-battery" : "";

            // Näytetään akun tila

            if (battery.charging && level < 100) {

                batteryElement.innerHTML =
                    `<span class="charging">⚡</span><span class="${batteryClass}" style="color:${color}">${icon}${level}%</span>`;

            }

            else {

                batteryElement.innerHTML =
                    `<span class="${batteryClass}" style="color:${color}">${icon}${level}%</span>`;

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
        );

    });

}

function getWeatherIcon(code, isDay){

if (code === 0) {
    return isDay ? "☀️" : "🌙";
}

if (code === 1 || code === 2) {
    return isDay ? "🌤️" : "☁️🌙";
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

    fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`
    )

    .then(response => response.json())

    .then(data => {

        const temp =
        Math.round(
        data.current_weather.temperature
        );

const now = new Date();

const sunrise = new Date(data.daily.sunrise[0]);

const sunset = new Date(data.daily.sunset[0]);

const isDay = now >= sunrise && now < sunset;

document.getElementById("weather").textContent =
`${getWeatherIcon(data.current_weather.weathercode, isDay)}${temp}°C`;

    });

}


// SIJAINTI GPS:LLÄ + VARALLA VERKKO

let lastWeatherUpdate = 0;

let lastCity = "";

let pendingCity = "";
let pendingCount = 0;

async function onPosition(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log("GPS:", lat, lon);

    try {

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fi`
        );

        const data = await response.json();

const city =
    data.address.city ||
    data.address.town ||
    data.address.municipality ||
    data.address.county ||
    "Tuntematon";
        
console.log("GPS kaupunki:", city);

if (city !== lastCity) {

    if (city === pendingCity) {

        pendingCount++;

    } else {

        pendingCity = city;
        pendingCount = 1;

    }

    if (pendingCount >= 2) {

        const cityElement =
            document.getElementById("city");

        cityElement.classList.remove("city-fade");

        void cityElement.offsetWidth;

        cityElement.textContent = `📍${city}`;

        cityElement.classList.add("city-fade");

        lastCity = city;

        pendingCity = "";
        pendingCount = 0;

    }

} else {

    pendingCity = "";
    pendingCount = 0;

}

        const now = Date.now();

        if (now - lastWeatherUpdate > 600000) {
            loadWeather(lat, lon, city);
            lastWeatherUpdate = now;
        }

    } catch (err) {
        console.log("Reverse geocoding error:", err);
    }

}

function onError(error) {

    console.log(
        "GPS ERROR:",
        error.code,
        error.message
    );

    if (lastCity === "") {
        getLocationByIP();
    }

}


// VARASIJANTI IP:LLÄ

function getLocationByIP(){

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

    const gpsOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.watchPosition(
        onPosition,
        onError,
        gpsOptions
    );

} else {

    getLocationByIP();

}

// ===== YHTEYDEN LAATU =====

async function updateNetworkQuality() {

    const signal = document.getElementById("signal");

    if (!signal) return;

    const allBars = signal.querySelectorAll(".bar");

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

        let activeBars = 5;
        let color = "#34C759";

        if (type === "2g") {

            activeBars = 1;
            color = "#FF3B30";

        }

        else if (type === "3g") {

            activeBars = 3;
            color = "#FF9F0A";

        }

        else if (type === "4g") {

            if (ping < 200) {

                activeBars = 5;
                color = "#34C759";

            }

            else if (ping < 600) {

                activeBars = 4;
                color = "#FFD60A";

            }

            else {

                activeBars = 3;
                color = "#FF9F0A";

            }

        }

        else {

            activeBars = 5;
            color = "#34C759";

        }

// Nollataan kaikkien palkkien väri

allBars.forEach(bar => {

    bar.style.background = "#555";
    bar.style.transform = "scaleY(1)";

});

// Sytytetään tarvittava määrä palkkeja

for (let i = 0; i < activeBars; i++) {

    allBars[i].style.background = color;

}

    }

    catch {

        // Virhetilassa kaikki punaisiksi

        allBars.forEach(bar => {

            bar.style.background = "#FF3B30";

        });

    }

}

updateNetworkQuality();

setInterval(updateNetworkQuality, 30000);

if (navigator.connection) {
    navigator.connection.addEventListener("change", updateNetworkQuality);
}

// ===== SOME-BANNERI =====

const socials = [

    { icon: "instagram.svg", text: "AnteroLive" },
    { icon: "youtube.svg", text: "L00kkino" },
    { icon: "kick.svg", text: "AnteroLive" },
    { icon: "tiktok.svg", text: "AnteroLive" }

];

let socialIndex = 0;

function updateSocialBanner() {

    const icon =
        document.getElementById("social-icon");

    const text =
        document.getElementById("social-text");

    const row =
        document.getElementById("social-row");

    row.style.animation =
        "socialCardFlip .7s ease";

    setTimeout(() => {

        socialIndex =
            (socialIndex + 1) % socials.length;

        icon.src =
            socials[socialIndex].icon;

        icon.style.animation = "none";
        void icon.offsetWidth;
        icon.style.animation =
            "socialFlip .45s ease";

        icon.alt =
            socials[socialIndex].text;

        text.textContent =
            socials[socialIndex].text;

        row.style.opacity = "0.95";

    }, 350);

    setTimeout(() => {

        row.style.animation = "";

    }, 700);

}

// Vaihda 15 sekunnin välein

setInterval(updateSocialBanner, 15000);
