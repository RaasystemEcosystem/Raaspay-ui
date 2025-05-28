// src/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WalletConnect from './components/WalletConnect';
import PaymentForm from './components/PaymentForm';
import TransactionHistory from './components/TransactionHistory';

const contractABI = [...]; // keep as-is
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const rpcURL = import.meta.env.VITE_RPC_URL;

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

  useEffect(() => {
    if (window.ethereum) {
      const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(tempProvider);
      setSigner(tempProvider.getSigner());
    } else {
      setProvider(new ethers.providers.JsonRpcProvider(rpcURL));
    }
  }, []);

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
      toast.error('Wallet connection failed');
    }
  };

  const fetchBalance = async (address) => {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const rawBalance = await contract.balanceOf(address);
    setBalance(ethers.utils.formatEther(rawBalance));
  };

  const fetchTransactionHistory = async (address) => {
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    const filterFrom = contract.filters.Transfer(address, null);
    const filterTo = contract.filters.Transfer(null, address);
    const fromEvents = await contract.queryFilter(filterFrom, -10000);
    const toEvents = await contract.queryFilter(filterTo, -10000);
    const events = [...fromEvents, ...toEvents].sort((a, b) => b.blockNumber - a.blockNumber);
    const history = events.map((e) => ({
      txHash: e.transactionHash,
      from: e.args.from,
      to: e.args.to,
      value: ethers.utils.formatEther(e.args.value),
      direction: e.args.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received',
    }));
    setTxHistory(history);
  };

  const sendPayment = async () => {
    if (!walletAddress) return toast.error('Connect wallet first');
    if (!recipient || !amount) return toast.error('All fields are required');
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      const tx = await contract.transfer(recipient, ethers.utils.parseEther(amount));
      await tx.wait();
      setTxHash(tx.hash);
      setStatus('Payment successful!');
      toast.success('Payment successful!');
      fetchBalance(walletAddress);
      fetchTransactionHistory(walletAddress);
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const handleScan = (data) => {
    if (data) {
      setRecipient(data);
      setShowScanner(false);
      toast.info(`Scanned address: ${data}`);
    }
  };

  const handleError = (err) => toast.error('QR scan error');

  return (
    <main className="p-6 max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
      <ToastContainer position="top-right" autoClose={4000} />
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Send Raaskoin</h2>
        <WalletConnect walletAddress={walletAddress} balance={balance} onConnect={connectWallet} />
        {walletAddress && (
          <PaymentForm
            recipient={recipient}
            setRecipient={setRecipient}
            amount={amount}
            setAmount={setAmount}
            showScanner={showScanner}
            setShowScanner={setShowScanner}
            handleScan={handleScan}
            handleError={handleError}
            sendPayment={sendPayment}
            status={status}
            txHash={txHash}
          />
        )}
      </div>
      <TransactionHistory txHistory={txHistory} />
    </main>
  );
};

export default Dashboard;
