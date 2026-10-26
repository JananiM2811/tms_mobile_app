import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

// Known laptop IPs (laptop switches between these Wi-Fi networks).
// The app probes all of them and uses whichever one answers.
const KNOWN_LAPTOP_IPS = [
  '10.218.113.105', // Wi-Fi: JanM (phone hotspot)
  '192.168.209.20', // Wi-Fi: AH_301
];
const API_PORT = 5000;
const PROBE_TIMEOUT_MS = 3000;

const IPV4_REGEX = /^\d+\.\d+\.\d+\.\d+$/;

// IP of the machine running Metro, when Expo exposes it (not available in --tunnel mode)
const getDevServerIp = () => {
  try {
    const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
    const host = hostUri ? hostUri.split(':')[0] : null;
    if (host && IPV4_REGEX.test(host) && host !== '127.0.0.1') {
      return host;
    }
  } catch (e) {
    // fallback
  }
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    const match = scriptURL && scriptURL.match(/:\/\/([a-zA-Z0-9.-]+):/);
    if (match && IPV4_REGEX.test(match[1]) && match[1] !== '127.0.0.1') {
      return match[1];
    }
  } catch (e) {
    // fallback
  }
  return null;
};

export const getCandidateHosts = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return ['localhost'];
    if (IPV4_REGEX.test(hostname)) return [hostname];
  }
  const hosts = [getDevServerIp(), ...KNOWN_LAPTOP_IPS].filter(Boolean);
  return [...new Set(hosts)];
};

export const getHostIp = () => getCandidateHosts()[0];

export const getApiUrl = () => `http://${getHostIp()}:${API_PORT}/api`;

const probeHost = async (host) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    const res = await fetch(`http://${host}:${API_PORT}/api/health`, { signal: controller.signal });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return `http://${host}:${API_PORT}/api`;
  } finally {
    clearTimeout(timer);
  }
};

// Resolves with the first reachable API url, or null if none answer
const findReachableApiUrl = (hosts) =>
  new Promise((resolve) => {
    let pending = hosts.length;
    if (pending === 0) resolve(null);
    hosts.forEach((host) => {
      probeHost(host)
        .then(resolve)
        .catch(() => {
          pending -= 1;
          if (pending === 0) resolve(null);
        });
    });
  });

class ApiService {
  constructor() {
    this.customBaseUrl = null;
    this.resolvedBaseUrl = null;
    this.resolving = null;
    this.token = null;
  }

  get baseUrl() {
    return this.customBaseUrl || this.resolvedBaseUrl || getApiUrl();
  }

  setBaseUrl(url) {
    this.customBaseUrl = url;
  }

  setToken(token) {
    this.token = token;
  }

  // Find which laptop IP the backend is reachable on (shared by concurrent requests)
  async resolveBaseUrl() {
    if (!this.resolving) {
      this.resolving = findReachableApiUrl(getCandidateHosts()).then((url) => {
        this.resolving = null;
        if (url) this.resolvedBaseUrl = url;
        return url;
      });
    }
    return this.resolving;
  }

  async request(endpoint, options = {}, isRetry = false) {
    if (!this.customBaseUrl && !this.resolvedBaseUrl) {
      await this.resolveBaseUrl();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutMs = options.timeout || 12000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      // Could not reach the server: laptop may have switched Wi-Fi, so re-detect once and retry
      if (!isRetry && !this.customBaseUrl) {
        const previousUrl = this.resolvedBaseUrl;
        this.resolvedBaseUrl = null;
        const newUrl = await this.resolveBaseUrl();
        if (newUrl && newUrl !== previousUrl) {
          return this.request(endpoint, options, true);
        }
      }
      const msg = `Cannot connect to server (tried ${getCandidateHosts().join(', ')}). Make sure the backend is running and phone & laptop are on the same Wi-Fi.`;
      console.warn('[API CONNECTION]', `${options.method || 'GET'} ${url}:`, err.message);
      throw new Error(msg);
    }
    clearTimeout(timer);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwords) {
    return this.request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify(passwords),
    });
  }

  // Ticket endpoints with exact RBAC scoping
  async getTickets(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.append('status', params.status);
    if (params.priority && params.priority !== 'all') query.append('priority', params.priority);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.department && params.department !== 'all') query.append('department', params.department);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString();
    return this.request(`/tickets${queryString ? `?${queryString}` : ''}`);
  }

  async getTicketById(id) {
    return this.request(`/tickets/${id}`);
  }

  async createTicket(ticketData) {
    return this.request('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  }

  async updateTicket(id, ticketData) {
    return this.request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(ticketData),
    });
  }

  async deleteTicket(id) {
    return this.request(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTicketStatus(id, status, resolutionNotes = '') {
    return this.request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  async assignTicket(id, technicianId) {
    return this.request(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ technicianId }),
    });
  }

  async addComment(id, message, isInternal = false) {
    return this.request(`/tickets/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ message, isInternal }),
    });
  }

  async getDashboardStats() {
    return this.request('/tickets/stats/dashboard');
  }

  // Notifications API
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // User & Department management
  async getAllUsers() {
    return this.request('/users');
  }

  async createUser(userData) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getTechnicians() {
    return this.request('/users/technicians');
  }

  async updateUser(id, updateData) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getDepartments() {
    return this.request('/users/departments');
  }

  async createDepartment(deptData) {
    return this.request('/users/departments', {
      method: 'POST',
      body: JSON.stringify(deptData),
    });
  }

  async updateDepartment(id, deptData) {
    return this.request(`/users/departments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(deptData),
    });
  }

  async deleteDepartment(id) {
    return this.request(`/users/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // Messaging Endpoints
  async sendMessage(msgData) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(msgData),
    });
  }

  async getChannelMessages(channel) {
    return this.request(`/messages/channel/${channel}`);
  }

  async getGroups() {
    return this.request('/messages/groups');
  }

  async createGroup(groupData) {
    return this.request('/messages/groups', {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
  }

  async getDirectMessages(userId) {
    return this.request(`/messages/direct/${userId}`);
  }

  async getConversations() {
    return this.request('/messages/conversations');
  }
}

export const api = new ApiService();
