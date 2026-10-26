import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { NotificationIcon } from './NotificationIcon';

export const Sidebar = ({
  activeView = 'dashboard',
  onSelectView,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenCreateTicket,
  onOpenProfile,
  onGoToLanding,
}) => {
  const { user, logout, isAdmin, isTeamLead } = useAuth();
  const [hrmsExpanded, setHrmsExpanded] = useState(true);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <View style={styles.sidebar}>
      {/* Top Logo Section (Matches Screenshot 2 Exactly) */}
      <View style={styles.topLogoSection}>
        <View style={styles.logoRow}>
          <Text style={styles.logoMain}>ZENXAI</Text>
          <View style={styles.logoDivider} />
          <Text style={styles.logoCRM}>CRM</Text>
        </View>
        <Text style={styles.logoTagline}>AGENTIC AI FOR BUSINESS AUTOMATION</Text>
      </View>

      <ScrollView style={styles.menuScroll} showsVerticalScrollIndicator={false}>
        {/* Main Dashboard Pill Button (Active Cyan) */}
        <TouchableOpacity
          style={[styles.menuItem, activeView === 'dashboard' && styles.menuItemActive]}
          onPress={() => onSelectView('dashboard')}
        >
          <Text style={[styles.menuText, activeView === 'dashboard' && styles.menuTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Complaints / Work Management Group */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={() => onSelectView('tickets')}
          >
            <Text style={styles.groupHeaderText}>| WORK MANAGEMENT &gt;</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subMenuItem, activeView === 'tickets' && styles.subMenuItemActive]}
            onPress={() => onSelectView('tickets')}
          >
            <Text style={[styles.subMenuText, activeView === 'tickets' && styles.subMenuTextActive]}>
              Complaints Queue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.subMenuItem}
            onPress={onOpenCreateTicket}
          >
            <Text style={styles.subMenuText}>Raise Complaint</Text>
          </TouchableOpacity>
        </View>

        {/* HRMS Menu Group (Expanded in Screenshot 3!) */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={() => setHrmsExpanded(!hrmsExpanded)}
          >
            <Text style={styles.groupHeaderText}>
              | HRMS {hrmsExpanded ? 'v' : '&gt;'}
            </Text>
          </TouchableOpacity>

          {hrmsExpanded && (
            <View style={styles.submenuBox}>
              {/* Team */}
              <TouchableOpacity
                style={[styles.subMenuItem, activeView === 'team' && styles.subMenuItemActive]}
                onPress={() => onSelectView('team')}
              >
                <Text style={[styles.subMenuText, activeView === 'team' && styles.subMenuTextActive]}>
                  Team
                </Text>
              </TouchableOpacity>

              {/* Departments (Admin Only) */}
              {isAdmin && (
                <TouchableOpacity
                  style={[styles.subMenuItem, activeView === 'departments' && styles.subMenuItemActive]}
                  onPress={() => onSelectView('departments')}
                >
                  <Text style={[styles.subMenuText, activeView === 'departments' && styles.subMenuTextActive]}>
                    Departments
                  </Text>
                </TouchableOpacity>
              )}

              {/* Monitoring */}
              <TouchableOpacity
                style={[styles.subMenuItem, activeView === 'monitoring' && styles.subMenuItemActive]}
                onPress={() => onSelectView('monitoring')}
              >
                <Text style={[styles.subMenuText, activeView === 'monitoring' && styles.subMenuTextActive]}>
                  Monitoring
                </Text>
              </TouchableOpacity>

              {/* Attendance */}
              <TouchableOpacity style={styles.subMenuItem}>
                <Text style={styles.subMenuText}>Attendance</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Communication */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.groupHeader}
            onPress={onOpenNotifications}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <NotificationIcon size={13} color="#94A3B8" />
              <Text style={styles.groupHeaderText}>NOTIFICATIONS &gt;</Text>
            </View>
            {unreadNotificationsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Analytics */}
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.groupHeader}>
            <Text style={styles.groupHeaderText}>| ANALYTICS &gt;</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Controls (Matches Screenshot 2 & 3 Exactly) */}
      <View style={styles.bottomControls}>
        <View style={styles.dualBtnsRow}>
          <TouchableOpacity style={styles.settingsBtn} onPress={onOpenProfile}>
            <Text style={styles.settingsBtnText}>SETTINGS</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportBtn} onPress={onOpenProfile}>
            <Text style={styles.supportBtnText}>PROFILE</Text>
          </TouchableOpacity>
        </View>

        {/* User Profile Card with green online dot */}
        <TouchableOpacity
          style={styles.userCard}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatarCircle,
                user?.avatar && user.avatar.startsWith('#')
                  ? { backgroundColor: user.avatar }
                  : null,
              ]}
            >
              <Text style={styles.avatarInitial}>{getInitials(user?.name)}</Text>
            </View>
            <View style={styles.greenOnlineDot} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <View style={styles.sidebarRoleBadge}>
              <Text style={styles.sidebarRoleText}>
                {user?.role === 'admin' ? 'Super Admin' : user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Back Button */}
        {onGoToLanding && (
          <TouchableOpacity style={styles.homeBtn} onPress={onGoToLanding}>
            <Text style={styles.homeBtnText}>← Back</Text>
          </TouchableOpacity>
        )}

        {/* Salmon / Coral Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    backgroundColor: '#07172E', // Deep Navy from Screenshot 2 & 3
    height: '100%',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
  },
  topLogoSection: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMain: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoDivider: {
    width: 2,
    height: 16,
    backgroundColor: '#00C5E0',
  },
  logoCRM: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00C5E0', // Cyan CRM
    letterSpacing: 1,
  },
  logoTagline: {
    fontSize: 8,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.9,
    marginTop: 3,
  },
  menuScroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  menuItemActive: {
    backgroundColor: '#00C4DE', // Vibrant Cyan active button from screenshot 2!
  },
  menuIcon: {
    fontSize: 16,
    marginRight: 10,
    color: '#FFFFFF',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  menuTextActive: {
    color: '#07172E', // Dark text on active cyan button
    fontWeight: '800',
  },
  menuGroup: {
    marginBottom: 10,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 4,
  },
  groupHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  notifBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  notifBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  submenuBox: {
    paddingLeft: 10,
    gap: 2,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  subMenuItemActive: {
    backgroundColor: 'rgba(0, 196, 222, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#00C4DE',
  },
  subMenuIcon: {
    fontSize: 14,
    marginRight: 10,
  },
  subMenuText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  subMenuTextActive: {
    color: '#00C4DE',
    fontWeight: '700',
  },
  bottomControls: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  dualBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  settingsBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingsBtnText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  supportBtn: {
    flex: 1,
    backgroundColor: '#00C4DE', // Cyan Support button from Screenshot 3!
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  supportBtnText: {
    color: '#07172E',
    fontSize: 10,
    fontWeight: '800',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#00C4DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#07172E',
    fontSize: 13,
    fontWeight: '900',
  },
  greenOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981', // Green online dot from screenshot 2 & 3!
    borderWidth: 1.5,
    borderColor: '#07172E',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  userEmail: {
    fontSize: 10,
    color: '#94A3B8',
  },
  sidebarRoleBadge: {
    backgroundColor: 'rgba(0, 196, 222, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  sidebarRoleText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00C4DE',
    letterSpacing: 0.5,
  },
  homeBtn: {
    backgroundColor: '#0F264A',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  homeBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#FA7575', // Salmon / Coral Logout button from Screenshot 2 & 3!
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
