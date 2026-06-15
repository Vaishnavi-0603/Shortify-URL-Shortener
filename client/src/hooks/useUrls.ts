import { useState, useEffect, useCallback } from 'react';
import type { Url } from '../types';
import { urlApi } from '../services/api';

export const useUrls = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await urlApi.getAll();
      setUrls(data.data ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load URLs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const createUrl = async (payload: { originalUrl: string; customAlias?: string; expiryDate?: string }) => {
    const { data } = await urlApi.create(payload);
    setUrls((prev) => [data.data!, ...prev]);
    return data.data!;
  };

  const updateUrl = async (id: string, payload: Partial<Pick<Url, 'originalUrl' | 'status' | 'expiryDate'>>) => {
    const { data } = await urlApi.update(id, payload);
    setUrls((prev) => prev.map((u) => (u._id === id ? data.data! : u)));
    return data.data!;
  };

  const deleteUrl = async (id: string) => {
    await urlApi.delete(id);
    setUrls((prev) => prev.filter((u) => u._id !== id));
  };

  return { urls, loading, error, refetch: fetchUrls, createUrl, updateUrl, deleteUrl };
};
