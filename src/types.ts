
export type UserStatus = 'active' | 'inactive' | 'expired' | 'blocked';
export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  planId: string;
  createdAt: string;
  expiresAt: string;
  lastLogin?: string;
  lastIp?: string;
  notes?: string;
  isVip?: boolean;
  maxDevices: number;
  activeSessions: number;
  avatar?: string;
  permissions: string[];
  isActive: boolean;
  favorites: string[];
  loginHistory: { date: string; ip: string; device: string }[];
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  logo: string;
  thumbnail?: string;
  description?: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'maintenance';
  isFeatured?: boolean;
  isPremium?: boolean;
  order: number;
  planIds: string[]; // Which plans can access this channel
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  order: number;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxChannels: number;
  categoryIds: string[];
  features: string[];
  isActive: boolean;
}

export interface SystemSettings {
  siteName: string;
  logo: string;
  favicon: string;
  primaryColor: string;
  footerText: string;
  maintenanceMode: boolean;
  sessionTimeout: number; // minutes
  loginAttemptsLimit: number;
  enableProtections: boolean;
  enableFavorites: boolean;
  enableExpirationWarning: boolean;
  disabledCategories: string[];
  messages: {
    welcome: string;
    expired: string;
    maintenance: string;
  };
}

export interface LoginAttempt {
  id: string;
  username: string;
  date: string;
  ip: string;
  success: boolean;
  reason?: string;
}
