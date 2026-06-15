import React, { useState } from 'react';
import { Spinner } from './Loaders';

interface UrlFormProps {
  onCreate: (data: { originalUrl: string; customAlias?: string; expiryDate?: string }) => Promise<void>;
}

export const UrlForm: React.FC<UrlFormProps> = ({ onCreate }) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!originalUrl) { setError('Please enter a URL'); return; }

    setLoading(true);
    try {
      await onCreate({
        originalUrl,
        customAlias: customAlias || undefined,
        expiryDate: expiryDate || undefined,
      });
      setOriginalUrl('');
      setCustomAlias('');
      setExpiryDate('');
      setShowAdvanced(false);
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to shorten URL';
      setError(msg || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Shorten a New URL</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main URL Input */}
        <div className="flex gap-2">
          <input
            type="url"
            className="input flex-1"
            placeholder="https://your-long-url.com/goes/here"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="btn-primary px-6 whitespace-nowrap">
            {loading ? <Spinner size="sm" /> : 'Shorten'}
          </button>
        </div>

        {/* Advanced Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
        >
          <svg
            className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced options
        </button>

        {/* Advanced Fields */}
        {showAdvanced && (
          <div className="grid sm:grid-cols-2 gap-4 pt-1 animate-fade-in">
            <div>
              <label className="label">Custom Alias (optional)</label>
              <input
                className="input"
                placeholder="my-brand"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                maxLength={30}
              />
              <p className="text-xs text-gray-500 mt-1">Alphanumeric only, 3–30 chars</p>
            </div>
            <div>
              <label className="label">Expiry Date (optional)</label>
              <input
                type="date"
                className="input"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 animate-fade-in">{error}</p>
        )}
      </form>
    </div>
  );
};
