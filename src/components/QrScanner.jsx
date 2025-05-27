import React from 'react';
import { toast } from 'react-toastify';
import { QrReader } from 'react-qr-reader';

const QrScanner = ({ onScan }) => {
  const handleScan = (data) => {
    if (data?.text) {
      onScan(data.text);
      toast.info(`Scanned: ${data.text}`);
    }
  };

  const handleError = (err) => {
    console.error(err);
    toast.error('QR scan error');
  };

  return (
    <div className="mb-4">
      <QrReader
        constraints={{ facingMode: 'environment' }}
        scanDelay={300}
        onResult={(result, error) => {
          if (!!result) handleScan(result);
          if (!!error) handleError(error);
        }}
        containerStyle={{ width: '100%' }}
      />
    </div>
  );
};

export default QrScanner;
