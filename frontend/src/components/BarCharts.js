import React from 'react';
import Plot from 'react-plotly.js';

function BarChart({ times, temps }) {
  // Group temps by date
  const dailyTemps = {};

  times.forEach((time, index) => {
    const date = time.split('T')[0];  // '2020-01-01T00:00' → '2020-01-01'
    if (!dailyTemps[date]) dailyTemps[date] = [];
    dailyTemps[date].push(temps[index]);
  });

  const dates = Object.keys(dailyTemps);
  const avgTemps = dates.map(date => {
    const values = dailyTemps[date];
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  });

  return (
    <Plot
      data={[{
        type: 'bar',
        x: dates,
        y: avgTemps,
        marker: { color: 'skyblue' },
      }]}
      layout={{ title: 'Average Daily Temperature', xaxis: { title: 'Date' }, yaxis: { title: 'Temp (°C)' } }}
    />
  );
}

export default BarChart;
