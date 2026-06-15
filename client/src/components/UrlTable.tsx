import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Url } from '../types';
import { buildShortUrl, formatDate, truncateUrl, copyToClipboard, isExpired } from '../utils/helpers';
import { SkeletonRow } from './Loaders';
import { QRModal } from './QRModal';
import { EditUrlModal } from './EditUrlModal';

interface UrlTableProps {
  urls: Url[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: Partial<Pick<Url, 'originalUrl' | 'status' | 'expiryDate'>>) => Promise<void>;
  onCopied: () => void;
}

export const UrlTable: React.FC<UrlTableProps> = ({ urls, loading, onDelete, onUpdate, onCopied }) => {
  const navigate = useNavigate();
  const [qrUrl, setQrUrl] = useState<{ url: string; code: string } | null>(null);
  const [editUrl, setEditUrl] = useState<Url | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (url: Url) => {
    const short = buildShortUrl(url.shortCode);
    const ok = await copyToClipboard(short);
    if (ok) {
      setCopiedId(url._id);
      onCopied();
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this link and all its analytics?')) return;
    setDeletingId(id);
    try { await onDelete(id); } finally { setDeletingId(null); }
  };

  const getStatusBadge = (url: Url) => {
    if (isExpired(url.expiryDate)) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-900/40 text-yellow-400 border border-yellow-800">Expired</span>;
    }
    if (url.status === 'disabled') {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-red-900/40 text-red-400 border border-red-800">Disabled</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-900/40 text-green-400 border border-green-800">Active</span>;
  };

  if (!loading && urls.length === 0) {
    return (
      <div className="card flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-gray-400 font-medium">No links yet</p>
          <p className="text-gray-600 text-sm mt-1">Shorten your first URL above</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Original URL</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Short Link</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Clicks</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Expires</th>
                <th className="text-left px-4 py-3 text-gray-400 font-medium">Created</th>
                <th className="px-4 py-3 text-gray-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                : urls.map((url) => {
                    const shortUrl = buildShortUrl(url.shortCode);
                    return (
                      <tr key={url._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <a
                            href={url.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-brand-400 transition-colors"
                            title={url.originalUrl}
                          >
                            {truncateUrl(url.originalUrl, 45)}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-400 hover:text-brand-300 font-mono transition-colors"
                          >
                            /{url.shortCode}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-gray-300 font-medium">
                          {url.clickCount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(url)}</td>
                        <td className="px-4 py-3 text-gray-400">
                          {formatDate(url.expiryDate)}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {formatDate(url.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {/* Copy */}
                            <button
                              onClick={() => handleCopy(url)}
                              title="Copy short URL"
                              className={`p-1.5 rounded-lg transition-colors ${copiedId === url._id ? 'text-green-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
                            >
                              {copiedId === url._id ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>

                            {/* QR Code */}
                            <button
                              onClick={() => setQrUrl({ url: shortUrl, code: url.shortCode })}
                              title="View QR Code"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                            </button>

                            {/* Analytics */}
                            <button
                              onClick={() => navigate(`/analytics/${url._id}`)}
                              title="View Analytics"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditUrl(url)}
                              title="Edit Link"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(url._id)}
                              title="Delete"
                              disabled={deletingId === url._id}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors disabled:opacity-40"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {qrUrl && (
        <QRModal url={qrUrl.url} shortCode={qrUrl.code} onClose={() => setQrUrl(null)} />
      )}
      {editUrl && (
        <EditUrlModal url={editUrl} onSave={onUpdate} onClose={() => setEditUrl(null)} />
      )}
    </>
  );
};
