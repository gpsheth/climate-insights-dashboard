from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

LOCATION_COORDS = {
    "New York": {"lat": 40.7128, "lon": -74.0060},
    "London": {"lat": 51.5074, "lon": -0.1278}
}

def get_coordinates(location):
    url = f"https://nominatim.openstreetmap.org/search"
    params = {
        'q': location,
        'format': 'json',
        'limit': 1
    }
    headers = {
        'User-Agent': 'climate-insights-dashboard (gpsheth@ncsu.edu)'
    }
    response = requests.get(url, params=params, headers=headers)
    data = response.json()
    if data:
        return { "lat": float(data[0]['lat']), "lon": float(data[0]['lon']) }
    return None

def get_timezone(lat, lon):
    url = f"https://api.open-meteo.com/v1/timezone"
    params = {
        'latitude': lat,
        'longitude': lon,
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get("timezone", "UTC")
    return "UTC"

def fetch_weather_data(lat, lon, start, end, timezone):
    url = f"https://archive-api.open-meteo.com/v1/archive"
    params = {
        'latitude': lat,
        'longitude': lon,
        'start_date': start,
        'end_date': end,
        'hourly': 'temperature_2m',
        'timezone': timezone,
    }
    response = requests.get(url, params=params)
    return response.json()

@app.route('/api/weather', methods=['POST'])
def handle_weather_request():
    data = request.get_json()
    location = data['location']
    start_date = data['startDate']
    end_date = data['endDate']

    coords = get_coordinates(location)
    if not coords:
        return jsonify({"error": "Unknown location"}), 400

    lat, lon = coords["lat"], coords["lon"]
    timezone = get_timezone(lat, lon)
    weather_data = fetch_weather_data(lat, lon, start_date, end_date, timezone)

    return jsonify(weather_data)

if __name__ == '__main__':
    app.run(debug=True)
