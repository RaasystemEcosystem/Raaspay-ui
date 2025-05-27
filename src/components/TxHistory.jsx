import React from 'react';
import useRaaskoin from '../hooks/useRaaskoin';

const TxHistory = () => {
  const { txHistory } = useRaaskoin();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow overflow-auto max-h-[400px]">
      <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
      {txHistory.length === 0 ? (
        <p className="text-sm text-gray-500">No transactions found.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {txHistory.map(({ txHash, from, to, value, direction }, idx) => (
            <li key={idx} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">{direction}</p>
              <p><strong>{from}</strong> → <strong>{to}</strong></p>
              <p>{value} RAK</p>
              <a
                href={`https://xdc.blocksscan.io/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 text-xs"
              >
                View on Explorer
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TxHistory;
