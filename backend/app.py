from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

LOCATION_COORDS = {
    "New York": {"lat": 40.7128, "lon": -74.0060},
    "London": {"lat": 51.5074, "lon": -0.1278}
}

def get_timezone(lat, lon):
    response = requests.get(f"https://api.open-meteo.com/v1/timezone?latitude={lat}&longitude={lon}")
    if response.status_code == 200:
        return response.json().get("timezone", "UTC")
    return "UTC"

def fetch_weather_data(lat, lon, start, end, timezone):
    url = f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}&start_date={start}&end_date={end}&hourly=temperature_2m&timezone={timezone}"
    response = requests.get(url)
    return response.json()

@app.route('/api/weather', methods=['POST'])
def handle_weather_request():
    data = request.get_json()
    location = data['location']
    start_date = data['startDate']
    end_date = data['endDate']

    coords = LOCATION_COORDS.get(location)
    if not coords:
        return jsonify({"error": "Unknown location"}), 400

    lat, lon = coords["lat"], coords["lon"]
    timezone = get_timezone(lat, lon)
    weather_data = fetch_weather_data(lat, lon, start_date, end_date, timezone)

    return jsonify(weather_data)

if __name__ == '__main__':
    app.run(debug=True)
