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
// ============================================================
// SIJAINTI: IRL PRO WEB OVERLAY GPS
// ============================================================
//
// IRL PRO:
// Advanced options
// → WebViews
// → Web Overlay geo enabled = ON
//
// GPS tulee IRL PRO:n Web Overlaysta.
//
// Tavoite:
// - Vain yksi watchPosition.
// - Ensimmäinen GPS-sijainti päivittää kaupungin ja sään.
// - Sama GPS-sijainti ei tee mitään.
// - Kaupunki päivitetään vain tarvittaessa.
// - Sää päivitetään korkeintaan 10 minuutin välein.
// - Ei IP-paikannusta.
// ============================================================


// ============================================================
// ASETUKSET
// ============================================================

const WEATHER_UPDATE_INTERVAL = 600000;

// Kaupunki tarkistetaan uudelleen vasta,
// kun sijainti on muuttunut vähintään 1 km.

const CITY_UPDATE_DISTANCE_KM = 1;


// ============================================================
// TILA
// ============================================================

let lastLat = null;

let lastLon = null;

let lastCity = "";

let lastWeatherUpdate = 0;

let cityRequestInProgress = false;


// ============================================================
// ETÄISYYS
// ============================================================

function distanceKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;

    const dLat =
        (
            lat2 -
            lat1
        ) *
        Math.PI /
        180;

    const dLon =
        (
            lon2 -
            lon1
        ) *
        Math.PI /
        180;

    const a =
        Math.sin(
            dLat / 2
        ) ** 2 +

        Math.cos(
            lat1 *
            Math.PI /
            180
        ) *

        Math.cos(
            lat2 *
            Math.PI /
            180
        ) *

        Math.sin(
            dLon / 2
        ) ** 2;

    return (
        2 *
        R *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        )
    );

}


// ============================================================
// SÄÄN PÄIVITYS
// ============================================================

function updateWeather(
    lat,
    lon,
    force = false
) {

    const now =
        Date.now();


    if (
        !force &&
        now -
        lastWeatherUpdate <
        WEATHER_UPDATE_INTERVAL
    ) {

        return;

    }


    console.log(
        "SÄÄ: päivitetään GPS-sijainnista:",
        lat,
        lon
    );


    lastWeatherUpdate =
        now;


    loadWeather(
        lat,
        lon,
        ""
    );

}


// ============================================================
// KAUPUNGIN PÄIVITYS
// ============================================================

async function updateCity(
    lat,
    lon
) {

    // Estetään useampi samanaikainen
    // Nominatim-pyyntö.

    if (
        cityRequestInProgress
    ) {

        console.log(
            "KAUPUNKI: haku on jo käynnissä."
        );

        return;

    }


    cityRequestInProgress =
        true;


    console.log(
        "KAUPUNKI: haetaan sijaintia:",
        lat,
        lon
    );


    try {

        const response =
            await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fi`
            );


        if (
            !response.ok
        ) {

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


        if (
            city === ""
        ) {

            console.log(
                "KAUPUNKI: kaupunkia ei löytynyt."
            );

            return;

        }


        // Jos kaupunki on jo sama,
        // ei muuteta HTML-elementtiä.

        if (
            city === lastCity
        ) {

            console.log(
                "KAUPUNKI: sama kuin nykyinen:",
                city
            );

            return;

        }


        const cityElement =
            document.getElementById(
                "city"
            );


        if (
            !cityElement
        ) {

            console.log(
                "KAUPUNKI: #city-elementtiä ei löytynyt."
            );

            return;

        }


        // Päivitetään teksti vain oikean
        // kaupungin vaihtuessa.

        cityElement.textContent =
            `📍${city}`;


        lastCity =
            city;


        console.log(
            "KAUPUNKI PÄIVITETTY:",
            city
        );


    } catch (
        error
    ) {

        console.log(
            "KAUPUNGIN HAKU EPÄONNISTUI:",
            error
        );

    } finally {

        cityRequestInProgress =
            false;

    }

}


// ============================================================
// GPS-SIJAINTI SAATU
// ============================================================

function onPosition(
    position
) {

    const lat =
        position.coords.latitude;

    const lon =
        position.coords.longitude;

    const accuracy =
        position.coords.accuracy;


    console.log(
        "GPS:",
        lat,
        lon,
        "TARKKUUS:",
        accuracy,
        "m"
    );


    // ========================================================
    // TARKISTETAAN KOORDINAATIT
    // ========================================================

    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ) {

        console.log(
            "GPS: virheelliset koordinaatit."
        );

        return;

    }


    // ========================================================
    // ENSIMMÄINEN SIJAINTI
    // ========================================================

    if (
        lastLat === null ||
        lastLon === null
    ) {

        console.log(
            "GPS: ensimmäinen sijainti vastaanotettu."
        );


        lastLat =
            lat;

        lastLon =
            lon;


        // Sää heti.

        updateWeather(
            lat,
            lon,
            true
        );


        // Kaupunki heti.

        updateCity(
            lat,
            lon
        );


        return;

    }


    // ========================================================
    // LASKETAAN SIJAINTIERO
    // ========================================================

    const distance =
        distanceKm(
            lastLat,
            lastLon,
            lat,
            lon
        );


    console.log(
        "GPS: etäisyys edelliseen sijaintiin:",
        distance.toFixed(3),
        "km"
    );


    // ========================================================
    // SIJAINTI EI OLE MUUTTUNUT MERKITTÄVÄSTI
    // ========================================================

    if (
        distance <
        CITY_UPDATE_DISTANCE_KM
    ) {

        console.log(
            "GPS: sijainti käytännössä sama."
        );

        return;

    }


    // ========================================================
    // SIJAINTI ON MUUTTUNUT
    // ========================================================

    console.log(
        "GPS: sijainti muuttui."
    );


    lastLat =
        lat;

    lastLon =
        lon;


    // Tarkistetaan kaupunki.

    updateCity(
        lat,
        lon
    );


    // Sää päivitetään vain 10 min välein.

    updateWeather(
        lat,
        lon
    );

}


// ============================================================
// GPS-VIRHE
// ============================================================

function onError(
    error
) {

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
    "GPS: käynnistetään IRL PRO Web Overlay GPS..."
);


if (
    !navigator.geolocation
) {

    console.log(
        "GPS: navigator.geolocation ei ole saatavilla."
    );

} else {

    console.log(
        "GPS: navigator.geolocation saatavilla."
    );


    const gpsOptions = {

        enableHighAccuracy:
            true,

        timeout:
            120000,

        maximumAge:
            30000

    };


    console.log(
        "GPS: käynnistetään yksi watchPosition..."
    );


    navigator.geolocation.watchPosition(

        function(
            position
        ) {

            onPosition(
                position
            );

        },

        function(
            error
        ) {

            onError(
                error
            );

        },

        gpsOptions

    );

}


// ============================================================
// YHTEYDEN LAATU
// ============================================================
//
// Tarkistaa verkkoyhteyden laadun ping.txt-tiedoston avulla.
//
// - Tarkistus 30 sekunnin välein.
// - Yhteyden tyypin perusteella arvioidaan signaalin taso.
// - Ping-aika tarkentaa 4G-yhteyden arviota.
// - DOM päivitetään vain, jos tila oikeasti muuttuu.
// - Jos yhteys epäonnistuu, kaikki palkit muuttuvat punaisiksi.
// ============================================================


let lastActiveBars = -1;

let lastSignalColor = "";

let networkCheckRunning = false;


// ============================================================
// VERKKOYHTEYDEN TARKISTUS
// ============================================================

async function updateNetworkQuality() {

    // Estetään päällekkäiset tarkistukset.
    // Tämä on tärkeää, jos IRL PRO kutsuu
    // funktiota uudelleen ennen edellisen valmistumista.

    if (
        networkCheckRunning
    ) {

        return;

    }


    const signal =
        document.getElementById(
            "signal"
        );


    if (
        !signal
    ) {

        return;

    }


    const allBars =
        signal.querySelectorAll(
            ".bar"
        );


    if (
        allBars.length === 0
    ) {

        return;

    }


    networkCheckRunning =
        true;


    try {

        // ====================================================
        // YHTEYDEN TYYPPI
        // ====================================================

        let type =
            "4g";


        if (
            navigator.connection &&
            navigator.connection.effectiveType
        ) {

            type =
                navigator.connection.effectiveType;

        }


        // ====================================================
        // PING
        // ====================================================

        const start =
            performance.now();


        await fetch(
            "./ping.txt?cache=" +
            Date.now(),
            {
                cache:
                    "no-store"
            }
        );


        const ping =
            performance.now() -
            start;


        console.log(
            "VERKKOYHTEYS:",
            type,
            "PING:",
            Math.round(ping),
            "ms"
        );


        // ====================================================
        // MÄÄRITETÄÄN PALKKIEN MÄÄRÄ
        // ====================================================

        let activeBars =
            5;


        let color =
            "#34C759";


        // 2G

        if (
            type === "2g"
        ) {

            activeBars =
                1;

            color =
                "#FF3B30";

        }


        // 3G

        else if (
            type === "3g"
        ) {

            activeBars =
                3;

            color =
                "#FF9F0A";

        }


        // 4G

        else if (
            type === "4g"
        ) {

            if (
                ping <
                200
            ) {

                activeBars =
                    5;

                color =
                    "#34C759";

            }

            else if (
                ping <
                600
            ) {

                activeBars =
                    4;

                color =
                    "#FFD60A";

            }

            else {

                activeBars =
                    3;

                color =
                    "#FF9F0A";

            }

        }


        // Muut / tuntematon

        else {

            activeBars =
                5;

            color =
                "#34C759";

        }


        // ====================================================
        // EI MUUTOSTA
        // ====================================================

        if (
            activeBars ===
            lastActiveBars &&
            color ===
            lastSignalColor
        ) {

            return;

        }


        // Tallennetaan uusi tila.

        lastActiveBars =
            activeBars;

        lastSignalColor =
            color;


        // ====================================================
        // PÄIVITETÄÄN VAIN TARVITTAESSA
        // ====================================================

        for (
            let i = 0;
            i < allBars.length;
            i++
        ) {

            const newColor =
                i < activeBars
                    ? color
                    : "#555";


            if (
                allBars[i].style.background !==
                newColor
            ) {

                allBars[i].style.background =
                    newColor;

            }

        }


    } catch (
        error
    ) {

        console.log(
            "VERKKOYHTEYDEN TARKISTUS EPÄONNISTUI:",
            error
        );


        // ====================================================
        // VIRHETILA
        // ====================================================

        // Jos yhteyttä ei saada,
        // kaikki palkit punaisiksi.

        if (
            lastSignalColor !==
            "#FF3B30"
        ) {

            allBars.forEach(
                bar => {

                    bar.style.background =
                        "#FF3B30";

                }
            );

        }


        lastActiveBars =
            -1;

        lastSignalColor =
            "#FF3B30";


    } finally {

        networkCheckRunning =
            false;

    }

}


// ============================================================
// ENSIMMÄINEN TARKISTUS
// ============================================================

updateNetworkQuality();


// ============================================================
// TARKISTUS 30 SEKUNNIN VÄLEIN
// ============================================================

setInterval(
    updateNetworkQuality,
    30000
);


// ============================================================
// PÄIVITETÄÄN HETI, JOS YHTEYSTYYPPI MUUTTUU
// ============================================================

if (
    navigator.connection
) {

    navigator.connection.addEventListener(
        "change",
        updateNetworkQuality
    );

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
