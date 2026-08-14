// ============================================
// FLORAGUARD - DEMO MODE
// ============================================

// Starting sensor values
let data = {
    temperature: 31.6,
    humidity: 46,
    soil: 62,
    light: 72
};

// Previous values for showing changes
let previous = {
    temperature: 31.6,
    humidity: 46,
    soil: 62,
    light: 72
};

// History for the graph
let history = {
    temperature: [],
    humidity: [],
    soil: [],
    light: [],
    time: []
};

const MAX_HISTORY = 20;


// ============================================
// HELPER FUNCTIONS
// ============================================

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function randomChange(amount) {
    return (Math.random() - 0.5) * amount;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


// ============================================
// UPDATE SENSOR VALUES
// ============================================

async function updateSensors() {

    try {

        // Try to get real Arduino data
        const response = await fetch(
            "http://127.0.0.1:5000/data"
        );

        if (!response.ok) {
            throw new Error("Bridge unavailable");
        }

        const realData = await response.json();

        // Save previous values
        previous.temperature = data.temperature;
        previous.humidity = data.humidity;
        previous.soil = data.soil;
        previous.light = data.light;

        // Use REAL Arduino readings
        data.temperature = realData.temperature;
        data.humidity = realData.humidity;
        data.soil = realData.soil;
        data.light = realData.light;
        data.fan = realData.fan;
        data.pump = realData.pump;

        // Update dashboard
        updateDashboard();
        updateHistory();
        drawGraph();

        console.log("REAL ARDUINO DATA:", realData);

    } catch (error) {

        // ----------------------------------------
        // DEMO MODE
        // ----------------------------------------

        previous.temperature = data.temperature;
        previous.humidity = data.humidity;
        previous.soil = data.soil;
        previous.light = data.light;

        // Simulate sensor movement
        data.temperature += randomChange(0.8);
        data.humidity += randomChange(2);
        data.soil += randomChange(2.5);
        data.light += randomChange(6);

        // Keep values realistic
        data.temperature = clamp(
            data.temperature,
            20,
            40
        );

        data.humidity = clamp(
            data.humidity,
            25,
            85
        );

        data.soil = clamp(
            data.soil,
            0,
            100
        );

        data.light = clamp(
            data.light,
            0,
            100
        );

        // Round values
        data.temperature =
            Number(data.temperature.toFixed(1));

        data.humidity =
            Number(data.humidity.toFixed(1));

        data.soil =
            Math.round(data.soil);

        data.light =
            Math.round(data.light);

        // Update dashboard
        updateDashboard();
        updateHistory();
        drawGraph();

        console.log("ACTIVE");
    }
}


// ============================================
// UPDATE DASHBOARD
// ============================================

function updateDashboard() {

    // ----------------------------------------
    // TEMPERATURE
    // ----------------------------------------

    setText("temperature", data.temperature.toFixed(1));

    const temperatureDifference =
        data.temperature - previous.temperature;

    setText(
        "temperatureChange",
        Math.abs(temperatureDifference).toFixed(1)
    );


    // ----------------------------------------
    // HUMIDITY
    // ----------------------------------------

    setText("humidity", data.humidity.toFixed(1));

    const humidityDifference =
        data.humidity - previous.humidity;

    setText(
        "humidityChange",
        Math.abs(humidityDifference).toFixed(1)
    );


    // ----------------------------------------
    // SOIL MOISTURE
    // ----------------------------------------

    setText("soilMoisture", data.soil);

    const soilBar = document.getElementById("soilBar");

    if (soilBar) {
        soilBar.style.width = data.soil + "%";
    }


    // ----------------------------------------
    // LIGHT
    // ----------------------------------------

    setText("lightLevel", data.light);

    const lightDifference =
        data.light - previous.light;

    setText(
        "lightChange",
        Math.abs(lightDifference)
    );


    // ----------------------------------------
    // FAN AUTOMATION
    // Arduino rule:
    // Temperature >= 34°C → FAN ON
    // ----------------------------------------

    const fanOn = data.temperature >= 34;

    updateFan(fanOn);


    // ----------------------------------------
    // PUMP AUTOMATION
    // Recommended FloraGuard rule:
    // Soil < 85% → PUMP ON
    // ----------------------------------------

    const pumpOn = data.soil < 85;

    updatePump(pumpOn);


    // ----------------------------------------
    // PLANT HEALTH
    // ----------------------------------------

    updatePlantHealth();


    // ----------------------------------------
    // WATER STATUS
    // ----------------------------------------

    const waterStatus = document.getElementById("waterStatus");

    if (waterStatus) {

        if (data.soil < 70) {
            waterStatus.textContent = "Needs Water";
            waterStatus.style.color = "#ff8b18";

        } else if (data.soil < 80) {
            waterStatus.textContent = "Moderate";
            waterStatus.style.color = "#ffc928";

        } else {
            waterStatus.textContent = "Adequate";
            waterStatus.style.color = "#28e36f";
        }
    }


    // ----------------------------------------
    // LAST UPDATE
    // ----------------------------------------

    const now = new Date();

    setText(
        "lastUpdate",
        now.toLocaleTimeString()
    );
}


// ============================================
// FAN
// ============================================

function updateFan(isOn) {

    const fanStatus = document.getElementById("fanStatus");
    const fanIndicator = document.getElementById("fanIndicator");

    if (isOn) {

        if (fanStatus) {
            fanStatus.textContent = "ON";
            fanStatus.style.color = "#28e36f";
        }

        if (fanIndicator) {
            fanIndicator.textContent = "ON";
            fanIndicator.className = "indicator on";
        }

    } else {

        if (fanStatus) {
            fanStatus.textContent = "OFF";
            fanStatus.style.color = "#888";
        }

        if (fanIndicator) {
            fanIndicator.textContent = "OFF";
            fanIndicator.className = "indicator off";
        }
    }
}


// ============================================
// WATER PUMP
// ============================================

function updatePump(isOn) {

    const pumpStatus = document.getElementById("pumpStatus");
    const pumpIndicator = document.getElementById("pumpIndicator");

    if (isOn) {

        if (pumpStatus) {
            pumpStatus.textContent = "ON";
            pumpStatus.style.color = "#8f8cff";
        }

        if (pumpIndicator) {
            pumpIndicator.textContent = "ON";
            pumpIndicator.className = "indicator on";
        }

    } else {

        if (pumpStatus) {
            pumpStatus.textContent = "OFF";
            pumpStatus.style.color = "#888";
        }

        if (pumpIndicator) {
            pumpIndicator.textContent = "OFF";
            pumpIndicator.className = "indicator off";
        }
    }
}


// ============================================
// PLANT HEALTH
// ============================================

function updatePlantHealth() {

    const health = document.getElementById("plantHealth");

    if (!health) return;


    if (
        data.soil < 25 ||
        data.temperature > 37 ||
        data.temperature < 15
    ) {

        health.textContent = "ATTENTION";
        health.style.color = "#ff8b18";

    } else if (
        data.soil < 35 ||
        data.temperature > 34
    ) {

        health.textContent = "FAIR";
        health.style.color = "#ffc928";

    } else {

        health.textContent = "GOOD";
        health.style.color = "#28e36f";
    }
}


// ============================================
// HISTORY
// ============================================

function updateHistory() {

    history.temperature.push(data.temperature);
    history.humidity.push(data.humidity);
    history.soil.push(data.soil);
    history.light.push(data.light);

    const now = new Date();

    history.time.push(
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        })
    );


    // Keep only the latest 20 readings
    if (history.temperature.length > MAX_HISTORY) {

        history.temperature.shift();
        history.humidity.shift();
        history.soil.shift();
        history.light.shift();
        history.time.shift();
    }
}


// ============================================
// GRAPH
// ============================================

const canvas = document.getElementById("historyGraph");
const ctx = canvas.getContext("2d");


function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0
    );

    drawGraph();
}


function drawGraph() {

    if (!canvas) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);


    // ----------------------------------------
    // GRAPH SETTINGS
    // ----------------------------------------

    const left = 45;
    const right = 15;
    const top = 15;
    const bottom = 30;

    const graphWidth = width - left - right;
    const graphHeight = height - top - bottom;


    // ----------------------------------------
    // GRID
    // ----------------------------------------

    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(70, 120, 100, 0.15)";

    for (let i = 0; i <= 5; i++) {

        const y =
            top + (graphHeight / 5) * i;

        ctx.beginPath();

        ctx.moveTo(left, y);
        ctx.lineTo(width - right, y);

        ctx.stroke();
    }


    // ----------------------------------------
    // Y-AXIS LABELS
    // ----------------------------------------

    ctx.fillStyle = "#849893";
    ctx.font = "11px Segoe UI";

    for (let i = 0; i <= 5; i++) {

        const value = 100 - i * 20;

        const y =
            top + (graphHeight / 5) * i + 4;

        ctx.fillText(
            value + "%",
            5,
            y
        );
    }


    // ----------------------------------------
    // DRAW LINE FUNCTION
    // ----------------------------------------

    function drawLine(values, lineColor) {

        if (values.length < 2) return;

        ctx.beginPath();

        values.forEach((value, index) => {

            const x =
                left +
                (index / (MAX_HISTORY - 1)) *
                graphWidth;

            const y =
                top +
                graphHeight -
                (value / 100) *
                graphHeight;

            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = lineColor;

        ctx.stroke();

        ctx.shadowBlur = 0;


        // Draw points

        values.forEach((value, index) => {

            const x =
                left +
                (index / (MAX_HISTORY - 1)) *
                graphWidth;

            const y =
                top +
                graphHeight -
                (value / 100) *
                graphHeight;

            ctx.beginPath();

            ctx.arc(x, y, 2.5, 0, Math.PI * 2);

            ctx.fillStyle = lineColor;

            ctx.fill();
        });
    }


    // ----------------------------------------
    // DRAW SENSOR LINES
    // ----------------------------------------

    drawLine(
        history.temperature.map(v => v * 2.5),
        "#ff8b18"
    );

    drawLine(
        history.humidity,
        "#22a8ff"
    );

    drawLine(
        history.soil,
        "#28e36f"
    );

    drawLine(
        history.light,
        "#ffc928"
    );


    // ----------------------------------------
    // TIME LABELS
    // ----------------------------------------

    ctx.fillStyle = "#849893";
    ctx.font = "10px Segoe UI";

    if (history.time.length > 0) {

        const step = Math.max(
            1,
            Math.floor(history.time.length / 5)
        );

        for (
            let i = 0;
            i < history.time.length;
            i += step
        ) {

            const x =
                left +
                (i / (MAX_HISTORY - 1)) *
                graphWidth;

            ctx.fillText(
                history.time[i],
                x - 15,
                height - 8
            );
        }
    }
}


// ============================================
// STARTING HISTORY
// ============================================

function createStartingHistory() {

    for (let i = 0; i < 12; i++) {

        history.temperature.push(
            data.temperature + randomChange(2)
        );

        history.humidity.push(
            data.humidity + randomChange(5)
        );

        history.soil.push(
            data.soil + randomChange(5)
        );

        history.light.push(
            data.light + randomChange(10)
        );

        const fakeTime = new Date(
            Date.now() - (12 - i) * 2000
        );

        history.time.push(
            fakeTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            })
        );
    }
}


// ============================================
// WINDOW RESIZE
// ============================================

window.addEventListener(
    "resize",
    resizeCanvas
);


// ============================================
// INITIALIZE
// ============================================

createStartingHistory();

updateDashboard();

resizeCanvas();


// ============================================
// UPDATE EVERY 2 SECONDS
// Same interval as the Arduino code
// ============================================

setInterval(
    updateSensors,
    2000
);