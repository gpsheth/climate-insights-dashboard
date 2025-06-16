from flask import Flask, request, jsonify
from flask_cors import CORS
from services.dbServices import init_db, get_cached_data
from services.weatherServices import fetch_weather_data

app = Flask(__name__)
CORS(app)

init_db()

@app.route('/weather', methods=['POST'])
def handle_weather_request():
    data = request.get_json()
    location = data.get('location', '')
    start_date = data.get('startDate', '')
    end_date = data.get('endDate', '')
    hourly_vars = data.get('hourlyVars', [])
    selected_charts = data.get('selectedCharts', [])
    
    if not location or not start_date or not end_date:
        return jsonify({"error": "Missing required parameters"}), 400
    
    processed_data = fetch_weather_data(location, start_date, end_date, hourly_vars, selected_charts)
    
    if "error" in processed_data:
        return jsonify(processed_data), 400
    
    return jsonify(processed_data)

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
    app.run(host='0.0.0.0', , port=5000, debug=True)