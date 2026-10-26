import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Modal,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/StatsCard';
import { TicketCard } from '../components/TicketCard';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { EditTicketModal } from '../components/EditTicketModal';
import { TicketDetailModal } from '../components/TicketDetailModal';
import { CreateDepartmentModal } from '../components/CreateDepartmentModal';
import { EditDepartmentModal } from '../components/EditDepartmentModal';
import { CreateUserModal } from '../components/CreateUserModal';
import { EditUserModal } from '../components/EditUserModal';
import { NotificationsModal } from '../components/NotificationsModal';
import { ProfileSettingsModal } from '../components/ProfileSettingsModal';
import { NotificationIcon } from '../components/NotificationIcon';
import { TMSLogoIcon } from '../components/TMSLogo';
import {
  FiChevronDown,
  FiArrowLeft,
  FiLogOut,
  FiSettings,
  FiGrid,
  FiCheckSquare,
  FiLayers,
  FiUsers,
  FiBarChart2,
  FiShield,
  FiBookOpen,
  FiStar,
  FiDownload,
  FiMessageSquare,
  FiMenu,
  FiX,
} from '../components/Icons';
import { RoleBadge } from '../components/Badges';
import { api } from '../api/api';
import { AnalyticsView } from '../components/AnalyticsView';
import { AuditLogsView } from '../components/AuditLogsView';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { FeedbackView } from '../components/FeedbackView';
import { MessagesView } from '../components/MessagesView';
import { exportTicketsToCSV } from '../utils/exportUtils';
import { confirmAction } from '../utils/confirmAction';
import { SelectDropdown } from '../components/SelectDropdown';

const getDisplayRole = (role) => {
  if (!role) return 'Employee';
  const r = role.toLowerCase();
  if (r === 'admin') return 'Super Admin';
  if (r === 'team_lead') return 'Team Lead';
  if (r === 'technician') return 'Technician';
  return 'Employee';
};

const STATUS_TABS = [
  { id: 'all', label: 'All Complaints' },
  { id: 'open', label: 'Open' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'resolved', label: 'Resolved' },
  { id: 'closed', label: 'Closed' },
];

export const MainDashboard = ({ onGoToLanding }) => {
  const { user, logout, isAdmin, isTeamLead, isTechnician, isEmployee } = useAuth();

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active navigation tab: 'dashboard' | 'tickets' | 'departments' | 'users'
  const [activeNav, setActiveNav] = useState('dashboard');

  // Tickets & Stats
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Departments & Users
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [createTicketModalVisible, setCreateTicketModalVisible] = useState(false);
  const [createDeptModalVisible, setCreateDeptModalVisible] = useState(false);
  const [createUserModalVisible, setCreateUserModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEditTicket, setSelectedEditTicket] = useState(null);
  const [selectedEditDept, setSelectedEditDept] = useState(null);
  const [selectedEditUser, setSelectedEditUser] = useState(null);
  const [selectedDMTarget, setSelectedDMTarget] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const changeNav = (nav) => {
    setActiveNav(nav);
    if (isMobile) setMobileMenuOpen(false);
  };

  const handleUpdateDepartment = (updatedDept) => {
    setDepartments((prev) =>
      prev.map((d) => (d._id === updatedDept._id ? updatedDept : d))
    );
    showToast(`Department "${updatedDept.name}" updated!`);
  };

  const handleDeleteDepartment = async (deptId) => {
    const ok = await confirmAction('Are you sure you want to delete this department?');
    if (!ok) return;
    try {
      const res = await api.deleteDepartment(deptId);
      if (res.success) {
        setDepartments((prev) => prev.filter((d) => d._id !== deptId));
        showToast('Department deleted successfully');
      }
    } catch (err) {
      showToast('Error deleting department: ' + err.message);
    }
  };

  const handleUpdateUser = (updatedUser) => {
    setUsersList((prev) =>
      prev.map((u) => (u._id === updatedUser._id || u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
    );
    showToast(`User "${updatedUser.name}" updated!`);
  };

  const handleDeleteUser = async (userId) => {
    const ok = await confirmAction('Are you sure you want to delete this user?');
    if (!ok) return;
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u._id !== userId));
        showToast('User deleted successfully');
      }
    } catch (err) {
      showToast('Error deleting user: ' + err.message);
    }
  };

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Error fetching notifications:', e.message);
    }
  }, []);

  const fetchTicketsAndStats = useCallback(async () => {
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        api.getTickets({
          status: selectedStatus,
          department: isAdmin ? selectedDepartment : undefined,
          search: searchQuery,
        }),
        api.getDashboardStats(),
      ]);

      if (ticketsRes.success) setTickets(ticketsRes.tickets || []);
      if (statsRes.success) setStats(statsRes.stats || null);
    } catch (err) {
      console.warn('Error fetching tickets/stats:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, selectedDepartment, searchQuery, isAdmin]);

  const loadDepartments = useCallback(async () => {
    setLoadingDepts(true);
    try {
      const res = await api.getDepartments();
      if (res.success) setDepartments(res.departments || []);
    } catch (err) {
      console.warn('Error fetching departments:', err.message);
    } finally {
      setLoadingDepts(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.getAllUsers();
      if (res.success) setUsersList(res.users || []);
    } catch (err) {
      console.warn('Error fetching users:', err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchTicketsAndStats();
    loadNotifications();
    loadDepartments();
    loadUsers();
  }, [fetchTicketsAndStats, loadNotifications, loadDepartments, loadUsers]);

  // Live polling for notifications every 3.5s so bells and badges update in real time
  useEffect(() => {
    const timer = setInterval(() => {
      loadNotifications();
    }, 3500);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTicketsAndStats();
    loadNotifications();
    loadDepartments();
    loadUsers();
  };

  // Ticket actions
  const handleCreateTicket = async (ticketData) => {
    try {
      const res = await api.createTicket(ticketData);
      if (res.success) {
        showToast('Complaint raised successfully!');
        fetchTicketsAndStats();
        loadNotifications();
      }
    } catch (err) {
      showToast('Failed to raise complaint: ' + err.message);
      throw err;
    }
  };

  const handleStatusUpdate = async (id, status, resolutionNotes) => {
    try {
      const res = await api.updateTicketStatus(id, status, resolutionNotes);
      if (res.success) {
        showToast(`Status updated to "${status}"`);
        setSelectedTicket(res.ticket);
        fetchTicketsAndStats();
        loadNotifications();
      }
    } catch (err) {
      showToast('Failed to update status: ' + err.message);
      throw err;
    }
  };

  const handleAssignUpdate = async (id, technicianId) => {
    try {
      const res = await api.assignTicket(id, technicianId);
      if (res.success) {
        showToast('Complaint assigned successfully!');
        setSelectedTicket(res.ticket);
        fetchTicketsAndStats();
        loadNotifications();
      }
    } catch (err) {
      showToast('Failed to assign complaint: ' + err.message);
      throw err;
    }
  };

  const handleUpdateTicket = async (ticketId, updateData) => {
    try {
      const res = await api.updateTicket(ticketId, updateData);
      if (res.success) {
        showToast('Complaint updated successfully!');
        fetchTicketsAndStats();
        loadNotifications();
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(res.ticket);
        }
      }
    } catch (err) {
      showToast('Failed to update complaint: ' + err.message);
      throw err;
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const res = await api.deleteTicket(ticketId);
      if (res.success) {
        showToast('Complaint deleted successfully!');
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket(null);
        }
        setSelectedEditTicket(null);
        fetchTicketsAndStats();
        loadNotifications();
      }
    } catch (err) {
      showToast('Failed to delete complaint: ' + err.message);
      throw err;
    }
  };

  const handleAddComment = async (id, message, isInternal) => {
    try {
      const res = await api.addComment(id, message, isInternal);
      if (res.success) {
        showToast('Comment posted');
        setSelectedTicket(res.ticket);
        fetchTicketsAndStats();
        loadNotifications();
      }
    } catch (err) {
      showToast('Failed to post comment: ' + err.message);
      throw err;
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const res = await api.updateUser(userId, { role: newRole });
      if (res.success) {
        showToast('User role updated');
        setUsersList((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      showToast('Error updating role: ' + err.message);
    }
  };

  const renderSidebarContent = () => (
    <View style={styles.sidebarInner}>
      {/* Brand */}
      <TouchableOpacity
        style={styles.sidebarBrand}
        onPress={() => {
          if (isMobile) setMobileMenuOpen(false);
          if (onGoToLanding) onGoToLanding();
        }}
        activeOpacity={0.8}
        title="Go to Landing Page"
      >
        <TMSLogoIcon size={36} />
        <View>
          <Text style={styles.brandTitle}>TMS</Text>
          <Text style={styles.brandSub}>Ticket Management ↗</Text>
        </View>
      </TouchableOpacity>

      {/* Navigation Menu */}
      <View style={styles.menuList}>
        <TouchableOpacity
          style={[styles.menuItem, activeNav === 'dashboard' && styles.menuItemActive]}
          onPress={() => changeNav('dashboard')}
        >
          <FiGrid size={15} color={activeNav === 'dashboard' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.menuText, activeNav === 'dashboard' && styles.menuTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeNav === 'tickets' && styles.menuItemActive]}
          onPress={() => changeNav('tickets')}
        >
          <FiCheckSquare size={15} color={activeNav === 'tickets' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.menuText, activeNav === 'tickets' && styles.menuTextActive]}>
            Complaints
          </Text>
          {tickets.length > 0 && (
            <View style={styles.menuBadge}>
              <Text style={styles.menuBadgeText}>{tickets.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeNav === 'messages' && styles.menuItemActive]}
          onPress={() => {
            changeNav('messages');
            if (usersList.length === 0) loadUsers();
          }}
        >
          <FiMessageSquare size={15} color={activeNav === 'messages' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.menuText, activeNav === 'messages' && styles.menuTextActive]}>
            Team Messages
          </Text>
          {notifications.filter((n) => n.type === 'message' && !n.isRead).length > 0 && (
            <View style={[styles.menuBadge, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.menuBadgeText}>
                {notifications.filter((n) => n.type === 'message' && !n.isRead).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeNav === 'analytics' && styles.menuItemActive]}
          onPress={() => changeNav('analytics')}
        >
          <FiBarChart2 size={15} color={activeNav === 'analytics' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.menuText, activeNav === 'analytics' && styles.menuTextActive]}>
            Analytics & SLA
          </Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity
            style={[styles.menuItem, activeNav === 'departments' && styles.menuItemActive]}
            onPress={() => changeNav('departments')}
          >
            <FiLayers size={15} color={activeNav === 'departments' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.menuText, activeNav === 'departments' && styles.menuTextActive]}>
              Departments
            </Text>
            {departments.length > 0 && (
              <View style={styles.menuBadge}>
                <Text style={styles.menuBadgeText}>{departments.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {(isAdmin || isTeamLead) && (
          <TouchableOpacity
            style={[styles.menuItem, activeNav === 'users' && styles.menuItemActive]}
            onPress={() => changeNav('users')}
          >
            <FiUsers size={15} color={activeNav === 'users' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.menuText, activeNav === 'users' && styles.menuTextActive]}>
              Users & Team
            </Text>
          </TouchableOpacity>
        )}

        {(isAdmin || isTeamLead) && (
          <TouchableOpacity
            style={[styles.menuItem, activeNav === 'audit_logs' && styles.menuItemActive]}
            onPress={() => changeNav('audit_logs')}
          >
            <FiShield size={15} color={activeNav === 'audit_logs' ? '#38BDF8' : '#94A3B8'} />
            <Text style={[styles.menuText, activeNav === 'audit_logs' && styles.menuTextActive]}>
              Audit Logs
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.menuItem, activeNav === 'knowledge_base' && styles.menuItemActive]}
          onPress={() => changeNav('knowledge_base')}
        >
          <FiBookOpen size={15} color={activeNav === 'knowledge_base' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.menuText, activeNav === 'knowledge_base' && styles.menuTextActive]}>
            Knowledge Base
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, activeNav === 'feedback' && styles.menuItemActive]}
          onPress={() => changeNav('feedback')}
        >
          <FiStar size={15} color={activeNav === 'feedback' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.menuText, activeNav === 'feedback' && styles.menuTextActive]}>
            CSAT & Feedback
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sidebar Footer */}
      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={styles.sidebarUserCard}
          onPress={() => setProfileModalVisible(true)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.sidebarAvatar,
              user?.avatar && user.avatar.startsWith('#')
                ? { backgroundColor: user.avatar }
                : null,
            ]}
          >
            {user?.avatar && user.avatar.startsWith('data:') ? (
              <Image
                source={{ uri: user.avatar }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 18,
                }}
              />
            ) : (
              <Text style={styles.sidebarAvatarLetter}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            )}
            <View style={styles.sidebarOnlineDot} />
          </View>

          <View style={styles.sidebarUserInfo}>
            <Text style={styles.sidebarUserName} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <View style={styles.sidebarRoleBadge}>
              <Text style={styles.sidebarRoleText}>
                {getDisplayRole(user?.role)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {onGoToLanding && (
          <TouchableOpacity
            style={styles.homeLinkBtn}
            onPress={() => {
              if (isMobile) setMobileMenuOpen(false);
              onGoToLanding();
            }}
          >
            <FiArrowLeft size={14} color="#94A3B8" />
            <Text style={styles.homeLinkText}>Back to Home</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.sidebarLogoutBtn}
          onPress={() => {
            if (isMobile) setMobileMenuOpen(false);
            logout();
          }}
        >
          <FiLogOut size={13} color="#EF4444" />
          <Text style={styles.sidebarLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.layoutRoot, isMobile && { flexDirection: 'column' }]}>
      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <View style={styles.sidebar}>
          {renderSidebarContent()}
        </View>
      )}

      {/* MOBILE DRAWER MODAL */}
      {isMobile && (
        <Modal
          visible={mobileMenuOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setMobileMenuOpen(false)}
        >
          <View style={styles.mobileDrawerOverlay}>
            <TouchableOpacity
              style={styles.mobileDrawerBackdrop}
              onPress={() => setMobileMenuOpen(false)}
              activeOpacity={1}
            />
            <View style={styles.mobileDrawerContent}>
              <View style={styles.mobileDrawerHeader}>
                <TouchableOpacity
                  style={styles.drawerCloseBtn}
                  onPress={() => setMobileMenuOpen(false)}
                >
                  <FiX size={18} color="#FFFFFF" />
                  <Text style={styles.drawerCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
              {renderSidebarContent()}
            </View>
          </View>
        </Modal>
      )}

      {/* MAIN CONTENT AREA */}
      <View style={[styles.mainContent, isMobile && { width: '100%' }]}>
        {/* TOP BAR */}
        <View style={[styles.topBar, isMobile && { paddingHorizontal: 12, paddingVertical: 10 }]}>
          <View style={styles.topBarLeft}>
            {isMobile && (
              <TouchableOpacity
                style={styles.hamburgerBtn}
                onPress={() => setMobileMenuOpen(true)}
              >
                <FiMenu size={22} color="#0F172A" />
              </TouchableOpacity>
            )}
            <View style={styles.topBarBrandBadge}>
              <TMSLogoIcon size={26} />
              <Text style={styles.topBarBrandText}>TMS</Text>
            </View>
            <Text style={styles.topBarDivider}>/</Text>
            <Text style={[styles.pageTitle, isMobile && { fontSize: 16 }]} numberOfLines={1}>
              {activeNav === 'dashboard' && 'Dashboard'}
              {activeNav === 'tickets' && 'Complaints'}
              {activeNav === 'messages' && 'Team Chat'}
              {activeNav === 'departments' && 'Departments'}
              {activeNav === 'users' && 'Team & Roles'}
              {activeNav === 'analytics' && 'Analytics'}
              {activeNav === 'audit_logs' && 'Audit Logs'}
              {activeNav === 'knowledge_base' && 'Help Base'}
              {activeNav === 'feedback' && 'Ratings'}
            </Text>
          </View>

          {/* TOP RIGHT CORNER: Actions + Notifications + Profile Icon */}
          <View style={[styles.topBarRight, isMobile && { gap: 8 }]}>
            {/* Primary Action Button */}
            <TouchableOpacity
              style={[styles.raiseComplaintBtn, isMobile && { paddingHorizontal: 10, paddingVertical: 7 }]}
              onPress={() => setCreateTicketModalVisible(true)}
            >
              <Text style={styles.raiseComplaintBtnText}>
                {isMobile ? '+ Raise' : '+ Raise Complaint'}
              </Text>
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => setNotificationsModalVisible(true)}
            >
              <NotificationIcon size={18} color="#475569" />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* COMPACT PROFILE ICON ONLY (Eliminates Long Stretch) */}
            <View style={styles.topProfileContainer}>
              <TouchableOpacity
                style={styles.topProfileIconBtn}
                onPress={() => setProfileDropdownOpen(!profileDropdownOpen)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.avatarCircleOnly,
                    user?.avatar && user.avatar.startsWith('#')
                      ? { backgroundColor: user.avatar }
                      : null,
                  ]}
                >
                  {user?.avatar && user.avatar.startsWith('data:') ? (
                    <Image
                      source={{ uri: user.avatar }}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 18,
                      }}
                    />
                  ) : (
                    <Text style={styles.avatarIconLetter}>
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  )}
                  <View style={styles.topOnlineDot} />
                </View>
                <FiChevronDown size={14} color="#64748B" />
              </TouchableOpacity>

              {/* Invisible Backdrop to close dropdown on outside click */}
              {profileDropdownOpen && (
                <TouchableOpacity
                  style={styles.dropdownBackdrop}
                  onPress={() => setProfileDropdownOpen(false)}
                  activeOpacity={1}
                />
              )}

              {/* Profile Dropdown Popover */}
              {profileDropdownOpen && (
                <View style={styles.profileDropdownMenu}>
                  <View style={styles.dropdownHeader}>
                    <View
                      style={[
                        styles.dropdownAvatar,
                        user?.avatar && user.avatar.startsWith('#')
                          ? { backgroundColor: user.avatar }
                          : null,
                      ]}
                    >
                      {user?.avatar && user.avatar.startsWith('data:') ? (
                        <Image
                          source={{ uri: user.avatar }}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 18,
                          }}
                        />
                      ) : (
                        <Text style={styles.dropdownAvatarLetter}>
                          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Text>
                      )}
                    </View>
                    <View style={styles.dropdownMeta}>
                      <Text style={styles.dropdownName} numberOfLines={1}>
                        {user?.name || 'User'}
                      </Text>
                      {/* Role shown underneath name */}
                      <View style={styles.dropdownRoleBadge}>
                        <Text style={styles.dropdownRoleText}>
                          {getDisplayRole(user?.role)}
                        </Text>
                      </View>
                      <Text style={styles.dropdownDept} numberOfLines={1}>
                        {user?.department || 'General'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setProfileDropdownOpen(false);
                      setProfileModalVisible(true);
                    }}
                  >
                    <FiSettings size={15} color="#475569" />
                    <Text style={styles.dropdownItemText}>Profile & Settings</Text>
                  </TouchableOpacity>

                  {onGoToLanding && (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setProfileDropdownOpen(false);
                        onGoToLanding();
                      }}
                    >
                      <FiArrowLeft size={15} color="#475569" />
                      <Text style={styles.dropdownItemText}>Back</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.dropdownDivider} />

                  <TouchableOpacity
                    style={[styles.dropdownItem, styles.dropdownLogoutItem]}
                    onPress={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                  >
                    <FiLogOut size={15} color="#DC2626" />
                    <Text style={styles.dropdownLogoutText}>Log out</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Toast Alert */}
        {toastMessage ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}

        {/* SCROLL CONTENT */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[styles.scrollContainer, isMobile && { padding: 12 }]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {/* TAB 1: DASHBOARD */}
          {activeNav === 'dashboard' && (
            <View style={styles.sectionWrap}>
              {/* Role Scope Notice Card */}
              <View style={styles.noticeCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.noticeTitle}>
                    Role Access Scope: {user?.role ? user.role.toUpperCase() : 'USER'}
                  </Text>
                  <Text style={styles.noticeText}>
                    {isAdmin &&
                      'Administrator Scope: You can view all complaints across all departments, assign tickets, create new departments, and modify team roles.'}
                    {isTeamLead &&
                      `Team Lead Scope: You have access to all complaints routed to "${user?.department}". You can assign them to technicians in your team.`}
                    {isTechnician &&
                      'Technician Scope: You only see complaints directly assigned to you. You can update status and record resolution details.'}
                    {isEmployee &&
                      'Employee Scope: You can raise complaints and track tickets you have submitted.'}
                  </Text>
                </View>
              </View>

              {/* 4 Stats Cards */}
              <View style={styles.statsGrid}>
                <StatsCard
                  title="Total Complaints"
                  value={stats?.total || 0}
                  color="#0F172A"
                  bg="#FFFFFF"
                  subtitle="In your current scope"
                />
                <StatsCard
                  title="Open / New"
                  value={stats?.open || 0}
                  color="#D97706"
                  bg="#FFFFFF"
                  subtitle="Awaiting action"
                />
                <StatsCard
                  title="In Progress"
                  value={stats?.inProgress ?? stats?.in_progress ?? 0}
                  color="#475569"
                  bg="#FFFFFF"
                  subtitle="Under active work"
                />
                <StatsCard
                  title="Resolved / Closed"
                  value={(stats?.resolved || 0) + (stats?.closed || 0)}
                  color="#059669"
                  bg="#FFFFFF"
                  subtitle="Successfully completed"
                />
              </View>

              {/* Quick Actions Row */}
              <View style={styles.quickActionRow}>
                <TouchableOpacity
                  style={styles.quickActionCard}
                  onPress={() => setCreateTicketModalVisible(true)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickActionTitle}>Raise Complaint</Text>
                    <Text style={styles.quickActionSub}>Report an IT, Facility, or HR issue</Text>
                  </View>
                </TouchableOpacity>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => setCreateDeptModalVisible(true)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quickActionTitle}>Create Department</Text>
                      <Text style={styles.quickActionSub}>Add new departmental unit</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {(isAdmin || isTeamLead) && (
                  <TouchableOpacity
                    style={styles.quickActionCard}
                    onPress={() => setCreateUserModalVisible(true)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.quickActionTitle}>Add Team Member</Text>
                      <Text style={styles.quickActionSub}>Assign role and department</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Recent Complaints Section */}
              <View style={styles.tableCard}>
                <View style={styles.tableHeader}>
                  <Text style={styles.tableTitle}>Recent Complaints</Text>
                  <TouchableOpacity onPress={() => changeNav('tickets')}>
                    <Text style={styles.tableLink}>View All ({tickets.length}) →</Text>
                  </TouchableOpacity>
                </View>

                {loading ? (
                  <ActivityIndicator size="large" color="#0F172A" style={{ padding: 24 }} />
                ) : tickets.length === 0 ? (
                  <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>No Complaints Yet</Text>
                    <Text style={styles.emptySub}>
                      Your database is clean. Click below to raise your first real complaint!
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => setCreateTicketModalVisible(true)}
                    >
                      <Text style={styles.emptyActionText}>+ Raise First Complaint</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  tickets.slice(0, 5).map((t) => (
                    <TicketCard
                      key={t._id}
                      ticket={t}
                      onPress={() => setSelectedTicket(t)}
                      onEdit={() => setSelectedEditTicket(t)}
                      onDelete={() => handleDeleteTicket(t._id)}
                    />
                  ))
                )}
              </View>
            </View>
          )}

          {/* TAB 2: TICKETS / COMPLAINTS */}
          {activeNav === 'tickets' && (
            <View style={styles.sectionWrap}>
              {/* Filter Card */}
              <View style={styles.filterCard}>
                {/* Search & Export Row */}
                <View style={styles.searchRow}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search complaints by title, description or code..."
                    placeholderTextColor="#94A3B8"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity
                    style={styles.exportBtnTop}
                    onPress={() => exportTicketsToCSV(tickets)}
                  >
                    <FiDownload size={14} color="#0F172A" />
                    <Text style={styles.exportBtnTopText}>Export (.CSV)</Text>
                  </TouchableOpacity>
                </View>

                {/* Status Tabs - Clean Neutral Styling */}
                <View style={styles.tabsRow}>
                  {STATUS_TABS.map((tab) => {
                    const isActive = selectedStatus === tab.id;
                    return (
                      <TouchableOpacity
                        key={tab.id}
                        style={[
                          styles.filterTab,
                          isActive && styles.filterTabActive,
                        ]}
                        onPress={() => setSelectedStatus(tab.id)}
                      >
                        <Text
                          style={[
                            styles.filterTabText,
                            isActive && styles.filterTabTextActive,
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Department Filter with Shadcn SelectDropdown */}
                {isAdmin && departments.length > 0 && (
                  <View style={styles.deptFilterRowShadcn}>
                    <Text style={styles.deptFilterLabel}>FILTER DEPARTMENT:</Text>
                    <View style={{ width: 220 }}>
                      <SelectDropdown
                        value={selectedDepartment}
                        onSelect={setSelectedDepartment}
                        placeholder="All Departments"
                        options={[
                          { value: 'all', label: 'All Departments' },
                          ...departments.map((d) => ({ value: d.name, label: d.name })),
                        ]}
                        style={{ marginBottom: 0 }}
                      />
                    </View>
                  </View>
                )}
              </View>

              {/* Tickets List */}
              {loading ? (
                <ActivityIndicator size="large" color="#0F172A" style={{ padding: 40 }} />
              ) : tickets.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No Complaints Found</Text>
                  <Text style={styles.emptySub}>
                    Try clearing your search query or status filter.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyActionBtn}
                    onPress={() => setCreateTicketModalVisible(true)}
                  >
                    <Text style={styles.emptyActionText}>+ Raise New Complaint</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.ticketsList}>
                  {tickets.map((t) => (
                    <TicketCard
                      key={t._id}
                      ticket={t}
                      onPress={() => setSelectedTicket(t)}
                      onEdit={() => setSelectedEditTicket(t)}
                      onDelete={() => handleDeleteTicket(t._id)}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: DEPARTMENTS (Admin Only) */}
          {activeNav === 'departments' && isAdmin && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Organization Departments</Text>
                  <Text style={styles.sectionSub}>
                    Departments route complaints to technicians and team leads.
                  </Text>
                </View>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.actionHeaderBtn}
                    onPress={() => setCreateDeptModalVisible(true)}
                  >
                    <Text style={styles.actionHeaderBtnText}>+ Create Department</Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingDepts ? (
                <ActivityIndicator size="large" color="#0F172A" style={{ padding: 40 }} />
              ) : departments.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No Departments Created</Text>
                  <Text style={styles.emptySub}>
                    Create your first department to organize workflows.
                  </Text>
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => setCreateDeptModalVisible(true)}
                    >
                      <Text style={styles.emptyActionText}>+ Create Department</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.departmentsGrid}>
                  {departments.map((dept) => (
                    <View key={dept._id} style={styles.deptCard}>
                      <View style={styles.deptCardTop}>
                        <View style={styles.deptCodeBadge}>
                          <Text style={styles.deptCodeText}>
                            {dept.code || 'DEP'}
                          </Text>
                        </View>
                        <Text style={styles.deptCardName}>{dept.name}</Text>
                      </View>
                      <Text style={styles.deptCardDesc}>
                        {dept.description || 'General departmental operational scope.'}
                      </Text>

                      {isAdmin && (
                        <View style={styles.deptCardActionRow}>
                          <TouchableOpacity
                            style={styles.cardEditBtn}
                            onPress={() => setSelectedEditDept(dept)}
                          >
                            <Text style={styles.cardEditBtnText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cardDeleteBtn}
                            onPress={() => handleDeleteDepartment(dept._id)}
                          >
                            <Text style={styles.cardDeleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 4: USERS / TEAM */}
          {activeNav === 'users' && (
            <View style={styles.sectionWrap}>
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionHeading}>Team & RBAC Directory</Text>
                  <Text style={styles.sectionSub}>
                    Manage user roles, departmental assignments, credentials and permissions.
                  </Text>
                </View>

                {isAdmin && (
                  <TouchableOpacity
                    style={styles.actionHeaderBtn}
                    onPress={() => setCreateUserModalVisible(true)}
                  >
                    <Text style={styles.actionHeaderBtnText}>+ Add Team Member</Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingUsers ? (
                <ActivityIndicator size="large" color="#0F172A" style={{ padding: 40 }} />
              ) : usersList.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No Users Found</Text>
                  <Text style={styles.emptySub}>
                    Add members to your organization to assign tickets and roles.
                  </Text>
                </View>
              ) : (
                <View style={styles.usersTableCard}>
                  {usersList.map((u) => (
                    <View key={u._id} style={styles.userRow}>
                      <View style={styles.userMainCol}>
                        <View style={styles.userNameBadgeRow}>
                          <Text style={styles.tableUserName}>{u.name}</Text>
                          <RoleBadge role={u.role} />
                          {u.status === 'inactive' && (
                            <View style={styles.inactivePill}>
                              <Text style={styles.inactivePillText}>INACTIVE</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.tableUserEmail}>{u.email}</Text>
                        <Text style={styles.tableUserDept}>
                          {u.department || 'General'}{u.phone ? ` • Phone: ${u.phone}` : ''}
                        </Text>
                      </View>

                      {isAdmin && (
                        <View style={styles.userActionsRightCol}>
                          <TouchableOpacity
                            style={styles.userEditBtn}
                            onPress={() => setSelectedEditUser(u)}
                          >
                            <Text style={styles.userEditBtnText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.userDeleteBtn}
                            onPress={() => handleDeleteUser(u._id)}
                          >
                            <Text style={styles.userDeleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* TAB 5: ANALYTICS & INSIGHTS */}
          {activeNav === 'analytics' && (
            <AnalyticsView tickets={tickets} departments={departments} />
          )}

          {/* TAB 6: AUDIT LOGS */}
          {activeNav === 'audit_logs' && (
            <AuditLogsView tickets={tickets} />
          )}

          {/* TAB 7: KNOWLEDGE BASE */}
          {activeNav === 'knowledge_base' && (
            <KnowledgeBaseView onOpenCreateTicket={() => setCreateTicketModalVisible(true)} />
          )}

          {/* TAB 8: CSAT & FEEDBACK */}
          {activeNav === 'feedback' && (
            <FeedbackView tickets={tickets} user={user} />
          )}

          {/* TAB 9: TEAM MESSAGES & CHAT */}
          {activeNav === 'messages' && (
            <MessagesView
              usersList={usersList}
              currentUser={user}
              onOpenCreateUser={() => setCreateUserModalVisible(true)}
              selectedTarget={selectedDMTarget}
              onTargetSelected={() => setSelectedDMTarget(null)}
            />
          )}
        </ScrollView>
      </View>

      {/* ALL MODALS */}
      <CreateTicketModal
        visible={createTicketModalVisible}
        onClose={() => setCreateTicketModalVisible(false)}
        onSubmit={handleCreateTicket}
        departments={departments}
      />

      <CreateDepartmentModal
        visible={createDeptModalVisible}
        onClose={() => setCreateDeptModalVisible(false)}
        onCreated={(newDept) => {
          showToast(`Department "${newDept.name}" created!`);
          loadDepartments();
        }}
      />

      <CreateUserModal
        visible={createUserModalVisible}
        departments={departments}
        onClose={() => setCreateUserModalVisible(false)}
        onCreated={(newUser) => {
          showToast(`User "${newUser.name}" added successfully!`);
          loadUsers();
        }}
      />

      <EditDepartmentModal
        visible={!!selectedEditDept}
        department={selectedEditDept}
        onClose={() => setSelectedEditDept(null)}
        onUpdated={handleUpdateDepartment}
        onDeleted={handleDeleteDepartment}
      />

      <EditUserModal
        visible={!!selectedEditUser}
        user={selectedEditUser}
        departments={departments}
        onClose={() => setSelectedEditUser(null)}
        onUpdated={handleUpdateUser}
        onDeleted={handleDeleteUser}
      />

      <TicketDetailModal
        visible={!!selectedTicket}
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onStatusUpdated={handleStatusUpdate}
        onAssignUpdated={handleAssignUpdate}
        onCommentAdded={handleAddComment}
        onEdit={(t) => setSelectedEditTicket(t)}
        onDelete={(id) => handleDeleteTicket(id)}
      />

      <EditTicketModal
        visible={!!selectedEditTicket}
        ticket={selectedEditTicket}
        departments={departments}
        onClose={() => setSelectedEditTicket(null)}
        onUpdated={handleUpdateTicket}
        onDeleted={handleDeleteTicket}
      />

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onSelectTicket={(ticketId) => {
          setNotificationsModalVisible(false);
          const found = tickets.find((t) => t._id === ticketId);
          if (found) setSelectedTicket(found);
        }}
        onSelectMessage={(notif) => {
          setNotificationsModalVisible(false);
          const senderId = notif.sender?._id || notif.sender?.id || notif.sender;
          const senderName = notif.sender?.name || 'Team Member';
          if (senderId) {
            setSelectedDMTarget({ id: String(senderId), name: senderName });
          }
          changeNav('messages');
        }}
        onMarkAllRead={async () => {
          await api.markAllNotificationsAsRead();
          loadNotifications();
        }}
      />

      <ProfileSettingsModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        departments={departments}
        onProfileUpdated={(updated) => {
          showToast(`Profile updated for ${updated.name}!`);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  layoutRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    height: '100%',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#0F172A',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
  },
  sidebarBrand: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandLogo: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandSub: {
    fontSize: 11,
    color: '#94A3B8',
  },
  menuList: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    gap: 4,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: '#1E293B',
  },
  menuIcon: {
    fontSize: 16,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#94A3B8',
    flex: 1,
  },
  menuTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  menuBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuBadgeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  sidebarFooter: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: 8,
  },
  sidebarUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 4,
    cursor: 'pointer',
  },
  sidebarAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00C4DE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sidebarAvatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  sidebarOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  sidebarUserInfo: {
    flex: 1,
  },
  sidebarUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  sidebarRoleBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 3,
  },
  sidebarRoleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  homeLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  homeLinkText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  sidebarLogoutText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 900,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarInner: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  mobileDrawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 9999,
  },
  mobileDrawerBackdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  mobileDrawerContent: {
    width: 275,
    height: '100%',
    backgroundColor: '#0F172A',
    zIndex: 10000,
  },
  mobileDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  drawerCloseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#1E293B',
    borderRadius: 6,
  },
  drawerCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  topBarBrandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: '#0F172A',
  },
  topBarBrandText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#00E5FF',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  topBarDivider: {
    fontSize: 15,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    zIndex: 901,
  },
  raiseComplaintBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  raiseComplaintBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIcon: {
    fontSize: 16,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  /* TOP RIGHT COMPACT PROFILE ICON & DROPDOWN */
  topProfileContainer: {
    position: 'relative',
    zIndex: 999,
  },
  dropdownBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 9998,
    backgroundColor: 'transparent',
  },
  topProfileIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 3,
    paddingRight: 6,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: 'pointer',
  },
  avatarCircleOnly: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarIconLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  topOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileDropdownMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 30,
    padding: 14,
    zIndex: 9999,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 10,
  },
  dropdownAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownAvatarLetter: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
  dropdownMeta: {
    flex: 1,
  },
  dropdownName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dropdownRoleBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 2,
  },
  dropdownRoleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },
  dropdownDept: {
    fontSize: 11,
    color: '#64748B',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    cursor: 'pointer',
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownLogoutItem: {
    backgroundColor: '#FEF2F2',
  },
  dropdownLogoutText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  toast: {
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  toastText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollArea: {
    flex: 1,
    zIndex: 1,
  },
  scrollContainer: {
    padding: 24,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  sectionWrap: {
    gap: 18,
  },
  noticeCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  noticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeIcon: {
    fontSize: 16,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  noticeText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  qaIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 18,
  },
  quickActionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 2,
  },
  quickActionSub: {
    fontSize: 12,
    color: '#64748B',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  tableLink: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  emptyCard: {
    padding: 36,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyActionBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  exportBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  exportBtnTopText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  deptFilterRowShadcn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    zIndex: 50,
    flexWrap: 'wrap',
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterTabText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  deptFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  deptFilterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  deptFilterPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  deptFilterPillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  deptFilterPillText: {
    fontSize: 12,
    color: '#475569',
  },
  deptFilterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ticketsList: {
    gap: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
  },
  actionHeaderBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  departmentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  deptCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
  },
  deptCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  deptCodeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  deptCodeText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '700',
  },
  deptCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  deptCardDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  usersTableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 8,
  },
  userRow: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  userMainCol: {},
  userNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  tableUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  tableUserEmail: {
    fontSize: 12,
    color: '#64748B',
  },
  tableUserDept: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  rolePickerCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rolePickerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  roleSelectBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  roleSelectBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  roleSelectBtnText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  roleSelectBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deptCardActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardEditBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  cardDeleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  cardDeleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  userActionsRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userEditBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  userEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userDeleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  userDeleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  inactivePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactivePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#991B1B',
  },
});
