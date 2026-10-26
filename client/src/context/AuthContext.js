import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('@ticket_token');
      const storedUser = await AsyncStorage.getItem('@ticket_user');

      if (storedToken && storedUser) {
        api.setToken(storedToken);
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          // ignore json parse error
        }

        // Validate session in background without blocking app startup
        api.getMe()
          .then((meRes) => {
            if (meRes.success && meRes.user) {
              setUser(meRes.user);
              AsyncStorage.setItem('@ticket_user', JSON.stringify(meRes.user));
            } else {
              logout();
            }
          })
          .catch((err) => {
            console.log('Background auth sync skipped (offline or server starting):', err.message);
          });
      }
    } catch (e) {
      console.warn('Error reading stored auth session:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.login(email, password);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        api.setToken(response.token);

        await AsyncStorage.setItem('@ticket_token', response.token);
        await AsyncStorage.setItem('@ticket_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Login failed');
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await api.register(userData);
      if (response.success && response.token) {
        setToken(response.token);
        setUser(response.user);
        api.setToken(response.token);

        await AsyncStorage.setItem('@ticket_token', response.token);
        await AsyncStorage.setItem('@ticket_user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      throw new Error(response.message || 'Registration failed');
    } catch (err) {
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    try {
      await AsyncStorage.removeItem('@ticket_token');
      await AsyncStorage.removeItem('@ticket_user');
    } catch (e) {
      console.warn('Error removing stored auth session:', e);
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const res = await api.updateProfile(profileData);
      if (res.success && res.user) {
        setUser((prev) => ({ ...prev, ...res.user }));
        await AsyncStorage.setItem('@ticket_user', JSON.stringify({ ...user, ...res.user }));
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Failed to update profile');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const changeUserPassword = async (passwords) => {
    try {
      const res = await api.changePassword(passwords);
      if (res.success) {
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Failed to change password');
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
        changeUserPassword,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        isTeamLead: user?.role === 'team_lead',
        isTechnician: user?.role === 'technician',
        isEmployee: user?.role === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
