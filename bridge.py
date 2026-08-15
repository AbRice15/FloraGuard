import serial
import json
import time
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

# ============================================
# FLORAGUARD PYTHON BRIDGE
# ============================================

# Change this later to your Arduino's COM port.
# Example: "COM3", "COM4", etc.
ARDUINO_PORT = "COM3"

# Arduino code uses Serial.begin(9600)
BAUD_RATE = 9600

SERVER_URL = "https://floraguard-ti4s.onrender.com/data"

# Latest sensor data
latest_data = {
    "temperature": 0,
    "humidity": 0,
    "soil": 0,
    "light": 0,
    "fan": 0,
    "pump": 0
}


# ============================================
# READ ARDUINO SERIAL DATA
# ============================================

def read_arduino():

    global latest_data

    while True:

        try:
            print("Connecting to Arduino...")

            arduino = serial.Serial(
                ARDUINO_PORT,
                BAUD_RATE,
                timeout=1
            )

            time.sleep(2)

            print("Arduino connected!")

            while True:

                line = arduino.readline().decode(
                    "utf-8",
                    errors="ignore"
                ).strip()

                if not line:
                    continue

                print("Arduino:", line)

                values = line.split(",")

                # We expect exactly:
                # Temperature,Humidity,Soil,Light,Fan,Pump

               if len(values) == 6:

    try:

        latest_data = {
            "temperature": float(values[0]),
            "humidity": float(values[1]),
            "soil": int(float(values[2])),
            "light": int(float(values[3])),
            "fan": int(values[4]),
            "pump": int(values[5])
        }

        try:
            response = requests.post(
                SERVER_URL,
                json=latest_data,
                timeout=5
            )

            print("Render status:", response.status_code)
            print("Render response:", response.text)

        except requests.RequestException as error:
            print("Could not send data to Render:", error)

    except ValueError:
        print("Invalid sensor data.")

        except serial.SerialException:

            print(
                "Arduino not connected yet. "
                "Waiting..."
            )

            time.sleep(3)

        except Exception as error:

            print("Error:", error)

            time.sleep(3)


# ============================================
# LOCAL SERVER
# ============================================

class FloraGuardHandler(BaseHTTPRequestHandler):

    def do_GET(self):

        if self.path == "/data":

            response = json.dumps(
                latest_data
            ).encode("utf-8")

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_header(
                "Access-Control-Allow-Origin",
                "*"
            )

            self.send_header(
                "Content-Length",
                str(len(response))
            )

            self.end_headers()

            self.wfile.write(response)

        else:

            self.send_response(404)
            self.end_headers()


# ============================================
# START SERVER
# ============================================

def start_server():

    server = HTTPServer(
        ("127.0.0.1", 5000),
        FloraGuardHandler
    )

    print(
        "FloraGuard bridge running at "
        "http://127.0.0.1:5000"
    )

    server.serve_forever()


# ============================================
# START EVERYTHING
# ============================================

arduino_thread = threading.Thread(
    target=read_arduino,
    daemon=True
)

arduino_thread.start()

start_server()
