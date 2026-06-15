import React, { useState } from 'react';
import type { Url } from '../types';
import { Spinner } from './Loaders';

interface EditUrlModalProps {
  url: Url;
  onSave: (id: string, data: Partial<Pick<Url, 'originalUrl' | 'status' | 'expiryDate'>>) => Promise<void>;
  onClose: () => void;
}

export const EditUrlModal: React.FC<EditUrlModalProps> = ({ url, onSave, onClose }) => {
  const [originalUrl, setOriginalUrl] = useState(url.originalUrl);
  const [status, setStatus] = useState<'active' | 'disabled'>(url.status);
  const [expiryDate, setExpiryDate] = useState(
    url.expiryDate ? url.expiryDate.split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(url._id, {
        originalUrl,
        status,
        expiryDate: expiryDate || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-100">Edit Link</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none transition-colors">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Destination URL</label>
            <input
              className="input"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'disabled')}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
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

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
