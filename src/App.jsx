// src/App.jsx
import React, { useState } from 'react';
import Dashboard from './Dashboard';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [status, setStatus] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
        setStatus('Wallet connected');
      } catch (error) {
        console.error(error);
        setStatus('Wallet connection failed');
      }
    } else {
      setStatus('No wallet detected. Install MetaMask or XDC Pay.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Rabex Wallet Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Send and manage Raaskoin directly from the Rabex wallet
        </p>
        <div className="mt-4">
          <button
            onClick={connectWallet}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg"
          >
            {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...` : 'Connect Wallet'}
          </button>
          {status && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{status}</p>}
        </div>
      </header>

      {/* Pass walletAddress and setStatus down to Dashboard */}
      <Dashboard walletAddress={walletAddress} setStatus={setStatus} />
    </div>
  );
}

export default App;
