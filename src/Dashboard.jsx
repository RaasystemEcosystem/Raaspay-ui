// src/Dashboard.jsx
import React, { useState } from 'react';
import Web3 from 'web3';

const CONTRACTS = {
  TestPriceOracle: '0x8bfa7644c53f338557a5fd52710cba04fc07d510',
  RabexAIEngine: '0xdbb02cfc864c3d0b485a3f0cdf45eeccc573a212',
  Raaspay: '0x22D648Ee849b81d7dA96Fa6FBE2d7b5f04538150',
  Raaswallet: '0xB223C7Fba42b8F784CB6e2f34088D98d49122D36',
  Raaskoin: '0x7e88Fb6dC8E1Df1099e92a806cEfC58f5F466993',
  Raastoken: '0x55CDF6069393F76E42323C046baEF62a818EF6d1',
};

const RSK_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

const Dashboard = ({ walletAddress, setStatus }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('Raaskoin');
  const [history, setHistory] = useState([]);

  let web3;
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
  }

  const sendPayment = async () => {
    if (!walletAddress) return setStatus('Connect wallet first');
    if (!recipient || !amount) return setStatus('All fields are required');

    setStatus('Sending Raaskoin...');

    try {
      const tokenAmount = web3.utils.toWei(amount, 'ether');

      if (token === 'Raaskoin') {
        const contract = new web3.eth.Contract(RSK_ABI, CONTRACTS.Raaskoin);
        const tx = await contract.methods.transfer(recipient, tokenAmount).send({
          from: walletAddress,
        });

        setHistory([
          ...history,
          {
            type: 'Sent',
            token,
            amount,
            date: new Date().toISOString(),
            txHash: tx.transactionHash,
          },
        ]);
        setStatus(`Payment successful! Tx: ${tx.transactionHash}`);
      } else {
        setStatus(`${token} transfers not yet implemented`);
      }
    } catch (error) {
      console.error(error);
      setStatus('Payment failed');
    }
  };

  return (
    <main className="grid gap-8 md:grid-cols-2">
      {/* Payment Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Send Payment</h2>
        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Recipient Wallet Address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700"
          />
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="p-2 rounded bg-gray-200 dark:bg-gray-700"
          >
            <option value="Raaskoin">Raaskoin</option>
            <option disabled>USDT (coming soon)</option>
            <option disabled>XDC (coming soon)</option>
            <option disabled>Raastoken (coming soon)</option>
          </select>
          <button
            onClick={sendPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
          >
            Send Payment
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <ul className="text-sm space-y-2">
          {history.length === 0 && <li>No transactions yet</li>}
          {history.map((tx, index) => (
            <li key={index} className="flex justify-between">
              <span>
                {tx.type} {tx.amount} {tx.token}
              </span>
              <a
                href={`https://xdc.blocksscan.io/tx/${tx.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
};

export default Dashboard;
