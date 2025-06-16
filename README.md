# Climate Insights Dashboard

# Climate Insights Dashboard

(![Dashboard Screenshot](image.png))

## Project Overview
Interactive dashboard visualizing historical weather patterns using Open-Meteo API. Users can:
- Select locations and date ranges
- View multiple chart types
- Analyze temperature, precipitation, and wind trends

## Features
- Yearly temperature comparisons
- Temperature-precipitation correlation
- Caching system for API responses
- Responsive web interface

## Tech Stack
- **Frontend**: React.js + Plotly.js
- **Backend**: Python Flask
- **Database**: SQLite (caching)
- **APIs**: Open-Meteo Historical Weather API, Nominatim API

## Setup Instructions

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
```

## Resources
- Weather Data: Open-Meteo API (CC BY 4.0) (https://open-meteo.com/)
- Geocoding: Nominatim (https://nominatim.org/)
- Plotly.js (https://plotly.com/javascript/bar-charts/)
- (https://www.npmjs.com/package/react-plotlyjs)
- https://medium.com/@davidjohnakim/using-plotly-js-with-react-f792ab426248
