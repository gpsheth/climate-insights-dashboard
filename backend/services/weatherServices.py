import requests
from .miscFuncServices import get_timezone, get_coordinates
from .dbServices import check_cache, save_to_cache
from .dataProcessing import calculate_yearly_averages, prepare_temperature_rain_correlation

def fetch_weather_data(location, start_date, end_date, hourly_vars, selected_charts):
    hourly = ','.join(hourly_vars)

    cached = check_cache(location, start_date, end_date, hourly)
    if cached:
        return process_charts(cached, selected_charts)

    coords = get_coordinates(location)
    if not coords:
        return {"error": "Unknown location"}
    
    lat, lon = coords["lat"], coords["lon"]
    timezone = get_timezone(lat, lon)

    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        'latitude': lat,
        'longitude': lon,
        'start_date': start_date,
        'end_date': end_date,
        'hourly': hourly,
        'timezone': timezone,
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        weather_data = response.json()

        processed_data = process_charts(weather_data, selected_charts)

        save_to_cache(location, start_date, end_date, weather_data, hourly)
        return weather_data
    except requests.exceptions.RequestException as e:
        print(f"Weather API error: {e}")
        return {"error": "Failed to fetch weather data"}

def process_charts(weather_data, selected_charts):
    """Process data for selected chart types"""
    if 'error' in weather_data or 'hourly' not in weather_data:
        return weather_data
    
    processed = {}
    hourly_data = weather_data['hourly']

    if 'Yearly Average Temperature Comparison' in selected_charts:
        processed['yearly_averages'] = calculate_yearly_averages(hourly_data)
    
    if 'Hourly Temperature and Rain Correlation' in selected_charts:
        processed['temp_rain_correlation'] = prepare_temperature_rain_correlation(hourly_data)

    processed['metadata'] = {
        'latitude': weather_data.get('latitude'),
        'longitude': weather_data.get('longitude'),
        'timezone': weather_data.get('timezone'),
        'start_date': weather_data.get('start_date'),
        'end_date': weather_data.get('end_date')
    }
    
    return processed