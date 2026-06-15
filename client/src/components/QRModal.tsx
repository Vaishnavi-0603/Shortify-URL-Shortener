import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRModalProps {
  url: string;
  shortCode: string;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({ url, shortCode, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 256,
        margin: 2,
        color: { dark: '#ffffff', light: '#111827' },
      });
    }
  }, [url]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qr-${shortCode}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card flex flex-col items-center gap-5 w-80 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <h3 className="font-semibold text-gray-100">QR Code</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <canvas ref={canvasRef} className="rounded-lg" />

        <p className="text-xs text-gray-500 break-all text-center">{url}</p>

        <button onClick={handleDownload} className="btn-primary w-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PNG
        </button>
      </div>
    </div>
  );
};
