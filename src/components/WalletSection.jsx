import React from 'react';
import QrScanner from './QrScanner';
import useRaaskoin from '../hooks/useRaaskoin';

const WalletSection = () => {
  const {
    connectWallet, walletAddress, balance, txHash, sendPayment,
    recipient, setRecipient, amount, setAmount, status,
    showScanner, setShowScanner
  } = useRaaskoin();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">Send Raaskoin</h2>

      {!walletAddress ? (
        <button onClick={connectWallet} className="bg-green-600 text-white py-2 px-4 rounded-lg">
          Connect Wallet
        </button>
      ) : (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Your Wallet:</label>
              <p className="truncate text-xs text-gray-500">{walletAddress}</p>
              <p className="text-sm text-blue-500">
                Balance: {balance} RAK (~${(balance * 1800).toFixed(2)} USD)
              </p>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-grow p-2 rounded bg-gray-100 dark:bg-gray-700"
              />
              <button
                onClick={() => setShowScanner(!showScanner)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 rounded"
                title="Scan QR"
              >
                📷
              </button>
            </div>

            {showScanner && <QrScanner onScan={setRecipient} />}

            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700"
              min="0"
              step="any"
            />
            <button
              onClick={sendPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Send
            </button>
            {status && <p className="text-sm text-gray-600">{status}</p>}
            {txHash && (
              <a
                href={`https://xdc.blocksscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 text-xs"
              >
                View on Explorer
              </a>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WalletSection;
