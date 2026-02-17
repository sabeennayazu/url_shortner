import React from 'react';
import QRCode from "react-qr-code";

export function QRDisplay({ shortUrl }) {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-white p-4 rounded-xl shadow-inner">
        <QRCode id="qr-code-svg" value={shortUrl} size={200} />
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        Scan to visit the shortened URL
      </p>
    </div>
  );
}