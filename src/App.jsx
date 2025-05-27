// src/App.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Raaspay</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
        Securely send and manage Raaskoin (RAK) via your decentralized wallet
      </p>
      <button
        onClick={handleNavigate}
        className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg"
      >
        Go to Dashboard
      </button>
    </div>
  );
}

export default App;
