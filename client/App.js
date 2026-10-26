import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, ActivityIndicator, View, Platform, LogBox } from 'react-native';

LogBox.ignoreLogs(['Cannot connect to Expo CLI', 'Setting a timer']);

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LandingScreen } from './src/screens/LandingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainDashboard } from './src/screens/MainDashboard';

const TMS_FAVICON_DATA_URL = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='47' fill='%230B0F17' stroke='%231F2937' stroke-width='2'/%3E%3Cpath d='M 17 50 C 17 31 31 16 52 16 C 70 16 83 26 86 38 C 81 29 70 21 52 21 C 36 21 24 33 22 50 C 21 53 19 53 17 50 Z' fill='%23FF1E56'/%3E%3Cpath d='M 83 50 C 83 69 69 84 48 84 C 30 84 17 74 14 62 C 19 71 30 79 48 79 C 64 79 76 67 78 50 C 79 47 81 47 83 50 Z' fill='%2300F0FF'/%3E%3Ctext x='50' y='58' text-anchor='middle' fill='%2300E5FF' font-size='24' font-weight='900' font-style='italic' font-family='sans-serif'%3ETMS%3C/text%3E%3C/svg%3E`;

const updateBrowserTab = () => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.title = 'TMS';
    try {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.type = 'image/svg+xml';
      link.href = TMS_FAVICON_DATA_URL;
    } catch (e) {
      // ignore
    }
  }
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  // 'landing' | 'login' | 'dashboard'
  const [currentView, setCurrentView] = useState('landing');

  React.useEffect(() => {
    updateBrowserTab();
  }, []);

  // When authentication status changes, automatically show dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  // If user is logged in
  if (isAuthenticated) {
    if (currentView === 'landing') {
      return (
        <LandingScreen
          onGoToLogin={() => setCurrentView('dashboard')}
        />
      );
    }

    return (
      <MainDashboard
        onGoToLanding={() => setCurrentView('landing')}
      />
    );
  }

  // If user is not logged in: toggle between Landing Page and Login Page
  if (currentView === 'login') {
    return (
      <LoginScreen
        onBackToLanding={() => setCurrentView('landing')}
      />
    );
  }

  return (
    <LandingScreen
      onGoToLogin={() => setCurrentView('login')}
    />
  );
};

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0B0F19"
        translucent={false}
      />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
