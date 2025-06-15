import React, { useState } from 'react';
import BarChart from './components/BarCharts';
import AnimatedHeatmap from './components/AnimatedHeatmap';


function App() {
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [chartData, setChartData] = useState({ years: [], temps: [] });
    const [hourlyParam, setHourlyParam] = useState('');
    const [hourlyTimes, setHourlyTimes] = useState([]);
    const [hourlyValues, setHourlyValues] = useState([]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('http://localhost:5000/weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location, startDate, endDate, hourly: hourlyParam }),
        });

        const json = await res.json();
        console.log(json);

        const times = json.hourly.time;
        const values = json.hourly[hourlyParam];

        setHourlyTimes(times);
        setHourlyValues(values);

        const yearTempMap = {};

        times.forEach((t, idx) => {
            const year = new Date(t).getFullYear();
            if (!yearTempMap[year]) yearTempMap[year] = [];
            yearTempMap[year].push(values[idx]);
        });

        const years = Object.keys(yearTempMap);
        const avgTemps = years.map((y) => {
            const vals = yearTempMap[y];
            const sum = vals.reduce((a, b) => a + b, 0);
            return parseFloat((sum / vals.length).toFixed(2));
        });

        setChartData({ years, temps: avgTemps });
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
            <label>Hourly Variables:</label>
            <input
                value={hourlyParam}
                onChange={(e) => setHourlyParam(e.target.value)}
            />
            <br /><br />
            <button type="submit">Submit</button>
        </form>

        {chartData.years.length > 0 && chartData.temps.length > 0 && (
            <BarChart times={chartData.years} temps={chartData.temps} />
        )}

        {(
            <div style={{ marginTop: '40px' }}>
                <AnimatedHeatmap
                    hourlyTimes={hourlyTimes}
                    hourlyValues={hourlyValues}
                    valueLabel={hourlyParam}
                    title={`Hourly ${hourlyParam} Heatmap`}
                />
            </div>
        )}
        </div>
    );
}

export default App;
