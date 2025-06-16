import React from 'react';
import Plot from 'react-plotly.js';

const YearlyTemperatureChart = ({ yearlyAverages }) => {
  if (!yearlyAverages || yearlyAverages.length === 0) return null;
  
  const validData = yearlyAverages.filter(
    item => typeof item.temperature === 'number' && typeof item.year === 'number'
  );
  
  if (validData.length === 0) return null;

  return (
    <div>
      <h3>Yearly Average Temperature Comparison</h3>
      <Plot
        data={[{
          x: validData.map(item => item.year),
          y: validData.map(item => item.temperature),
          type: 'bar',
          marker: { color: '#1f77b4' },
          text: validData.map(item => 
            typeof item.temperature === 'number' ? `${item.temperature.toFixed(1)}°C` : 'N/A'
          ),
          hoverinfo: 'text',
        }]}
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
  );
};

export default YearlyTemperatureChart;