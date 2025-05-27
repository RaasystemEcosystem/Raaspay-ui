import { ethers } from 'ethers';

// Read environment variables for config
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const rpcURL = import.meta.env.VITE_RPC_URL;

// Create provider and signer
// If you want to connect with MetaMask or XDC Pay extension wallets, use window.ethereum
const provider = window.ethereum 
  ? new ethers.providers.Web3Provider(window.ethereum) 
  : new ethers.providers.JsonRpcProvider(rpcURL);

// Get signer from provider (signer is needed to send transactions)
const signer = provider.getSigner();

// Load your contract ABI here (make sure you import or define contractABI)
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// Example: call contract method
async function sendTokens(to, amount) {
  const tx = await contract.transfer(to, amount);
  await tx.wait(); // wait for confirmation
  console.log('Transaction confirmed:', tx.hash);
}
