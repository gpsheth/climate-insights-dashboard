import requests

def get_coordinates(location):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': location,
        'format': 'json',
        'limit': 1
    }
    headers = {
        'User-Agent': 'climate-insights-dashboard (gpsheth@ncsu.edu)'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        data = response.json()
        if data:
            return {"lat": float(data[0]['lat']), "lon": float(data[0]['lon'])}
        return None
    except requests.exceptions.RequestException as e:
        print(f"Geocoding error: {e}")
        return None

def get_timezone(lat, lon):
    url = "https://api.open-meteo.com/v1/timezone"
    params = {
        'latitude': lat,
        'longitude': lon,
    }
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json().get("timezone", "UTC")
    except requests.exceptions.RequestException as e:
        print(f"Timezone lookup error: {e}")
        return "UTC"