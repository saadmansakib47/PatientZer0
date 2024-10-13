import React from 'react';
import './App.css';  // Optional: styles for the app
import DoctorPosts from './components/DoctorPosts';  // Import the DoctorPosts component

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the Blogging Site</h1>
      </header>
      <main>
        <DoctorPosts />  {/* Render the DoctorPosts component */}
      </main>
    </div>
  );
}

export default App;
