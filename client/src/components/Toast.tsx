import React from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

const icons = {
  success: (
    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
};

const borderColors = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`flex items-start gap-3 card border-l-4 ${borderColors[toast.type]} animate-slide-up shadow-xl`}
      >
        <div className="mt-0.5 shrink-0">{icons[toast.type]}</div>
        <p className="text-sm text-gray-200 flex-1">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-gray-500 hover:text-gray-300 shrink-0 transition-colors"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);
