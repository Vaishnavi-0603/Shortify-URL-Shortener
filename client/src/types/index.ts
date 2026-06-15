export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface Url {
  _id: string;
  userId: string;
  originalUrl: string;
  shortCode: string;
  customAlias: string | null;
  clickCount: number;
  expiryDate: string | null;
  status: 'active' | 'disabled';
  lastVisited: string | null;
  createdAt: string;
  isExpired?: boolean;
}

export interface Visit {
  _id: string;
  urlId: string;
  timestamp: string;
  browser: string;
  os: string;
  device: string;
  country: string;
  referrer: string;
  ip: string;
}

export interface AnalyticsData {
  url: Url;
  totalClicks: number;
  lastVisited: string | null;
  recentVisits: Visit[];
  topBrowsers: { name: string; count: number }[];
  topOs: { name: string; count: number }[];
  topDevices: { name: string; count: number }[];
  topCountries: { name: string; count: number }[];
  dailyClicks: { date: string; count: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: User;
}
