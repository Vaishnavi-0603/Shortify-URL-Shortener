import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import type { AnalyticsData } from '../types';
import { Navbar } from '../components/Navbar';
import { DailyClickChart, BrowserPieChart, CountryBarChart } from '../components/AnalyticsChart';
import { Spinner } from '../components/Loaders';
import { buildShortUrl, formatDate, relativeTime, truncateUrl } from '../utils/helpers';

const StatBadge: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="card text-center">
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

const TopList: React.FC<{ title: string; data: { name: string; count: number }[] }> = ({ title, data }) => (
  <div className="card">
    <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">{title}</h3>
    {data.length === 0 ? (
      <p className="text-gray-600 text-sm">No data yet</p>
    ) : (
      <ul className="space-y-2">
        {data.map((item, i) => (
          <li key={i} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="w-5 h-5 bg-gray-800 rounded text-xs flex items-center justify-center text-gray-400 shrink-0">
                {i + 1}
              </span>
              <span className="text-gray-300 text-sm truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-16 bg-gray-800 rounded-full h-1.5">
                <div
                  className="bg-brand-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (item.count / (data[0]?.count || 1)) * 100)}%` }}
                />
              </div>
              <span className="text-gray-400 text-xs w-6 text-right">{item.count}</span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Analytics: React.FC = () => {
  const { urlId } = useParams<{ urlId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!urlId) return;
    analyticsApi
      .get(urlId)
      .then((res) => setData(res.data.data!))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [urlId]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            {data && (
              <p className="text-gray-400 text-sm mt-0.5">
                <a
                  href={buildShortUrl(data.url.shortCode)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:text-brand-300 font-mono transition-colors"
                >
                  /{data.url.shortCode}
                </a>
                {' → '}
                <span className="text-gray-500">{truncateUrl(data.url.originalUrl, 60)}</span>
              </p>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card text-center py-12">
            <p className="text-red-400 mb-4">{error}</p>
            <Link to="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        )}

        {/* Content */}
        {data && !loading && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBadge label="Total Clicks" value={data.totalClicks.toLocaleString()} />
              <StatBadge label="Last Visited" value={relativeTime(data.lastVisited)} />
              <StatBadge label="Created" value={formatDate(data.url.createdAt)} />
              <StatBadge label="Status" value={data.url.status === 'active' ? '✅ Active' : '🔴 Disabled'} />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <DailyClickChart data={data.dailyClicks} />
              <BrowserPieChart data={data.topBrowsers} />
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              <CountryBarChart data={data.topCountries} />
              <TopList title="Top Devices" data={data.topDevices} />
              <TopList title="Top Operating Systems" data={data.topOs} />
            </div>

            {/* Recent Visits Table */}
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Recent Visits
                </h3>
              </div>
              {data.recentVisits.length === 0 ? (
                <p className="text-gray-600 text-sm text-center py-8">No visits recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-800 bg-gray-900/50">
                        {['Time', 'Browser', 'OS', 'Device', 'Country', 'Referrer'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-gray-400 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentVisits.map((visit) => (
                        <tr key={visit._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{relativeTime(visit.timestamp)}</td>
                          <td className="px-4 py-3 text-gray-300">{visit.browser}</td>
                          <td className="px-4 py-3 text-gray-300">{visit.os}</td>
                          <td className="px-4 py-3 text-gray-300 capitalize">{visit.device}</td>
                          <td className="px-4 py-3 text-gray-300">{visit.country}</td>
                          <td className="px-4 py-3 text-gray-400">{visit.referrer}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
