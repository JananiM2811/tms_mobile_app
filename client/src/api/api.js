import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const FALLBACK_IP = '192.168.209.20';

const IPV4_REGEX = /^\d+\.\d+\.\d+\.\d+$/;

export const getHostIp = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'localhost';
      }
      if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
        return window.location.hostname;
      }
      return FALLBACK_IP;
    }
    return 'localhost';
  }
  // Expo dev server address (e.g. "192.168.1.5:8081") = laptop IP running the backend
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
    if (scriptURL) {
      const match = scriptURL.match(/:\/\/([a-zA-Z0-9.-]+):/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        if (/^\d+\.\d+\.\d+\.\d+$/.test(match[1])) {
          return match[1];
        }
      }
    }
  } catch (e) {
    // fallback
  }
  return FALLBACK_IP;
};

export const getApiUrl = () => {
  const host = getHostIp();
  return `http://${host}:5000/api`;
};

class ApiService {
  constructor() {
    this.customBaseUrl = null;
    this.token = null;
  }

  get baseUrl() {
    return this.customBaseUrl || getApiUrl();
  }

  setBaseUrl(url) {
    this.customBaseUrl = url;
  }

  setToken(token) {
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutMs = options.timeout || 12000;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError' || controller.signal.aborted) {
        const msg = `Connection timeout connecting to ${url}. Please verify both phone and laptop are on the same Wi-Fi.`;
        console.warn(`[API TIMEOUT]`, msg);
        throw new Error(msg);
      }
      console.warn(`[API ERROR] ${options.method || 'GET'} ${url}:`, err.message);
      throw err;
    }
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
