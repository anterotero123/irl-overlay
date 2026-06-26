// KELLO

function updateClock() {

    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    document.getElementById("time").textContent =
        `🕒${hours}:${minutes}`;
}

setInterval(updateClock, 1000);
updateClock();


// AKKU

if (navigator.getBattery) {

    navigator.getBattery().then(function(battery) {

        function updateBattery() {

            const level = Math.round(battery.level * 100);

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


// GPS + SÄÄ

function getLocation() {

    if (!navigator.geolocation) {

        document.getElementById("city").textContent =
            "📍Ei GPS";

        return;
    }


    navigator.geolocation.getCurrentPosition(

        function(position) {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;


            // Paikkakunta

            fetch(
                `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=fi`
            )

            .then(response => response.json())

            .then(data => {

                let city =
                data.name || "Tuntematon";

                document.getElementById("city").textContent =
                    `📍${city}`;

            });


            // Sää

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

        },


        function() {

            document.getElementById("city").textContent =
                "📍GPS pois";

        }

    );

}


getLocation();
