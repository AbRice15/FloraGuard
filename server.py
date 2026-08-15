from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Store the latest sensor readings
latest_data = {
    "temperature": 0,
    "humidity": 0,
    "soil": 0,
    "light": 0,
    "fan": 0,
    "pump": 0
}


@app.route("/data", methods=["GET"])
def get_data():
    return jsonify(latest_data)


@app.route("/data", methods=["POST"])
def receive_data():
    global latest_data

    data = request.get_json()

    if data:
        latest_data = data

    return jsonify({
        "status": "success",
        "data": latest_data
    })


@app.route("/")
def home():
    return "FloraGuard server is running!"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)