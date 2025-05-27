import React from 'react';
import { ToastContainer } from 'react-toastify';
import WalletSection from './WalletSection';
import TxHistory from './TxHistory';

const Dashboard = () => {
  return (
    <main className="p-6 max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
      <ToastContainer position="top-right" autoClose={4000} />
      <WalletSection />
      <TxHistory />
    </main>
  );
};

export default Dashboard;
