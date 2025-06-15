import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';

function App() {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCharts, setSelectedCharts] = useState([]);
    const [weatherData, setWeatherData] = useState(null);
    const [yearlyAverages, setYearlyAverages] = useState([]);
    const [scatterData, setScatterData] = useState([]);

    const availableCharts = [
        'Yearly Average Temperature Comparison',
        'Hourly Temperature and Rain Correlation',
        'Montly Wind Speed Distribution',
        'Decadal Temp Change',
        'Weather Radar Replay',
    ];

    const handleChartChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setSelectedCharts((prevCharts) => [...prevCharts, value]);
        } else {
            setSelectedCharts((prevCharts) =>
                prevCharts.filter((chart) => chart !== value)
            );
        }
    };

    const calculateYearlyAverages = (hourlyData) => {
        const { time, temperature_2m } = hourlyData;
        const averages = {};

        time.forEach((timestamp, index) => {
        const year = new Date(timestamp).getFullYear();
        if (!averages[year]) {
            averages[year] = { sum: 0, count: 0 };
        }
        averages[year].sum += temperature_2m[index];
        averages[year].count++;
        });

        return Object.entries(averages).map(([year, data]) => ({
            year: parseInt(year),
            temperature: data.sum / data.count,
        })).sort((a, b) => a.year - b.year);
    };

    useEffect(() => {
        if (weatherData && weatherData.hourly) {
            const { temperature_2m, precipitation } = weatherData.hourly;
            const points = temperature_2m.map((temp, index) => ({
                temperature: temp,
                precipitation: precipitation[index]
            }));
            setScatterData(points);
        }
    }, [weatherData]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let hourlyVars = [];

        for (let i = 0; i < selectedCharts.length; i++) {
            const viz = selectedCharts[i];
            if(viz === 'Yearly Average Temperature Comparison') {
                if(!hourlyVars.includes('temperature_2m')) {
                    hourlyVars.push('temperature_2m');
                }
            } else if(viz === 'Hourly Temperature and Rain Correlation') {
                if(!hourlyVars.includes('temperature_2m')) {
                    hourlyVars.push('temperature_2m');
                }
                if(!hourlyVars.includes('precipitation')) {
                    hourlyVars.push('precipitation');
                }
            } else if(viz === 'Montly Wind Speed Distribution') {
                if(!hourlyVars.includes('windspeed_10m')) {
                    hourlyVars.push('windspeed_10m');
                }
            } else if(viz === 'Decadal Temp Change') {
                if(!hourlyVars.includes('temperature_2m')) {
                    hourlyVars.push('temperature_2m');
                }
            } else if(viz === 'Weather Radar Replay') {
                if(!hourlyVars.includes('temperature_2m')) {
                    hourlyVars.push('temperature_2m');
                }
                if(!hourlyVars.includes('precipitation')) {
                    hourlyVars.push('precipitation');
                }
                if(!hourlyVars.includes('windspeed_10m')) {
                    hourlyVars.push('windspeed_10m');
                }
                if(!hourlyVars.includes('cloudcover')) {
                    hourlyVars.push('cloudcover');
                }
                if(!hourlyVars.includes('weathercode')) {
                    hourlyVars.push('weathercode');
                }
            }
        }

        const res = await fetch('http://localhost:5000/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, startDate, endDate, hourlyVars }),
        });

        const json = await res.json();
        setWeatherData(json);
    
        if (json.hourly) {
            setYearlyAverages(calculateYearlyAverages(json.hourly));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Climate Insights Dashboard</h2>
            <form onSubmit={handleSubmit}>
                <label>Location:</label>
                <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                <br /><br />
                <label>Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <br /><br />
                <label>End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <br /><br />
                <label>Charts:</label>
                <div>
                    {availableCharts.map((chartName) => (
                        <div key={chartName}>
                            <input
                                type="checkbox"
                                id={chartName}
                                name="charts"
                                value={chartName}
                                checked={selectedCharts.includes(chartName)}
                                onChange={handleChartChange}
                            />
                            <label htmlFor={chartName}>{chartName}</label>
                        </div>
                    ))}
                </div>
                <br /><br />
                <button type="submit">Submit</button>
            </form>

            {selectedCharts.includes('Yearly Average Temperature Comparison') && yearlyAverages.length > 0 && (
                <div>
                <h3>Yearly Average Temperature Comparison</h3>
                <Plot
                    data={[
                    {
                        x: yearlyAverages.map(item => item.year),
                        y: yearlyAverages.map(item => item.temperature),
                        type: 'bar',
                        marker: { color: '#1f77b4' },
                        text: yearlyAverages.map(item => `${item.temperature.toFixed(1)}°C`),
                        hoverinfo: 'text',
                    }
                    ]}
                    layout={{
                        title: 'Yearly Average Temperature',
                        xaxis: { title: 'Year', tickmode: 'linear' },
                        yaxis: { title: 'Temperature (°C)' },
                        hovermode: 'closest',
                        showlegend: false,
                    }}
                    style={{ width: '100%', height: '400px' }}
                />
                </div>
            )}

            {selectedCharts.includes('Hourly Temperature and Rain Correlation') && 
            scatterData.length > 0 && (
                <div>
                <h3>Hourly Temperature and Rain Correlation</h3>
                <Plot
                    data={[
                    {
                        x: scatterData.map(point => point.temperature),
                        y: scatterData.map(point => point.precipitation),
                        type: 'scatter',
                        mode: 'markers',
                        marker: {
                            size: 4,
                            opacity: 0.5,
                            color: '#636efa'
                        }
                    }
                    ]}
                    layout={{
                        title: 'Temperature vs Precipitation',
                        xaxis: { 
                            title: 'Temperature (°C)',
                            gridcolor: '#f0f0f0'
                        },
                        yaxis: { 
                            title: 'Precipitation (mm)',
                            gridcolor: '#f0f0f0'
                        },
                        hovermode: 'closest',
                        showlegend: false,
                        plot_bgcolor: '#f9f9f9',
                        paper_bgcolor: '#f9f9f9',
                    }}
                    config={{ responsive: true }}
                    style={{ width: '100%', height: '500px' }}
                />
                <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
                    Each point represents an hourly measurement showing the relationship between temperature and precipitation
                </div>
                </div>
            )}
        </div>
    );
}

export default App;
