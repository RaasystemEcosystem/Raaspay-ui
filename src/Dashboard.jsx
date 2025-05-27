// src/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import QRCode from 'qrcode.react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QrReader from 'react-qr-reader'; // For camera QR scanning

const contractABI = [
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'Transfer',
    type: 'event',
  },
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const rpcURL = import.meta.env.VITE_RPC_URL;

// Mock gold price in USD per Raaskoin token, replace with live oracle fetch later
const mockGoldPriceUSD = 1800;

const Dashboard = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState('0');
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [txHistory, setTxHistory] = useState([]);
  const [showScanner, setShowScanner] = useState(false);

  // Initialize provider and signer
  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setSigner(tempProvider.getSigner());
    } else {
      const tempProvider = new ethers.providers.JsonRpcProvider(rpcURL);
      setProvider(tempProvider);
    }
  }, []);

  // Connect wallet and fetch balance + transaction history
  const connectWallet = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const tempSigner = new ethers.providers.Web3Provider(window.ethereum).getSigner();
      const address = await tempSigner.getAddress();
      setWalletAddress(address);
      setSigner(tempSigner);
      fetchBalance(address);
      fetchTransactionHistory(address);
      setStatus('Wallet connected');
      toast.success('Wallet connected');
    } catch (error) {
      console.error(error);
      setStatus('Wallet connection failed');
      toast.error('Wallet connection failed');
    }
  };

  // Fetch balance of connected wallet
  const fetchBalance = async (address) => {
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const rawBalance = await contract.balanceOf(address);
      const formatted = ethers.utils.formatEther(rawBalance);
      setBalance(formatted);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch recent transaction history by filtering Transfer events for walletAddress
  const fetchTransactionHistory = async (address) => {
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const filterFrom = contract.filters.Transfer(address, null);
      const filterTo = contract.filters.Transfer(null, address);

      // Fetch past events (last 10000 blocks or adjust as needed)
      const fromEvents = await contract.queryFilter(filterFrom, -10000);
      const toEvents = await contract.queryFilter(filterTo, -10000);

      const combinedEvents = [...fromEvents, ...toEvents];

      // Sort descending by blockNumber
      combinedEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      // Map to simplified format
      const history = combinedEvents.map((event) => ({
        txHash: event.transactionHash,
        from: event.args.from,
        to: event.args.to,
        value: ethers.utils.formatEther(event.args.value),
        direction: event.args.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received',
      }));

      setTxHistory(history);
    } catch (error) {
      console.error(error);
    }
  };

  // Send payment function
  const sendPayment = async () => {
    if (!walletAddress) return toast.error('Connect wallet first');
    if (!recipient || !amount) return toast.error('All fields are required');

    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tokenAmount = ethers.utils.parseEther(amount);
      const tx = await contract.transfer(recipient, tokenAmount);
      await tx.wait();
      setTxHash(tx.hash);
      setStatus('Payment successful!');
      toast.success('Payment successful!');
      fetchBalance(walletAddress);
      fetchTransactionHistory(walletAddress);
    } catch (error) {
      console.error(error);
      setStatus('Payment failed');
      toast.error('Payment failed');
    }
  };

  // QR code scan handler
  const handleScan = (data) => {
    if (data) {
      setRecipient(data);
      setShowScanner(false);
      toast.info(`Scanned address: ${data}`);
    }
  };

  const handleError = (err) => {
    console.error(err);
    toast.error('QR scan error');
  };

  return (
    <main className="p-6 max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
      <ToastContainer position="top-right" autoClose={4000} />

      {/* Send Payment Form */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Send Raaskoin</h2>

        {!walletAddress ? (
          <button
            onClick={connectWallet}
            className="bg-green-600 text-white py-2 px-4 rounded-lg"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm">Your Wallet:</label>
                <p className="truncate text-xs text-gray-500">{walletAddress}</p>
                <p className="text-sm text-blue-500">
                  Balance: {balance} RAK (~${(balance * mockGoldPriceUSD).toFixed(2)} USD)
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

              {showScanner && (
                <div className="mb-4">
                  <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%' }}
                  />
                </div>
              )}

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

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow overflow-auto max-h-[400px]">
        <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
        {txHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions found.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {txHistory.map(({ txHash, from, to, value, direction }, idx) => (
              <li
                key={idx}
                className={`p-2 rounded ${
                  direction === 'Sent' ? 'bg-red-100' : 'bg-green-100'
                }`}
              >
                <p>
                  <strong>{direction}</strong> {value} RAK
                </p>
                <p className="truncate">
                  From: {from} <br />
                  To: {to}
                </p>
                <a
                  href={`https://xdc.blocksscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 underline"
                >
                  View Tx
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* QR Code for your own wallet address */}
      {walletAddress && (
        <section className="col-span-full text-center mt-8">
          <h3 className="text-xl font-semibold mb-2">Your Payment QR Code</h3>
          <QRCode value={walletAddress} size={180} />
          <p className="text-sm mt-2 truncate">{walletAddress}</p>
        </section>
      )}
    </main>
  );
};

export default Dashboard;
