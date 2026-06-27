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

function getLocation(){

    const cityElement = document.getElementById("city");

    cityElement.textContent =
    "📍Haetaan GPS...";


    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(

            position => {

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;


                fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=fi`
                )

                .then(response => response.json())

                .then(data => {

                    const address = data.address;

                    const city =
                    address.city ||
                    address.town ||
                    address.village ||
                    "Tuntematon";


                    cityElement.textContent =
                    `📍${city}`;


                    loadWeather(
                        lat,
                        lon,
                        city
                    );

                });

            },

            error => {

                // GPS epäonnistui → käytetään varalla IP-sijaintia

                getLocationByIP();

            },

            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 60000
            }

        );


    } else {

        getLocationByIP();

    }

}


// VARASIJANTI IP:LLÄ

function getLocationByIP(){

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

    .catch(()=>{

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
