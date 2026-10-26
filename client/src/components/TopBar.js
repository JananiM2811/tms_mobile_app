import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NotificationIcon } from './NotificationIcon';

export const TopBar = ({
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenHowItWorks,
  onOpenProfile,
}) => {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const dateStr = now.toLocaleDateString('en-US', options);
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(`${dateStr} • ${timeStr}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getInitial = () => {
    return user?.name ? user.name[0].toUpperCase() : 'U';
  };

  return (
    <View style={styles.topbar}>
      {/* Left Date Time Pill (Matches Screenshot 2 Exactly) */}
      <View style={styles.datePill}>
        <Text style={styles.dateText}>{currentDateTime || 'Sunday, October 11, 2026'}</Text>
      </View>

      {/* Right Actions */}
      <View style={styles.rightSection}>
        {/* How It Works Button */}
        <TouchableOpacity style={styles.howItWorksBtn} onPress={onOpenHowItWorks}>
          <Text style={styles.howItWorksText}>How It Works</Text>
        </TouchableOpacity>

        {/* Notifications Button with 9+ Badge */}
        <TouchableOpacity style={styles.bellBtn} onPress={onOpenNotifications}>
          <NotificationIcon size={18} color="#475569" />
          {unreadNotificationsCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Pill (Matches Screenshot 2 Exactly) */}
        <TouchableOpacity
          style={styles.userPill}
          onPress={onOpenProfile}
          activeOpacity={0.7}
        >
          <View style={styles.userTextCol}>
            <Text style={styles.userNameText}>{user?.name || 'Janani'}</Text>
            <Text style={styles.userRoleText}>
              {user?.role === 'admin' ? 'SUPER ADMIN' : user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}
            </Text>
          </View>
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatarCircle,
                user?.avatar && user.avatar.startsWith('#')
                  ? { backgroundColor: user.avatar }
                  : null,
              ]}
            >
              <Text style={styles.avatarInitial}>{getInitial()}</Text>
            </View>
            <View style={styles.greenOnlineDot} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topbar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9', // Light gray pill from screenshot 2
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  calendarIcon: {
    fontSize: 13,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  howItWorksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  howItWorksIcon: {
    fontSize: 12,
  },
  howItWorksText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '700',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444', // Red 9+ badge from screenshot 2
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userTextCol: {
    alignItems: 'flex-end',
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  userRoleText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00C4DE', // Cyan circle from screenshot 2
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 13,
    fontWeight: '900',
    color: '#07172E',
  },
  greenOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
