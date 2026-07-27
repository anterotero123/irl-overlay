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
        return isDay ? "sun.svg" : "moon.svg";
    }

    if (code === 1 || code === 2) {
        return "partly-cloudy.svg";
    }

    if (code === 3) {
        return "cloud.svg";
    }

    if (code >= 45 && code <= 48) {
        return "fog.svg";
    }

    if (code >= 51 && code <= 67) {
        return "rain.svg";
    }

    if (code >= 71 && code <= 77) {
        return "snow.svg";
    }

    if (code >= 80 && code <= 82) {
        return "rain.svg";
    }

    if (code >= 95) {
        return "storm.svg";
    }

    return "sun.svg";

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

const icon =
    document.getElementById("weather-icon");

const iconFile =
    getWeatherIcon(
        data.current_weather.weathercode,
        isDay
    );
        
icon.classList.add("weather-changing");
        
setTimeout(() => {

    icon.src = iconFile;

const weather =
    document.getElementById("weather");

weather.className = "";
    
    icon.className = "";

if (iconFile.includes("sun")) {

    icon.classList.add("sun");
    weather.classList.add("sun");

}

else if (iconFile.includes("moon")) {

    icon.classList.add("moon");
    weather.classList.add("moon");

}

else if (iconFile.includes("partly")) {

    icon.classList.add("partly");
    weather.classList.add("partly");

}

else if (iconFile.includes("cloud")) {

    icon.classList.add("cloud");
    weather.classList.add("cloud");

}

else if (iconFile.includes("rain")) {

    icon.classList.add("rain");
    weather.classList.add("rain");

}

else if (iconFile.includes("storm")) {

    icon.classList.add("storm");
    weather.classList.add("storm");

}

else if (iconFile.includes("fog")) {

    icon.classList.add("fog");
    weather.classList.add("fog");

}

else if (iconFile.includes("snow")) {

    icon.classList.add("snow");
    weather.classList.add("snow");

}

icon.classList.remove("weather-changing");

}, 250);

document.getElementById("weather-temp").textContent =
    `${temp}°C`;

});

}

```javascript
// ============================================================
// SIJAINTI + SÄÄ GPS:LLÄ
// ============================================================

let lastWeatherUpdate = 0;
let lastCity = "";

const WEATHER_UPDATE_INTERVAL = 600000;

const gpsOptions = {
    enableHighAccuracy: true,
    timeout: 120000,
    maximumAge: 0
};


// ============================================================
// GPS-SIJAINTI SAATU
// ============================================================

async function onPosition(position) {

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log(
        "GPS:",
        lat,
        lon,
        "Tarkkuus:",
        position.coords.accuracy,
        "m"
    );


    // --------------------------------------------------------
    // SÄÄ SUORAAN GPS-KOORDINAATEISTA
    // --------------------------------------------------------

    const now = Date.now();

    if (
        now - lastWeatherUpdate >
        WEATHER_UPDATE_INTERVAL
    ) {

        console.log(
            "HAETAAN SÄÄ:",
            lat,
            lon
        );

        loadWeather(
            lat,
            lon,
            ""
        );

        lastWeatherUpdate = now;
    }


    // --------------------------------------------------------
    // KAUPUNKI GPS-KOORDINAATEISTA
    // --------------------------------------------------------

    try {

        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fi`
        );

        if (!response.ok) {
            throw new Error(
                "Nominatim HTTP " +
                response.status
            );
        }

        const data =
            await response.json();

        const address =
            data.address || {};

        const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.village ||
            address.county ||
            "";

        if (!city) {

            console.log(
                "Kaupunkia ei löytynyt GPS-sijainnista."
            );

            return;
        }


        console.log(
            "GPS KAUPUNKI:",
            city
        );


        if (
            city !== lastCity
        ) {

            const cityElement =
                document.getElementById(
                    "city"
                );

            if (cityElement) {

                cityElement.classList.remove(
                    "city-fade"
                );

                void cityElement.offsetWidth;

                cityElement.textContent =
                    `📍${city}`;

                cityElement.classList.add(
                    "city-fade"
                );
            }

            lastCity = city;

            console.log(
                "KAUPUNKI PÄIVITETTY:",
                city
            );
        }


    } catch (error) {

        console.log(
            "KAUPUNGIN HAKU EPÄONNISTUI:",
            error
        );

    }

}



// ============================================================
// GPS-VIRHE
// ============================================================

function onError(error) {

    console.log(
        "GPS VIRHE:",
        error.code,
        error.message
    );

}



// ============================================================
// GPS:N KÄYNNISTYS
// ============================================================

console.log(
    "GPS-JÄRJESTELMÄ KÄYNNISTYY"
);


if (
    navigator.geolocation
) {

    console.log(
        "GPS-RAJAPINTA LÖYTYI"
    );


    // --------------------------------------------------------
    // 1. HAETAAN ENSIMMÄINEN SIJAINTI
    // --------------------------------------------------------

    console.log(
        "GPS: haetaan ensimmäistä sijaintia..."
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            console.log(
                "GPS: ENSIMMÄINEN SIJAINTI SAATU"
            );

            onPosition(
                position
            );

        },

        function(error) {

            console.log(
                "GPS: ENSIMMÄINEN SIJAINTI EPÄONNISTUI",
                error.code,
                error.message
            );

            onError(
                error
            );

        },

        gpsOptions

    );


    // --------------------------------------------------------
    // 2. JATKUVA SIJAINTISEURANTA
    // --------------------------------------------------------

    navigator.geolocation.watchPosition(

        function(position) {

            console.log(
                "GPS WATCH: SIJAINTI SAATU"
            );

            onPosition(
                position
            );

        },

        function(error) {

            console.log(
                "GPS WATCH VIRHE:",
                error.code,
                error.message
            );

            onError(
                error
            );

        },

        gpsOptions

    );


} else {

    console.log(
        "GPS: navigator.geolocation EI OLE SAATAVILLA"
    );

}

// ===== YHTEYDEN LAATU =====

let lastActiveBars = -1;
let lastSignalColor = "";

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

if (activeBars === lastActiveBars &&
    color === lastSignalColor) {

    return;

}

lastActiveBars = activeBars;
lastSignalColor = color;

// Päivitetään vain muuttuneet palkit

for (let i = 0; i < allBars.length; i++) {

    if (i < activeBars) {

        allBars[i].style.background = color;

    } else {

        allBars[i].style.background = "#555";

    }

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
    { icon: "youtube.svg", text: "Lookkino" },
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
    "socialFlip .45s ease, socialPulse .55s ease";

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
