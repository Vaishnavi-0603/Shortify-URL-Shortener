import React from 'react';
import { Navbar } from '../components/Navbar';
import { UrlForm } from '../components/UrlForm';
import { UrlTable } from '../components/UrlTable';
import { SkeletonCard, ToastContainer } from '../components/index';
import { useUrls } from '../hooks/useUrls';
import { useToast } from '../hooks/useToast';
import { isExpired } from '../utils/helpers';

const StatCard: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}> = ({ label, value, color, icon }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { urls, loading, createUrl, updateUrl, deleteUrl } = useUrls();
  const { toasts, show, remove } = useToast();

  const totalClicks = urls.reduce((acc, u) => acc + u.clickCount, 0);
  const activeCount = urls.filter((u) => u.status === 'active' && !isExpired(u.expiryDate)).length;
  const expiredCount = urls.filter((u) => isExpired(u.expiryDate)).length;

  const handleCreate = async (data: { originalUrl: string; customAlias?: string; expiryDate?: string }) => {
    try {
      await createUrl(data);
      show('Short link created!', 'success');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to create URL';
      show(msg || 'Failed to create URL', 'error');
      throw err;
    }
  };

  const handleUpdate = async (
    id: string,
    data: { originalUrl?: string; status?: 'active' | 'disabled'; expiryDate?: string }
  ) => {
    try {
      await updateUrl(id, data);
      show('Link updated', 'success');
    } catch {
      show('Failed to update link', 'error');
      throw new Error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUrl(id);
      show('Link deleted', 'success');
    } catch {
      show('Failed to delete link', 'error');
      throw new Error('Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage and track all your short links</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <StatCard
                label="Total URLs"
                value={urls.length}
                color="bg-brand-900/50"
                icon={<svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
              />
              <StatCard
                label="Total Clicks"
                value={totalClicks}
                color="bg-purple-900/50"
                icon={<svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
              />
              <StatCard
                label="Active Links"
                value={activeCount}
                color="bg-green-900/50"
                icon={<svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Expired Links"
                value={expiredCount}
                color="bg-yellow-900/50"
                icon={<svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </>
          )}
        </div>

        {/* URL Form */}
        <UrlForm onCreate={handleCreate} />

        {/* URL Table */}
        <UrlTable
          urls={urls}
          loading={loading}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onCopied={() => show('Short URL copied!', 'success')}
        />
      </main>

      <ToastContainer toasts={toasts} onRemove={remove} />
    </div>
  );
};

export default Dashboard;
