import React, { useState } from 'react';
import YearlyTemperatureChart from './components/YearlyTemperatureChart';
import TemperatureRainScatter from './components/TemperatureRainScatter';
import ChartSelector from './components/ChartSelector';

function App() {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCharts, setSelectedCharts] = useState([]);
    const [yearlyAverages, setYearlyAverages] = useState([]);
    const [scatterData, setScatterData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

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

        const res = await fetch('http://10.220.4.157:5000/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, startDate, endDate, hourlyVars, selectedCharts }),
        });

        const processedData = await res.json();
        setYearlyAverages([]);
        setScatterData([]);
        
        if (processedData.yearly_averages) {
            setYearlyAverages(processedData.yearly_averages);
        }
        
        if (processedData.temp_rain_correlation) {
            setScatterData(processedData.temp_rain_correlation);
        }
        setIsLoading(false);
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
                <ChartSelector 
                    availableCharts={availableCharts}
                    selectedCharts={selectedCharts}
                    handleChartChange={handleChartChange}
                />
                <br /><br />
                <button type="submit">Submit</button>
            </form>

            {isLoading && <p>Loading data...</p>}

            {selectedCharts.includes('Yearly Average Temperature Comparison') && (
                <YearlyTemperatureChart yearlyAverages={yearlyAverages} />
            )}

            {selectedCharts.includes('Hourly Temperature and Rain Correlation') && (
                <TemperatureRainScatter scatterData={scatterData} />
            )}
        </div>
    );
}

export default App;
