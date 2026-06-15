import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type ErrorType = 'not-found' | 'expired' | 'disabled' | '404';

const config: Record<ErrorType, { emoji: string; title: string; message: string; color: string }> = {
  'not-found': {
    emoji: '🔍',
    title: 'Link Not Found',
    message: 'This short link does not exist or may have been deleted.',
    color: 'text-gray-400',
  },
  expired: {
    emoji: '⏰',
    title: 'Link Expired',
    message: 'This short link has passed its expiration date and is no longer active.',
    color: 'text-yellow-400',
  },
  disabled: {
    emoji: '🚫',
    title: 'Link Disabled',
    message: 'This short link has been disabled by its owner.',
    color: 'text-red-400',
  },
  '404': {
    emoji: '🌐',
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    color: 'text-gray-400',
  },
};

const ErrorPage: React.FC<{ type?: ErrorType }> = ({ type }) => {
  const location = useLocation();
  const path = location.pathname.replace('/', '') as ErrorType;
  const errorType: ErrorType = type || (config[path] ? path : '404');
  const { emoji, title, message, color } = config[errorType];

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">{emoji}</div>
        <h1 className={`text-3xl font-bold mb-3 ${color}`}>{title}</h1>
        <p className="text-gray-400 mb-8">{message}</p>
        <Link to="/dashboard" className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
