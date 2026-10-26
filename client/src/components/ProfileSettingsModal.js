import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  FiUser,
  FiBell,
  FiLock,
  FiEdit2,
  FiCamera,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiMail,
  FiBriefcase,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from './Icons';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './Badges';

const AVATAR_COLORS = [
  '#00C4DE', // Cyan (screenshot match)
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Crimson
  '#7C3AED', // Violet
  '#0F172A', // Slate
];

export const ProfileSettingsModal = ({
  visible,
  onClose,
  departments = [],
  onProfileUpdated,
}) => {
  const { user, updateUserProfile, changeUserPassword } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Active Tab: 'profile' | 'notifications' | 'security'
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Form State - Profile
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarBg, setAvatarBg] = useState('#00C4DE');

  // Form State - Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [ticketUpdates, setTicketUpdates] = useState(true);
  const [slaReminders, setSlaReminders] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Form State - Security (Password Change)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Feedback & Loading
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // Sync state when user or modal opens
  useEffect(() => {
    if (user && visible) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDepartment(user.department || 'General Administration');
      setAvatar(user.avatar || '');
      if (user.avatar && user.avatar.startsWith('#')) {
        setAvatarBg(user.avatar);
      }
      if (user.notificationPreferences) {
        setEmailAlerts(user.notificationPreferences.emailAlerts ?? true);
        setTicketUpdates(user.notificationPreferences.ticketUpdates ?? true);
        setSlaReminders(user.notificationPreferences.slaReminders ?? true);
      }
      setIsEditing(false);
      setSuccessMessage('');
      setErrorMessage('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [user, visible]);

  const showBannerSuccess = (msg) => {
    setSuccessMessage(msg);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 4500);
  };

  const showBannerError = (msg) => {
    setErrorMessage(msg);
    setSuccessMessage('');
  };

  // Handle Image Upload
  const handlePhotoSelect = (e) => {
    if (Platform.OS === 'web' && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        showBannerError('Photo must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setAvatar(uploadEvent.target.result);
        setIsEditing(true);
        showBannerSuccess('Photo uploaded! Click "Save Changes" to save.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Image Upload on Android / iOS
  const handleNativePhotoSelect = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showBannerError('Please allow photo access to change your picture');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });
      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        showBannerError('Photo must be less than 5MB');
        return;
      }
      setAvatar(`data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`);
      setIsEditing(true);
      showBannerSuccess('Photo uploaded! Tap "Save Changes" to save.');
    } catch (err) {
      showBannerError('Could not pick photo: ' + err.message);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async () => {
    if (!name.trim()) {
      showBannerError('Display name is required');
      return;
    }

    setSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        department: department.trim(),
        avatar: avatar || avatarBg,
        email: email.trim(),
      };

      const result = await updateUserProfile(payload);
      if (result.success) {
        setIsEditing(false);
        showBannerSuccess('Profile updated successfully!');
        if (onProfileUpdated) onProfileUpdated(result.user);
      } else {
        showBannerError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      showBannerError(err.message || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    setSaving(true);
    setErrorMessage('');
    try {
      const payload = {
        notificationPreferences: {
          emailAlerts,
          ticketUpdates,
          slaReminders,
        },
      };
      const result = await updateUserProfile(payload);
      if (result.success) {
        showBannerSuccess('Notification preferences saved!');
        if (onProfileUpdated) onProfileUpdated(result.user);
      } else {
        showBannerError(result.message || 'Failed to save notifications');
      }
    } catch (err) {
      showBannerError(err.message || 'Error updating notifications');
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    setErrorMessage('');
    if (!currentPassword) {
      showBannerError('Please enter your current password');
      return;
    }
    if (!newPassword) {
      showBannerError('Please enter your new password');
      return;
    }
    if (newPassword.length < 6) {
      showBannerError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showBannerError('New password and confirmation do not match');
      return;
    }

    setSaving(true);
    try {
      const result = await changeUserPassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        showBannerSuccess('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showBannerError(result.message || 'Failed to update password');
      }
    } catch (err) {
      showBannerError(err.message || 'Error changing password');
    } finally {
      setSaving(false);
    }
  };

  const getInitial = () => {
    return name ? name.trim().charAt(0).toUpperCase() : 'U';
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, isMobile && { padding: 6, justifyContent: 'center' }]}>
        <View style={[styles.modalContainer, isMobile && { width: '100%', height: '96%', maxHeight: '96%', borderRadius: 12 }]}>
          {/* TOP BAR / MODAL HEADER */}
          <View style={[styles.modalHeader, isMobile && { paddingHorizontal: 14, paddingVertical: 12 }]}>
            <View style={styles.headerTitleWrap}>
              <Text style={[styles.modalTitle, isMobile && { fontSize: 16 }]}>Account & Profile Settings</Text>
              <Text style={[styles.modalSubtitle, isMobile && { fontSize: 11 }]}>
                {isMobile ? 'Manage personal info & alerts' : 'Manage your credentials, personal info, and notification alerts'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <FiX size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* BANNER ALERTS */}
          {successMessage ? (
            <View style={styles.successBanner}>
              <FiCheckCircle size={16} color="#059669" />
              <Text style={styles.successBannerText}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner}>
              <FiAlertCircle size={16} color="#DC2626" />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* BODY LAYOUT: TABS + CONTENT */}
          <View style={[styles.modalBody, isMobile && { flexDirection: 'column' }]}>
            {/* NAVIGATION TABS */}
            <View style={[styles.leftNav, isMobile && styles.leftNavMobile]}>
              {/* User Summary Pill (Desktop Only) */}
              {!isMobile && (
                <View style={styles.userSummaryCard}>
                  <View
                    style={[
                      styles.summaryAvatar,
                      {
                        backgroundColor: avatar && avatar.startsWith('#')
                          ? avatar
                          : avatarBg,
                      },
                    ]}
                  >
                    <Text style={styles.summaryAvatarText}>{getInitial()}</Text>
                    <View style={styles.onlineStatusDot} />
                  </View>
                  <View style={styles.summaryMeta}>
                    <Text style={styles.summaryName} numberOfLines={1}>
                      {name || 'User'}
                    </Text>
                    <View style={{ marginTop: 3 }}>
                      <RoleBadge role={user?.role} />
                    </View>
                  </View>
                </View>
              )}

              {/* TABS */}
              <TouchableOpacity
                style={[
                  styles.navTabBtn,
                  isMobile && styles.navTabBtnMobile,
                  activeTab === 'profile' && (isMobile ? styles.navTabBtnActiveMobile : styles.navTabBtnActive),
                ]}
                onPress={() => {
                  setActiveTab('profile');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                <FiUser
                  size={isMobile ? 15 : 18}
                  color={activeTab === 'profile' ? (isMobile ? '#FFFFFF' : '#0891B2') : '#64748B'}
                />
                <Text
                  style={[
                    styles.navTabBtnText,
                    isMobile && styles.navTabBtnTextMobile,
                    activeTab === 'profile' && (isMobile ? styles.navTabBtnTextActiveMobile : styles.navTabBtnTextActive),
                  ]}
                >
                  {isMobile ? 'Profile' : 'Profile Settings'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navTabBtn,
                  isMobile && styles.navTabBtnMobile,
                  activeTab === 'notifications' && (isMobile ? styles.navTabBtnActiveMobile : styles.navTabBtnActive),
                ]}
                onPress={() => {
                  setActiveTab('notifications');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                <FiBell
                  size={isMobile ? 15 : 18}
                  color={activeTab === 'notifications' ? (isMobile ? '#FFFFFF' : '#0891B2') : '#64748B'}
                />
                <Text
                  style={[
                    styles.navTabBtnText,
                    isMobile && styles.navTabBtnTextMobile,
                    activeTab === 'notifications' && (isMobile ? styles.navTabBtnTextActiveMobile : styles.navTabBtnTextActive),
                  ]}
                >
                  {isMobile ? 'Alerts' : 'Notifications'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navTabBtn,
                  isMobile && styles.navTabBtnMobile,
                  activeTab === 'security' && (isMobile ? styles.navTabBtnActiveMobile : styles.navTabBtnActive),
                ]}
                onPress={() => {
                  setActiveTab('security');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
              >
                <FiLock
                  size={isMobile ? 15 : 18}
                  color={activeTab === 'security' ? (isMobile ? '#FFFFFF' : '#0891B2') : '#64748B'}
                />
                <Text
                  style={[
                    styles.navTabBtnText,
                    isMobile && styles.navTabBtnTextMobile,
                    activeTab === 'security' && (isMobile ? styles.navTabBtnTextActiveMobile : styles.navTabBtnTextActive),
                  ]}
                >
                  {isMobile ? 'Security' : 'Security'}
                </Text>
              </TouchableOpacity>

              {/* Verified Badge (Desktop Only) */}
              {!isMobile && (
                <View style={styles.accountVerifiedBox}>
                  <FiShield size={14} color="#059669" />
                  <Text style={styles.accountVerifiedText}>
                    Verified Enterprise Account
                  </Text>
                </View>
              )}
            </View>

            {/* RIGHT MAIN CONTENT AREA */}
            <ScrollView
              style={styles.rightContentScroll}
              contentContainerStyle={[styles.rightContent, isMobile && { padding: 12 }]}
            >
              {/* TAB 1: PROFILE SETTINGS */}
              {activeTab === 'profile' && (
                <View style={[styles.tabContentWrap, isMobile && { padding: 14, borderRadius: 10 }]}>
                  {/* Card Header with Edit Profile Button */}
                  <View style={[styles.cardHeaderRow, isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
                    <View>
                      <Text style={styles.cardSectionTitle}>Profile Information</Text>
                      <Text style={styles.cardSectionSubtitle}>
                        Update your public display name, contact phone, and avatar
                      </Text>
                    </View>

                    {!isEditing ? (
                      <TouchableOpacity
                        style={[styles.editProfileBtn, isMobile && { alignSelf: 'stretch', justifyContent: 'center' }]}
                        onPress={() => setIsEditing(true)}
                      >
                        <FiEdit2 size={14} color="#0891B2" />
                        <Text style={styles.editProfileBtnText}>Edit Profile</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[styles.editingActionsRow, isMobile && { width: '100%' }]}>
                        <TouchableOpacity
                          style={[styles.cancelEditBtn, isMobile && { flex: 1, alignItems: 'center' }]}
                          onPress={() => {
                            setIsEditing(false);
                            setName(user?.name || '');
                            setPhone(user?.phone || '');
                            setDepartment(user?.department || '');
                            setErrorMessage('');
                          }}
                        >
                          <Text style={styles.cancelEditBtnText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.saveChangesBtn, isMobile && { flex: 1, justifyContent: 'center' }]}
                          onPress={handleSaveProfile}
                          disabled={saving}
                        >
                          {saving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : (
                            <>
                              <FiCheck size={14} color="#FFFFFF" />
                              <Text style={styles.saveChangesBtnText}>
                                Save Changes
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Profile Photo Section */}
                  <View style={styles.photoSection}>
                    <Text style={styles.fieldSectionLabel}>Profile Photo</Text>
                    <View style={styles.photoRow}>
                      <View
                        style={[
                          styles.avatarLargeCircle,
                          {
                            backgroundColor: avatar && avatar.startsWith('#')
                              ? avatar
                              : avatarBg,
                          },
                        ]}
                      >
                        {avatar && avatar.startsWith('data:') ? (
                          <Image
                            source={{ uri: avatar }}
                            style={{
                              width: '100%',
                              height: '100%',
                              borderRadius: 40,
                            }}
                          />
                        ) : (
                          <Text style={styles.avatarLargeInitial}>
                            {getInitial()}
                          </Text>
                        )}
                      </View>

                      <View style={styles.photoActionsCol}>
                        <TouchableOpacity
                          style={styles.changePhotoBtn}
                          onPress={() => {
                            if (Platform.OS === 'web') {
                              if (fileInputRef.current) fileInputRef.current.click();
                            } else {
                              handleNativePhotoSelect();
                            }
                          }}
                        >
                          <FiCamera size={14} color="#334155" />
                          <Text style={styles.changePhotoBtnText}>
                            Change Photo
                          </Text>
                        </TouchableOpacity>

                        {/* Hidden Web File Input */}
                        {Platform.OS === 'web' && (
                          <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handlePhotoSelect}
                          />
                        )}

                        <Text style={styles.photoHelpText}>
                          JPG, PNG or GIF. Max size 5MB.
                        </Text>

                        {/* Quick Theme Color Presets */}
                        <View style={styles.avatarColorPresets}>
                          <Text style={styles.presetLabel}>Color Theme:</Text>
                          {AVATAR_COLORS.map((color) => (
                            <TouchableOpacity
                              key={color}
                              style={[
                                styles.colorSwatch,
                                { backgroundColor: color },
                                avatarBg === color && styles.colorSwatchActive,
                              ]}
                              onPress={() => {
                                setAvatarBg(color);
                                setAvatar(color);
                                setIsEditing(true);
                              }}
                            />
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  {/* FORM FIELDS */}
                  <View style={styles.formFieldsGroup}>
                    {/* Display Name */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Display Name *</Text>
                      <View
                        style={[
                          styles.inputContainer,
                          isEditing && styles.inputContainerActive,
                        ]}
                      >
                        <FiUser size={16} color="#64748B" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={name}
                          onChangeText={(val) => {
                            setName(val);
                            if (!isEditing) setIsEditing(true);
                          }}
                          placeholder="Enter your full display name"
                          placeholderTextColor="#94A3B8"
                          editable={isEditing}
                        />
                      </View>
                    </View>

                    {/* Email Address */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Email Address *</Text>
                      <View style={[styles.inputContainer, styles.inputDisabled]}>
                        <FiMail size={16} color="#94A3B8" style={styles.fieldIcon} />
                        <TextInput
                          style={[styles.textInput, styles.textInputDisabled]}
                          value={email}
                          placeholder="Your email address"
                          placeholderTextColor="#94A3B8"
                          editable={false}
                        />
                      </View>
                      <Text style={styles.fieldHelpText}>
                        Account email is bound to corporate authentication.
                      </Text>
                    </View>

                    {/* Phone & Department Row */}
                    <View style={[styles.twoColRow, isMobile && { flexDirection: 'column', gap: 12 }]}>
                      {/* Phone */}
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Phone</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            isEditing && styles.inputContainerActive,
                          ]}
                        >
                          <FiPhone size={16} color="#64748B" style={styles.fieldIcon} />
                          <TextInput
                            style={styles.textInput}
                            value={phone}
                            onChangeText={(val) => {
                              setPhone(val);
                              if (!isEditing) setIsEditing(true);
                            }}
                            placeholder="6379310246"
                            placeholderTextColor="#94A3B8"
                            keyboardType="phone-pad"
                            editable={isEditing}
                          />
                        </View>
                      </View>

                      {/* Department */}
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Department</Text>
                        <View
                          style={[
                            styles.inputContainer,
                            isEditing && styles.inputContainerActive,
                          ]}
                        >
                          <FiBriefcase
                            size={16}
                            color="#64748B"
                            style={styles.fieldIcon}
                          />
                          <TextInput
                            style={styles.textInput}
                            value={department}
                            onChangeText={(val) => {
                              setDepartment(val);
                              if (!isEditing) setIsEditing(true);
                            }}
                            placeholder="Service Tech Team"
                            placeholderTextColor="#94A3B8"
                            editable={isEditing}
                          />
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* System Scope Metadata Pill */}
                  <View style={[styles.metadataCard, isMobile && { flexDirection: 'column', gap: 10 }]}>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>Assigned Role</Text>
                      <Text style={styles.metaVal}>
                        {user?.role ? user.role.toUpperCase() : 'EMPLOYEE'}
                      </Text>
                    </View>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>Account Status</Text>
                      <View style={styles.statusPillActive}>
                        <View style={styles.greenDotSmall} />
                        <Text style={styles.statusPillText}>Active</Text>
                      </View>
                    </View>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaLabel}>Role Capabilities</Text>
                      <Text style={styles.metaValSmall}>
                        {user?.role === 'admin'
                          ? 'Full administrative control'
                          : user?.role === 'team_lead'
                          ? 'Team assign & management'
                          : user?.role === 'technician'
                          ? 'Resolve & update complaints'
                          : 'Submit & track personal complaints'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 2: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <View style={[styles.tabContentWrap, isMobile && { padding: 14, borderRadius: 10 }]}>
                  <View style={[styles.cardHeaderRow, isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
                    <View>
                      <Text style={styles.cardSectionTitle}>
                        Notification Preferences
                      </Text>
                      <Text style={styles.cardSectionSubtitle}>
                        Control which alerts you receive via email and in-app notifications
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.saveChangesBtn, isMobile && { alignSelf: 'stretch', justifyContent: 'center' }]}
                      onPress={handleSaveNotifications}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <FiCheck size={14} color="#FFFFFF" />
                          <Text style={styles.saveChangesBtnText}>
                            Save Preferences
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Toggle Items */}
                  <View style={styles.toggleCardsList}>
                    {/* Item 1 */}
                    <View style={styles.toggleItemCard}>
                      <View style={styles.toggleTextCol}>
                        <Text style={styles.toggleTitle}>Email Notifications</Text>
                        <Text style={styles.toggleDesc}>
                          Receive real-time email summaries whenever a complaint is assigned, updated, or resolved.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.switchTrack,
                          emailAlerts && styles.switchTrackActive,
                        ]}
                        onPress={() => setEmailAlerts(!emailAlerts)}
                      >
                        <View
                          style={[
                            styles.switchThumb,
                            emailAlerts && styles.switchThumbActive,
                          ]}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Item 2 */}
                    <View style={styles.toggleItemCard}>
                      <View style={styles.toggleTextCol}>
                        <Text style={styles.toggleTitle}>
                          Ticket & Complaint Status Updates
                        </Text>
                        <Text style={styles.toggleDesc}>
                          Get notified immediately when status transitions between Open, In Progress, and Resolved.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.switchTrack,
                          ticketUpdates && styles.switchTrackActive,
                        ]}
                        onPress={() => setTicketUpdates(!ticketUpdates)}
                      >
                        <View
                          style={[
                            styles.switchThumb,
                            ticketUpdates && styles.switchThumbActive,
                          ]}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Item 3 */}
                    <View style={styles.toggleItemCard}>
                      <View style={styles.toggleTextCol}>
                        <Text style={styles.toggleTitle}>
                          SLA & Escalation Reminders
                        </Text>
                        <Text style={styles.toggleDesc}>
                          Receive high-priority warnings when tickets near target resolution deadlines.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.switchTrack,
                          slaReminders && styles.switchTrackActive,
                        ]}
                        onPress={() => setSlaReminders(!slaReminders)}
                      >
                        <View
                          style={[
                            styles.switchThumb,
                            slaReminders && styles.switchThumbActive,
                          ]}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Item 4 */}
                    <View style={styles.toggleItemCard}>
                      <View style={styles.toggleTextCol}>
                        <Text style={styles.toggleTitle}>In-App Audio Alert Tone</Text>
                        <Text style={styles.toggleDesc}>
                          Play a subtle chime sound when new alerts arrive on the dashboard.
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.switchTrack,
                          soundEnabled && styles.switchTrackActive,
                        ]}
                        onPress={() => setSoundEnabled(!soundEnabled)}
                      >
                        <View
                          style={[
                            styles.switchThumb,
                            soundEnabled && styles.switchThumbActive,
                          ]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {/* TAB 3: SECURITY */}
              {activeTab === 'security' && (
                <View style={[styles.tabContentWrap, isMobile && { padding: 14, borderRadius: 10 }]}>
                  <View style={[styles.cardHeaderRow, isMobile && { flexDirection: 'column', alignItems: 'stretch', gap: 10 }]}>
                    <View>
                      <Text style={styles.cardSectionTitle}>Security & Credentials</Text>
                      <Text style={styles.cardSectionSubtitle}>
                        Update your password and verify your session credentials
                      </Text>
                    </View>
                  </View>

                  {/* Change Password Form */}
                  <View style={styles.passwordFormCard}>
                    <Text style={styles.cardInnerHeader}>Change Password</Text>

                    {/* Current Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Current Password *</Text>
                      <View style={styles.inputContainer}>
                        <FiLock size={16} color="#64748B" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={currentPassword}
                          onChangeText={setCurrentPassword}
                          placeholder="Enter your password"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showCurrentPass}
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowCurrentPass(!showCurrentPass)}
                          activeOpacity={0.7}
                        >
                          {showCurrentPass ? (
                            <FiEyeOff size={19} color="#64748B" />
                          ) : (
                            <FiEye size={19} color="#64748B" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>New Password *</Text>
                      <View style={styles.inputContainer}>
                        <FiLock size={16} color="#64748B" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Enter your password"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showNewPass}
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowNewPass(!showNewPass)}
                          activeOpacity={0.7}
                        >
                          {showNewPass ? (
                            <FiEyeOff size={19} color="#64748B" />
                          ) : (
                            <FiEye size={19} color="#64748B" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Confirm New Password *</Text>
                      <View style={styles.inputContainer}>
                        <FiLock size={16} color="#64748B" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.textInput}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Enter your password"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showConfirmPass}
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowConfirmPass(!showConfirmPass)}
                          activeOpacity={0.7}
                        >
                          {showConfirmPass ? (
                            <FiEyeOff size={19} color="#64748B" />
                          ) : (
                            <FiEye size={19} color="#64748B" />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Password Requirements Checklist */}
                    <View style={styles.checklistWrap}>
                      <View style={styles.checkItem}>
                        <FiCheck
                          size={13}
                          color={newPassword.length >= 6 ? '#059669' : '#94A3B8'}
                        />
                        <Text
                          style={[
                            styles.checkItemText,
                            newPassword.length >= 6 && styles.checkItemTextSuccess,
                          ]}
                        >
                          Minimum 6 characters
                        </Text>
                      </View>
                      <View style={styles.checkItem}>
                        <FiCheck
                          size={13}
                          color={
                            newPassword && newPassword === confirmPassword
                              ? '#059669'
                              : '#94A3B8'
                          }
                        />
                        <Text
                          style={[
                            styles.checkItemText,
                            newPassword &&
                              newPassword === confirmPassword &&
                              styles.checkItemTextSuccess,
                          ]}
                        >
                          Passwords match
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={[styles.updatePasswordBtn, isMobile && { alignSelf: 'stretch', justifyContent: 'center' }]}
                      onPress={handleChangePassword}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <FiLock size={14} color="#FFFFFF" />
                          <Text style={styles.updatePasswordBtnText}>
                            Update Password
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Active Sessions info */}
                  <View style={styles.sessionCard}>
                    <View style={styles.sessionHeaderRow}>
                      <FiShield size={18} color="#0891B2" />
                      <Text style={styles.sessionTitle}>Active Browser Session</Text>
                    </View>
                    <Text style={styles.sessionDesc}>
                      Logged in on Windows Web Portal • Encrypted with JSON Web Token (JWT)
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // Deep blurred backdrop
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 920,
    height: '90%',
    maxHeight: 700,
    display: 'flex',
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  headerTitleWrap: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FECACA',
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  errorBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#991B1B',
  },
  modalBody: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  leftNav: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    padding: 16,
    gap: 8,
  },
  userSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  summaryAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  summaryAvatarText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  summaryMeta: {
    flex: 1,
  },
  summaryName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  navTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  navTabBtnActive: {
    backgroundColor: '#E0F7FA', // Soft cyan matching screenshot 2
    borderLeftWidth: 3,
    borderLeftColor: '#00C4DE',
  },
  navTabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  navTabBtnTextActive: {
    color: '#0891B2',
    fontWeight: '700',
  },
  leftNavMobile: {
    width: '100%',
    flexDirection: 'row',
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    padding: 8,
    gap: 6,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  navTabBtnMobile: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    gap: 6,
    borderRadius: 8,
    borderLeftWidth: 0,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navTabBtnActiveMobile: {
    backgroundColor: '#0891B2',
    borderColor: '#0891B2',
  },
  navTabBtnTextMobile: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  navTabBtnTextActiveMobile: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  accountVerifiedBox: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  accountVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  rightContentScroll: {
    flex: 1,
  },
  rightContent: {
    padding: 24,
  },
  tabContentWrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardSectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0891B2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  editProfileBtnText: {
    color: '#0891B2',
    fontWeight: '700',
    fontSize: 12,
  },
  editingActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cancelEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  cancelEditBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  saveChangesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0891B2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveChangesBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  photoSection: {
    marginBottom: 20,
  },
  fieldSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  avatarLargeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  avatarLargeInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  photoActionsCol: {
    gap: 6,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  changePhotoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  photoHelpText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  avatarColorPresets: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  presetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  colorSwatch: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#0F172A',
    transform: [{ scale: 1.15 }],
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  formFieldsGroup: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
  },
  inputContainerActive: {
    borderColor: '#0891B2',
    backgroundColor: '#FAFDFF',
    borderWidth: 1.5,
  },
  inputDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  fieldIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    height: '100%',
    outlineStyle: 'none',
  },
  textInputDisabled: {
    color: '#64748B',
  },
  fieldHelpText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  metadataCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  metaCol: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaValSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  statusPillActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  greenDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  // Notifications tab styling
  toggleCardsList: {
    gap: 12,
  },
  toggleItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    gap: 16,
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#0891B2',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  // Security tab styling
  passwordFormCard: {
    gap: 14,
  },
  cardInnerHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  eyeBtn: {
    padding: 6,
    cursor: 'pointer',
  },
  checklistWrap: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 4,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  checkItemTextSuccess: {
    color: '#059669',
  },
  updatePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  updatePasswordBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  sessionCard: {
    marginTop: 24,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 16,
    gap: 6,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  sessionDesc: {
    fontSize: 11,
    color: '#64748B',
  },
});
