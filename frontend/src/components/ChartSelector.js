import React from 'react';

const ChartSelector = ({ 
  availableCharts, 
  selectedCharts, 
  handleChartChange 
}) => (
  <div>
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
  </div>
);

export default ChartSelector;