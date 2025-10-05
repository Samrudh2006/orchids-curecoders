import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial', 
      background: '#f0f0f0', 
      minHeight: '100vh' 
    }}>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '10px 0' 
      }}>
        <h1>🔧 CureCoders React Debug</h1>
        <p>✅ React is working</p>
        <p>✅ Components are rendering</p>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
      
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        margin: '10px 0' 
      }}>
        <h2>🚀 Status</h2>
        <p>React version: {React.version}</p>
        <p>Environment: {import.meta.env.MODE}</p>
      </div>
    </div>
  );
}

export default App;