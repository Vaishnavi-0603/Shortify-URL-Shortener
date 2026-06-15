import React from 'react';

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
  return (
    <svg
      className={`animate-spin ${sizes[size]} text-brand-500`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
};

export const SkeletonRow: React.FC = () => (
  <tr className="border-b border-gray-800">
    {Array.from({ length: 6 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="skeleton h-4 rounded w-full" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard: React.FC = () => (
  <div className="card space-y-3">
    <div className="skeleton h-4 w-1/3 rounded" />
    <div className="skeleton h-8 w-1/2 rounded" />
    <div className="skeleton h-3 w-2/3 rounded" />
  </div>
);

export const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-950">
    <Spinner size="lg" />
  </div>
);
