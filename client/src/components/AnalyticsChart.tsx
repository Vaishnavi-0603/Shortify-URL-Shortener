import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children }) => (
  <div className="card">
    <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

// ─── Daily Click Trend ────────────────────────────────────────────────────────
interface DailyClickChartProps {
  data: { date: string; count: number }[];
}

export const DailyClickChart: React.FC<DailyClickChartProps> = ({ data }) => (
  <ChartCard title="Daily Clicks (Last 30 Days)">
    {data.length === 0 ? (
      <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickFormatter={(d) => d.slice(5)} // MM-DD
          />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#9ca3af' }}
            itemStyle={{ color: '#3b82f6' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#3b82f6' }}
            name="Clicks"
          />
        </LineChart>
      </ResponsiveContainer>
    )}
  </ChartCard>
);

// ─── Browser Distribution Pie ─────────────────────────────────────────────────
interface BrowserPieChartProps {
  data: { name: string; count: number }[];
}

export const BrowserPieChart: React.FC<BrowserPieChartProps> = ({ data }) => (
  <ChartCard title="Browser Distribution">
    {data.length === 0 ? (
      <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#d1d5db' }}
          />
          <Legend
            formatter={(value) => <span style={{ color: '#9ca3af', fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    )}
  </ChartCard>
);

// ─── Country Distribution Bar ─────────────────────────────────────────────────
interface CountryBarChartProps {
  data: { name: string; count: number }[];
}

export const CountryBarChart: React.FC<CountryBarChartProps> = ({ data }) => (
  <ChartCard title="Top Countries">
    {data.length === 0 ? (
      <p className="text-gray-600 text-sm text-center py-8">No data yet</p>
    ) : (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} allowDecimals={false} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#6b7280', fontSize: 11 }} width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
            itemStyle={{ color: '#10b981' }}
          />
          <Bar dataKey="count" name="Visits" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )}
  </ChartCard>
);
