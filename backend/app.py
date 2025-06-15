from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import sqlite3
import json

app = Flask(__name__)
CORS(app)

def init_db():
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS weather_cache (
            location TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            hourly TEXT NOT NULL,
            data TEXT NOT NULL,
            PRIMARY KEY (location, start_date, end_date, hourly)
        )
    ''')
    conn.commit()
    conn.close()
    print(f"weather_cache.db initialized successfully.")

init_db()

def check_cache(location, start_date, end_date, hourly):
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        SELECT data FROM weather_cache
        WHERE location=? AND start_date=? AND end_date=? AND hourly=?
    ''', (location, start_date, end_date, hourly))
    row = c.fetchone()
    conn.close()
    return json.loads(row[0]) if row else None

def save_to_cache(location, start_date, end_date, data, hourly):
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO weather_cache (location, start_date, end_date, data, hourly)
        VALUES (?, ?, ?, ?, ?)
    ''', (location, start_date, end_date, json.dumps(data), hourly))
    conn.commit()
    conn.close()

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

def fetch_weather_data(lat, lon, start, end, timezone, hourly):
    url = f"https://archive-api.open-meteo.com/v1/archive"
    params = {
        'latitude': lat,
        'longitude': lon,
        'start_date': start,
        'end_date': end,
        'hourly': hourly,
        'timezone': timezone,
    }
    response = requests.get(url, params=params)
    print(response.json())
    return response.json()

@app.route('/weather', methods=['POST'])
def handle_weather_request():
    data = request.get_json()
    location = data['location']
    start_date = data['startDate']
    end_date = data['endDate']
    hourly = data['hourly']

    cached = check_cache(location, start_date, end_date, hourly)
    if cached:
        return jsonify(cached)

    coords = get_coordinates(location)
    if not coords:
        return jsonify({"error": "Unknown location"}), 400

    lat, lon = coords["lat"], coords["lon"]
    timezone = get_timezone(lat, lon)
    weather_data = fetch_weather_data(lat, lon, start_date, end_date, timezone, hourly)

    save_to_cache(location, start_date, end_date, weather_data, hourly)

    return jsonify(weather_data)

def get_cached_data(location, start_date, end_date):
    conn = sqlite3.connect('weather_cache.db')
    c = conn.cursor()
    c.execute('''
        SELECT data FROM weather_cache
        WHERE location=? AND start_date=? AND end_date=?
    ''', (location, start_date, end_date))
    row = c.fetchone()
    conn.close()
    return json.loads(row[0]) if row else None

@app.route('/get-cached-data', methods=['POST'])
def get_cached():
    data = request.get_json()
    location = data.get('location')
    start_date = data.get('startDate')
    end_date = data.get('endDate')

    if not location or not start_date or not end_date:
        return jsonify({"error": "Missing fields"}), 400

    cached_data = get_cached_data(location, start_date, end_date)
    if cached_data:
        return jsonify(cached_data)
    else:
        return jsonify({"error": "No cached data found"}), 404

if __name__ == '__main__':
    app.run(debug=True)
