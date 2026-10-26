import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badges';

export const Header = ({
  onOpenUsersModal,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onGoToLanding,
}) => {
  const { user, logout, isAdmin } = useAuth();

  return (
    <View style={styles.navbar}>
      <View style={styles.brandRow}>
        <Text style={styles.brandTitle}>Complaint Portal</Text>
      </View>

      <View style={styles.userSection}>
        {/* Notifications */}
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={onOpenNotifications}
        >
          <Text style={styles.bellText}>Alerts</Text>
          {unreadNotificationsCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadNotificationsCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userDept}>{user?.department}</Text>
        </View>

        <RoleBadge role={user?.role} />

        {isAdmin && onOpenUsersModal && (
          <TouchableOpacity style={styles.adminBtn} onPress={onOpenUsersModal}>
            <Text style={styles.adminBtnText}>Manage Roles</Text>
          </TouchableOpacity>
        )}

        {onGoToLanding && (
          <TouchableOpacity style={styles.homeBtn} onPress={onGoToLanding}>
            <Text style={styles.homeBtnText}>Home Page</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  bellBtn: {
    position: 'relative',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  bellIcon: {
    fontSize: 18,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#DC2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  userDept: {
    fontSize: 11,
    color: '#6B7280',
  },
  adminBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminBtnText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  homeBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  homeBtnText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
});
