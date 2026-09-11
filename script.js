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
    "";

        const countryCode =
    (address.country_code || "").toLowerCase();

let countryFlag = "🌍";

if (countryCode === "fi") {
    countryFlag = "🇫🇮";
}

else if (countryCode === "ee") {
    countryFlag = "🇪🇪";
}

else if (countryCode === "se") {
    countryFlag = "🇸🇪";
}

else if (countryCode === "no") {
    countryFlag = "🇳🇴";
}

else if (countryCode === "dk") {
    countryFlag = "🇩🇰";
}

else if (countryCode === "pl") {
    countryFlag = "🇵🇱";
}

else if (countryCode === "de") {
    countryFlag = "🇩🇪";
}

else if (countryCode === "fr") {
    countryFlag = "🇫🇷";
}

else if (countryCode === "es") {
    countryFlag = "🇪🇸";
}

else if (countryCode === "it") {
    countryFlag = "🇮🇹";
}

else if (countryCode === "gb") {
    countryFlag = "🇬🇧";
}

else if (countryCode === "th") {
    countryFlag = "🇹🇭";
}

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
    `${countryFlag} ${city}`;


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

let promoActive = false;
let socialIndex = 0;

function updateSocialBanner() {

    // Jos promo on näkyvissä, ei vaihdeta somea
    if (promoActive || brandActive) return;

    const icon = document.getElementById("social-icon");
    const text = document.getElementById("social-text");
    const row = document.getElementById("social-row");

    row.style.animation = "socialCardFlip .7s ease";

    setTimeout(() => {

        socialIndex =
            (socialIndex + 1) % socials.length;

        icon.src = socials[socialIndex].icon;

        icon.style.animation = "none";
        void icon.offsetWidth;
        icon.style.animation =
            "socialFlip .45s ease, socialPulse .55s ease";

        icon.alt = socials[socialIndex].text;
        text.textContent = socials[socialIndex].text;

        row.style.opacity = "0.95";

    }, 350);

    setTimeout(() => {
        row.style.animation = "";
    }, 700);

}

function showPromo() {

    if (promoActive || brandActive) return;

    promoActive = true;

    const social = document.getElementById("social-row");
    const promo = document.getElementById("promo-card");
    const overlay = document.getElementById("overlay");

    // Piilotetaan somebanneri
    social.style.opacity = "0";
    social.style.transform = "translateY(10px)";

    // Näytetään promo pienen viiveen jälkeen
    setTimeout(() => {

        promo.classList.add("show");

overlay.style.minHeight = "165px";
        }, 300);

    // Piilotetaan promo
    setTimeout(() => {

        promo.classList.remove("show");

overlay.style.minHeight = "65px";

        // Tuodaan somebanneri takaisin
        setTimeout(() => {

            social.style.opacity = "0.95";
            social.style.transform = "translateY(0px)";

            promoActive = false;

        }, 500);

    }, 8300);

}

// Vaihda 15 sekunnin välein

setInterval(updateSocialBanner, 15000);

setInterval(showPromo, 300000);

// ===== ANTEROLIVE-BRÄNDIEVENTTI =====

let brandActive = false;

const BRAND_TEST_MODE = true;

const BRAND_MIN_DELAY = 8 * 60 * 1000;
const BRAND_MAX_DELAY = 15 * 60 * 1000;

function getBrandDelay() {

    if (BRAND_TEST_MODE) {
        return 10000;
    }

    return BRAND_MIN_DELAY +
        Math.random() *
        (BRAND_MAX_DELAY - BRAND_MIN_DELAY);
}


// ============================================================
// LUODAAN ANTEROLIVE-LOGO
// ============================================================

function createBrandCard() {

    if (document.getElementById("brand-card")) return;

    const card = document.createElement("div");
    card.id = "brand-card";

    card.innerHTML = `
        <svg
            class="brand-svg"
            viewBox="0 0 520 90"
            aria-hidden="true">

            <path
                class="brand-purple"
                pathLength="1000"
                d="
                M 142.64 54.35 L 128.88 54.35 L 126.71 60.56 L 117.86 60.56 L 130.50 26.44 L 140.99 26.44 L 153.63 60.56 L 144.79 60.56 L 142.64 54.35 Z
                M 131.08 48.01 L 140.42 48.01 L 135.76 34.44 L 131.08 48.01 Z
                M 183.51 44.98 L 183.51 60.56 L 175.29 60.56 L 175.29 58.02 L 175.29 48.63 Q 175.29 45.32 175.14 44.06 Q 175.00 42.81 174.63 42.21 Q 174.15 41.41 173.32 40.96 Q 172.50 40.52 171.45 40.52 Q 168.89 40.52 167.43 42.50 Q 165.96 44.47 165.96 47.97 L 165.96 60.56 L 157.79 60.56 L 157.79 34.97 L 165.96 34.97 L 165.96 38.71 Q 167.81 36.47 169.89 35.41 Q 171.98 34.35 174.49 34.35 Q 178.92 34.35 181.22 37.07 Q 183.51 39.79 183.51 44.98 Z
                M 200.04 27.70 L 200.04 34.97 L 208.47 34.97 L 208.47 40.82 L 200.04 40.82 L 200.04 51.67 Q 200.04 53.45 200.74 54.08 Q 201.45 54.71 203.56 54.71 L 207.76 54.71 L 207.76 60.56 L 200.74 60.56 Q 195.90 60.56 193.88 58.54 Q 191.86 56.52 191.86 51.67 L 191.86 40.82 L 187.79 40.82 L 187.79 34.97 L 191.86 34.97 L 191.86 27.70 L 200.04 27.70 Z
                M 239.02 47.70 L 239.02 50.02 L 239.02 51.13 Q 239.02 53.32 240.13 54.31 Q 241.24 55.30 243.70 55.30 Q 246.16 55.30 247.26 54.31 Q 248.36 53.32 248.36 51.13 L 248.36 50.02 L 248.36 47.70 Q 248.36 45.51 247.26 44.52 Q 246.16 43.53 243.70 43.53 Q 241.24 43.53 240.13 44.52 Q 239.02 45.51 239.02 47.70 Z
                M 230.85 47.70 Q 230.85 41.41 234.18 37.88 Q 237.51 34.35 243.70 34.35 Q 249.89 34.35 253.22 37.88 Q 256.55 41.41 256.55 47.70 L 256.55 47.83 Q 256.55 54.13 253.22 57.66 Q 249.89 61.19 243.70 61.19 Q 237.51 61.19 234.18 57.66 Q 230.85 54.13 230.85 47.83 Z
                M 275.25 34.35 Q 278.93 34.35 281.03 37.08 Q 283.13 39.81 283.13 44.98 L 283.13 60.56 L 274.96 60.56 L 274.96 45.12 Q 274.96 42.35 274.23 41.34 Q 273.50 40.33 271.56 40.33 Q 269.16 40.33 267.86 42.13 Q 266.56 43.93 266.56 47.32 L 266.56 60.56 L 258.39 60.56 L 258.39 34.97 L 266.56 34.97 L 266.56 38.71 Q 268.41 36.47 270.49 35.41 Q 272.57 34.35 275.25 34.35 Z
                M 293.33 27.70 L 293.33 34.97 L 301.76 34.97 L 301.76 40.82 L 293.33 40.82 L 293.33 51.67 Q 293.33 53.45 294.03 54.08 Q 294.74 54.71 296.85 54.71 L 301.05 54.71 L 301.05 60.56 L 294.03 60.56 Q 289.19 60.56 287.17 58.54 Q 285.15 56.52 285.15 51.67 L 285.15 40.82 L 281.08 40.82 L 281.08 34.97 L 285.15 34.97 L 285.15 27.70 Z
                M 313.54 34.97 L 313.54 38.71 Q 315.39 36.47 317.47 35.41 Q 319.55 34.35 322.06 34.35 Q 326.49 34.35 328.79 37.07 Q 331.09 39.79 331.09 44.98 L 331.09 60.56 L 322.92 60.56 L 322.92 45.12 Q 322.92 42.35 322.19 41.34 Q 321.46 40.33 319.52 40.33 Q 317.12 40.33 315.82 42.13 Q 314.52 43.93 314.52 47.32 L 314.52 60.56 L 306.35 60.56 L 306.35 34.97 Z
                M 337.10 34.97 L 345.27 34.97 L 345.27 60.56 L 337.10 60.56 Z
                M 337.10 25.00 L 345.27 25.00 L 345.27 31.87 L 337.10 31.87 Z
                M 363.82 34.35 Q 368.25 34.35 370.55 37.07 Q 372.85 39.79 372.85 44.98 L 372.85 60.56 L 364.68 60.56 L 364.68 45.12 Q 364.68 42.35 363.95 41.34 Q 363.22 40.33 361.28 40.33 Q 358.88 40.33 357.58 42.13 Q 356.28 43.93 356.28 47.32 L 356.28 60.56 L 348.11 60.56 L 348.11 34.97 L 356.28 34.97 L 356.28 38.71 Q 358.13 36.47 360.21 35.41 Q 362.29 34.35 363.82 34.35 Z
                M 394.56 44.98 L 394.56 60.56 L 386.39 60.56 L 386.39 58.02 L 386.39 48.63 Q 386.39 45.32 386.24 44.06 Q 386.10 42.81 385.73 42.21 Q 385.25 41.41 384.42 40.96 Q 383.60 40.52 382.55 40.52 Q 379.99 40.52 378.53 42.50 Q 377.06 44.47 377.06 47.97 L 377.06 60.56 L 368.89 60.56 L 368.89 34.97 L 377.06 34.97 L 377.06 38.71 Q 378.91 36.47 380.99 35.41 Q 383.08 34.35 385.59 34.35 Q 390.02 34.35 392.32 37.07 Q 394.56 39.79 394.56 44.98 Z
                " />

            <path
                class="brand-electric-glow"
                pathLength="1000"
                d="
                M 142.64 54.35 L 128.88 54.35 L 126.71 60.56 L 117.86 60.56 L 130.50 26.44 L 140.99 26.44 L 153.63 60.56 L 144.79 60.56 L 142.64 54.35 Z
                M 131.08 48.01 L 140.42 48.01 L 135.76 34.44 L 131.08 48.01 Z
                M 183.51 44.98 L 183.51 60.56 L 175.29 60.56 L 175.29 58.02 L 175.29 48.63 Q 175.29 45.32 175.14 44.06 Q 175.00 42.81 174.63 42.21 Q 174.15 41.41 173.32 40.96 Q 172.50 40.52 171.45 40.52 Q 168.89 40.52 167.43 42.50 Q 165.96 44.47 165.96 47.97 L 165.96 60.56 L 157.79 60.56 L 157.79 34.97 L 165.96 34.97 L 165.96 38.71 Q 167.81 36.47 169.89 35.41 Q 171.98 34.35 174.49 34.35 Q 178.92 34.35 181.22 37.07 Q 183.51 39.79 183.51 44.98 Z
                M 200.04 27.70 L 200.04 34.97 L 208.47 34.97 L 208.47 40.82 L 200.04 40.82 L 200.04 51.67 Q 200.04 53.45 200.74 54.08 Q 201.45 54.71 203.56 54.71 L 207.76 54.71 L 207.76 60.56 L 200.74 60.56 Q 195.90 60.56 193.88 58.54 Q 191.86 56.52 191.86 51.67 L 191.86 40.82 L 187.79 40.82 L 187.79 34.97 L 191.86 34.97 L 191.86 27.70 Z
                M 239.02 47.70 L 239.02 50.02 L 239.02 51.13 Q 239.02 53.32 240.13 54.31 Q 241.24 55.30 243.70 55.30 Q 246.16 55.30 247.26 54.31 Q 248.36 53.32 248.36 51.13 L 248.36 50.02 L 248.36 47.70 Q 248.36 45.51 247.26 44.52 Q 246.16 43.53 243.70 43.53 Q 241.24 43.53 240.13 44.52 Q 239.02 45.51 239.02 47.70 Z
                M 230.85 47.70 Q 230.85 41.41 234.18 37.88 Q 237.51 34.35 243.70 34.35 Q 249.89 34.35 253.22 37.88 Q 256.55 41.41 256.55 47.70 L 256.55 47.83 Q 256.55 54.13 253.22 57.66 Q 249.89 61.19 243.70 61.19 Q 237.51 61.19 234.18 57.66 Q 230.85 54.13 230.85 47.83 Z
                M 275.25 34.35 Q 278.93 34.35 281.03 37.08 Q 283.13 39.81 283.13 44.98 L 283.13 60.56 L 274.96 60.56 L 274.96 45.12 Q 274.96 42.35 274.23 41.34 Q 273.50 40.33 271.56 40.33 Q 269.16 40.33 267.86 42.13 Q 266.56 43.93 266.56 47.32 L 266.56 60.56 L 258.39 60.56 L 258.39 34.97 L 266.56 34.97 L 266.56 38.71 Q 268.41 36.47 270.49 35.41 Q 272.57 34.35 275.25 34.35 Z
                M 293.33 27.70 L 293.33 34.97 L 301.76 34.97 L 301.76 40.82 L 293.33 40.82 L 293.33 51.67 Q 293.33 53.45 294.03 54.08 Q 294.74 54.71 296.85 54.71 L 301.05 54.71 L 301.05 60.56 L 294.03 60.56 Q 289.19 60.56 287.17 58.54 Q 285.15 56.52 285.15 51.67 L 285.15 40.82 L 281.08 40.82 L 281.08 34.97 L 285.15 34.97 L 285.15 27.70 Z
                M 313.54 34.97 L 313.54 38.71 Q 315.39 36.47 317.47 35.41 Q 319.55 34.35 322.06 34.35 Q 326.49 34.35 328.79 37.07 Q 331.09 39.79 331.09 44.98 L 331.09 60.56 L 322.92 60.56 L 322.92 45.12 Q 322.92 42.35 322.19 41.34 Q 321.46 40.33 319.52 40.33 Q 317.12 40.33 315.82 42.13 Q 314.52 43.93 314.52 47.32 L 314.52 60.56 L 306.35 60.56 L 306.35 34.97 Z
                M 337.10 34.97 L 345.27 34.97 L 345.27 60.56 L 337.10 60.56 Z
                M 337.10 25.00 L 345.27 25.00 L 345.27 31.87 L 337.10 31.87 Z
                M 363.82 34.35 Q 368.25 34.35 370.55 37.07 Q 372.85 39.79 372.85 44.98 L 372.85 60.56 L 364.68 60.56 L 364.68 45.12 Q 364.68 42.35 363.95 41.34 Q 363.22 40.33 361.28 40.33 Q 358.88 40.33 357.58 42.13 Q 356.28 43.93 356.28 47.32 L 356.28 60.56 L 348.11 60.56 L 348.11 34.97 L 356.28 34.97 L 356.28 38.71 Q 358.13 36.47 360.21 35.41 Q 362.29 34.35 363.82 34.35 Z
                M 394.56 44.98 L 394.56 60.56 L 386.39 60.56 L 386.39 58.02 L 386.39 48.63 Q 386.39 45.32 386.24 44.06 Q 386.10 42.81 385.73 42.21 Q 385.25 41.41 384.42 40.96 Q 383.60 40.52 382.55 40.52 Q 379.99 40.52 378.53 42.50 Q 377.06 44.47 377.06 47.97 L 377.06 60.56 L 368.89 60.56 L 368.89 34.97 L 377.06 34.97 L 377.06 38.71 Q 378.91 36.47 380.99 35.41 Q 383.08 34.35 385.59 34.35 Q 390.02 34.35 392.32 37.07 Q 394.56 39.79 394.56 44.98 Z
                " />

            <path
                class="brand-electric"
                pathLength="1000"
                d="
                M 142.64 54.35 L 128.88 54.35 L 126.71 60.56 L 117.86 60.56 L 130.50 26.44 L 140.99 26.44 L 153.63 60.56 L 144.79 60.56 L 142.64 54.35 Z
                M 131.08 48.01 L 140.42 48.01 L 135.76 34.44 L 131.08 48.01 Z
                M 183.51 44.98 L 183.51 60.56 L 175.29 60.56 L 175.29 58.02 L 175.29 48.63 Q 175.29 45.32 175.14 44.06 Q 175.00 42.81 174.63 42.21 Q 174.15 41.41 173.32 40.96 Q 172.50 40.52 171.45 40.52 Q 168.89 40.52 167.43 42.50 Q 165.96 44.47 165.96 47.97 L 165.96 60.56 L 157.79 60.56 L 157.79 34.97 L 165.96 34.97 L 165.96 38.71 Q 167.81 36.47 169.89 35.41 Q 171.98 34.35 174.49 34.35 Q 178.92 34.35 181.22 37.07 Q 183.51 39.79 183.51 44.98 Z
                M 200.04 27.70 L 200.04 34.97 L 208.47 34.97 L 208.47 40.82 L 200.04 40.82 L 200.04 51.67 Q 200.04 53.45 200.74 54.08 Q 201.45 54.71 203.56 54.71 L 207.76 54.71 L 207.76 60.56 L 200.74 60.56 Q 195.90 60.56 193.88 58.54 Q 191.86 56.52 191.86 51.67 L 191.86 40.82 L 187.79 40.82 L 187.79 34.97 L 191.86 34.97 L 191.86 27.70 Z
                M 239.02 47.70 L 239.02 50.02 L 239.02 51.13 Q 239.02 53.32 240.13 54.31 Q 241.24 55.30 243.70 55.30 Q 246.16 55.30 247.26 54.31 Q 248.36 53.32 248.36 51.13 L 248.36 50.02 L 248.36 47.70 Q 248.36 45.51 247.26 44.52 Q 246.16 43.53 243.70 43.53 Q 241.24 43.53 240.13 44.52 Q 239.02 45.51 239.02 47.70 Z
                M 230.85 47.70 Q 230.85 41.41 234.18 37.88 Q 237.51 34.35 243.70 34.35 Q 249.89 34.35 253.22 37.88 Q 256.55 41.41 256.55 47.70 L 256.55 47.83 Q 256.55 54.13 253.22 57.66 Q 249.89 61.19 243.70 61.19 Q 237.51 61.19 234.18 57.66 Q 230.85 54.13 230.85 47.83 Z
                M 275.25 34.35 Q 278.93 34.35 281.03 37.08 Q 283.13 39.81 283.13 44.98 L 283.13 60.56 L 274.96 60.56 L 274.96 45.12 Q 274.96 42.35 274.23 41.34 Q 273.50 40.33 271.56 40.33 Q 269.16 40.33 267.86 42.13 Q 266.56 43.93 266.56 47.32 L 266.56 60.56 L 258.39 60.56 L 258.39 34.97 L 266.56 34.97 L 266.56 38.71 Q 268.41 36.47 270.49 35.41 Q 272.57 34.35 275.25 34.35 Z
                M 293.33 27.70 L 293.33 34.97 L 301.76 34.97 L 301.76 40.82 L 293.33 40.82 L 293.33 51.67 Q 293.33 53.45 294.03 54.08 Q 294.74 54.71 296.85 54.71 L 301.05 54.71 L 301.05 60.56 L 294.03 60.56 Q 289.19 60.56 287.17 58.54 Q 285.15 56.52 285.15 51.67 L 285.15 40.82 L 281.08 40.82 L 281.08 34.97 L 285.15 34.97 L 285.15 27.70 Z
                M 313.54 34.97 L 313.54 38.71 Q 315.39 36.47 317.47 35.41 Q 319.55 34.35 322.06 34.35 Q 326.49 34.35 328.79 37.07 Q 331.09 39.79 331.09 44.98 L 331.09 60.56 L 322.92 60.56 L 322.92 45.12 Q 322.92 42.35 322.19 41.34 Q 321.46 40.33 319.52 40.33 Q 317.12 40.33 315.82 42.13 Q 314.52 43.93 314.52 47.32 L 314.52 60.56 L 306.35 60.56 L 306.35 34.97 Z
                M 337.10 34.97 L 345.27 34.97 L 345.27 60.56 L 337.10 60.56 Z
                M 337.10 25.00 L 345.27 25.00 L 345.27 31.87 L 337.10 31.87 Z
                M 363.82 34.35 Q 368.25 34.35 370.55 37.07 Q 372.85 39.79 372.85 44.98 L 372.85 60.56 L 364.68 60.56 L 364.68 45.12 Q 364.68 42.35 363.95 41.34 Q 363.22 40.33 361.28 40.33 Q 358.88 40.33 357.58 42.13 Q 356.28 43.93 356.28 47.32 L 356.28 60.56 L 348.11 60.56 L 348.11 34.97 L 356.28 34.97 L 356.28 38.71 Q 358.13 36.47 360.21 35.41 Q 362.29 34.35 363.82 34.35 Z
                M 394.56 44.98 L 394.56 60.56 L 386.39 60.56 L 386.39 58.02 L 386.39 48.63 Q 386.39 45.32 386.24 44.06 Q 386.10 42.81 385.73 42.21 Q 385.25 41.41 384.42 40.96 Q 383.60 40.52 382.55 40.52 Q 379.99 40.52 378.53 42.50 Q 377.06 44.47 377.06 47.97 L 377.06 60.56 L 368.89 60.56 L 368.89 34.97 L 377.06 34.97 L 377.06 38.71 Q 378.91 36.47 380.99 35.41 Q 383.08 34.35 385.59 34.35 Q 390.02 34.35 392.32 37.07 Q 394.56 39.79 394.56 44.98 Z
                " />

            <path
                class="brand-base"
                d="
                M 142.64 54.35 L 128.88 54.35 L 126.71 60.56 L 117.86 60.56 L 130.50 26.44 L 140.99 26.44 L 153.63 60.56 L 144.79 60.56 L 142.64 54.35 Z
                M 131.08 48.01 L 140.42 48.01 L 135.76 34.44 L 131.08 48.01 Z
                M 183.51 44.98 L 183.51 60.56 L 175.29 60.56 L 175.29 58.02 L 175.29 48.63 Q 175.29 45.32 175.14 44.06 Q 175.00 42.81 174.63 42.21 Q 174.15 41.41 173.32 40.96 Q 172.50 40.52 171.45 40.52 Q 168.89 40.52 167.43 42.50 Q 165.96 44.47 165.96 47.97 L 165.96 60.56 L 157.79 60.56 L 157.79 34.97 L 165.96 34.97 L 165.96 38.71 Q 167.81 36.47 169.89 35.41 Q 171.98 34.35 174.49 34.35 Q 178.92 34.35 181.22 37.07 Q 183.51 39.79 183.51 44.98 Z
                M 200.04 27.70 L 200.04 34.97 L 208.47 34.97 L 208.47 40.82 L 200.04 40.82 L 200.04 51.67 Q 200.04 53.45 200.74 54.08 Q 201.45 54.71 203.56 54.71 L 207.76 54.71 L 207.76 60.56 L 200.74 60.56 Q 195.90 60.56 193.88 58.54 Q 191.86 56.52 191.86 51.67 L 191.86 40.82 L 187.79 40.82 L 187.79 34.97 L 191.86 34.97 L 191.86 27.70 Z
                M 239.02 47.70 L 239.02 50.02 L 239.02 51.13 Q 239.02 53.32 240.13 54.31 Q 241.24 55.30 243.70 55.30 Q 246.16 55.30 247.26 54.31 Q 248.36 53.32 248.36 51.13 L 248.36 50.02 L 248.36 47.70 Q 248.36 45.51 247.26 44.52 Q 246.16 43.53 243.70 43.53 Q 241.24 43.53 240.13 44.52 Q 239.02 45.51 239.02 47.70 Z
                M 230.85 47.70 Q 230.85 41.41 234.18 37.88 Q 237.51 34.35 243.70 34.35 Q 249.89 34.35 253.22 37.88 Q 256.55 41.41 256.55 47.70 L 256.55 47.83 Q 256.55 54.13 253.22 57.66 Q 249.89 61.19 243.70 61.19 Q 237.51 61.19 234.18 57.66 Q 230.85 54.13 230.85 47.83 Z
                M 275.25 34.35 Q 278.93 34.35 281.03 37.08 Q 283.13 39.81 283.13 44.98 L 283.13 60.56 L 274.96 60.56 L 274.96 45.12 Q 274.96 42.35 274.23 41.34 Q 273.50 40.33 271.56 40.33 Q 269.16 40.33 267.86 42.13 Q 266.56 43.93 266.56 47.32 L 266.56 60.56 L 258.39 60.56 L 258.39 34.97 L 266.56 34.97 L 266.56 38.71 Q 268.41 36.47 270.49 35.41 Q 272.57 34.35 275.25 34.35 Z
                M 293.33 27.70 L 293.33 34.97 L 301.76 34.97 L 301.76 40.82 L 293.33 40.82 L 293.33 51.67 Q 293.33 53.45 294.03 54.08 Q 294.74 54.71 296.85 54.71 L 301.05 54.71 L 301.05 60.56 L 294.03 60.56 Q 289.19 60.56 287.17 58.54 Q 285.15 56.52 285.15 51.67 L 285.15 40.82 L 281.08 40.82 L 281.08 34.97 L 285.15 34.97 L 285.15 27.70 Z
                M 313.54 34.97 L 313.54 38.71 Q 315.39 36.47 317.47 35.41 Q 319.55 34.35 322.06 34.35 Q 326.49 34.35 328.79 37.07 Q 331.09 39.79 331.09 44.98 L 331.09 60.56 L 322.92 60.56 L 322.92 45.12 Q 322.92 42.35 322.19 41.34 Q 321.46 40.33 319.52 40.33 Q 317.12 40.33 315.82 42.13 Q 314.52 43.93 314.52 47.32 L 314.52 60.56 L 306.35 60.56 L 306.35 34.97 Z
                M 337.10 34.97 L 345.27 34.97 L 345.27 60.56 L 337.10 60.56 Z
                M 337.10 25.00 L 345.27 25.00 L 345.27 31.87 L 337.10 31.87 Z
                M 363.82 34.35 Q 368.25 34.35 370.55 37.07 Q 372.85 39.79 372.85 44.98 L 372.85 60.56 L 364.68 60.56 L 364.68 45.12 Q 364.68 42.35 363.95 41.34 Q 363.22 40.33 361.28 40.33 Q 358.88 40.33 357.58 42.13 Q 356.28 43.93 356.28 47.32 L 356.28 60.56 L 348.11 60.56 L 348.11 34.97 L 356.28 34.97 L 356.28 38.71 Q 358.13 36.47 360.21 35.41 Q 362.29 34.35 363.82 34.35 Z
                M 394.56 44.98 L 394.56 60.56 L 386.39 60.56 L 386.39 58.02 L 386.39 48.63 Q 386.39 45.32 386.24 44.06 Q 386.10 42.81 385.73 42.21 Q 385.25 41.41 384.42 40.96 Q 383.60 40.52 382.55 40.52 Q 379.99 40.52 378.53 42.50 Q 377.06 44.47 377.06 47.97 L 377.06 60.56 L 368.89 60.56 L 368.89 34.97 L 377.06 34.97 L 377.06 38.71 Q 378.91 36.47 380.99 35.41 Q 383.08 34.35 385.59 34.35 Q 390.02 34.35 392.32 37.07 Q 394.56 39.79 394.56 44.98 Z
                " />

        </svg>
    `;

    document.getElementById("overlay").appendChild(card);
}


// ============================================================
// NÄYTETÄÄN ANTEROLIVE
// ============================================================

function showBrandEvent() {

    if (brandActive || promoActive) {
        scheduleBrandEvent();
        return;
    }

    brandActive = true;

    createBrandCard();

    const overlay =
        document.getElementById("overlay");

    const top =
        document.getElementById("overlay-top");

    const social =
        document.getElementById("social-row");

    const brand =
        document.getElementById("brand-card");


    // --------------------------------------------------------
    // PIILOTETAAN NORMAALIT TIEDOT
    // --------------------------------------------------------

    top.style.opacity = "0";
    top.style.transform =
        "translateY(-8px)";


    // --------------------------------------------------------
    // PIILOTETAAN SOME
    // --------------------------------------------------------

    social.style.opacity = "0";
    social.style.transform =
        "translateY(10px)";


    // --------------------------------------------------------
    // KASVATETAAN OVERLAYTA
    // --------------------------------------------------------

    overlay.style.minHeight = "135px";


    // --------------------------------------------------------
    // LOGO SISÄÄN
    // --------------------------------------------------------

    setTimeout(() => {

        brand.classList.remove("hide");

        void brand.offsetWidth;

        brand.classList.add("show");

    }, 250);


    // --------------------------------------------------------
    // LOGO NÄKYVISSÄ
    // --------------------------------------------------------

    setTimeout(() => {

        brand.classList.remove("show");

        brand.classList.add("hide");

        overlay.style.minHeight = "65px";


        // ----------------------------------------------------
        // PALAUTETAAN NORMAALI NÄKYMÄ
        // ----------------------------------------------------

        setTimeout(() => {

            top.style.opacity = "1";
            top.style.transform =
                "translateY(0)";

            social.style.opacity = "0.95";
            social.style.transform =
                "translateY(0)";

            brandActive = false;

            scheduleBrandEvent();

        }, 650);

    }, 7500);
}


// ============================================================
// AJASTUS
// ============================================================

function scheduleBrandEvent() {

    setTimeout(() => {

        showBrandEvent();

    }, getBrandDelay());
}


// ============================================================
// KÄYNNISTYS
// ============================================================

createBrandCard();

scheduleBrandEvent();
