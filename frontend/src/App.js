import React, { useState } from 'react';

function App() {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/weather', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, startDate, endDate })
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Climate Insights Dashboard</h2>
      <form onSubmit={handleSubmit}>
        <label>Location:</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)}>
        </input>
        <br /><br />
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <br /><br />
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <br /><br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
