function updateTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    document.getElementById("time").textContent = `🕒 ${hours}:${minutes}`;
}

updateTime();
setInterval(updateTime, 1000);

document.getElementById("weather").textContent = "☀️ --°C";
document.getElementById("location").textContent = "📍 Haetaan...";
