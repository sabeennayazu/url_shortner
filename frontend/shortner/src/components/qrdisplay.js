import QRCode from "react-qr-code";
import shortUrl from "../services/urlApi";

export function QRDisplay({ shortUrl }) {
  return (
    <div className="flex flex-col items-center justify-center ">
      <h2 className="text-2xl font-bold mb-4">Your QR Code</h2>
      <div className="bg-white p-4 rounded-lg shadow-lg">
        <QRCode id="qr-code-svg" value={shortUrl} size={256} />
      </div>
    </div>
  );
}