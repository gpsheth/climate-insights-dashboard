import React from 'react';
import Plot from 'react-plotly.js';

const TemperatureRainScatter = ({ scatterData }) => {
  // Filter out invalid data points
  const validData = scatterData.filter(
    point => typeof point.temperature === 'number' && typeof point.precipitation === 'number'
  );
  
  if (!validData || validData.length === 0) return null;

  return (
    <div>
      <h3>Hourly Temperature and Rain Correlation</h3>
      <Plot
        data={[{
          x: validData.map(point => point.temperature),
          y: validData.map(point => point.precipitation),
          type: 'scatter',
          mode: 'markers',
          marker: {
            size: 4,
            opacity: 0.5,
            color: '#636efa'
          }
        }]}
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
  );
};

export default TemperatureRainScatter;