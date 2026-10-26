import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SelectDropdown } from './SelectDropdown';
import { FiEye, FiEyeOff } from './Icons';
import { api } from '../api/api';
import { confirmAction } from '../utils/confirmAction';

export const EditUserModal = ({
  visible,
  user,
  departments = [],
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('active');

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword(''); // Blank unless user wants to change
      setShowPassword(false);
      setRole(user.role || 'employee');
      setDepartment(user.department || (departments[0]?.name || 'IT & Software'));
      setPhone(user.phone || '');
      setStatus(user.status || 'active');
      setError('');
    }
  }, [user, visible, departments]);

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter user name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter user email');
      return;
    }

    setSubmitting(true);
    try {
      const updatePayload = {
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        phone: phone.trim(),
        status,
      };

      if (password.trim()) {
        updatePayload.password = password.trim();
      }

      const res = await api.updateUser(user._id, updatePayload);

      if (res.success) {
        if (onUpdated) onUpdated(res.user);
        onClose();
      } else {
        setError(res.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err.message || 'Error updating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirmAction(
      `Are you sure you want to delete user "${user?.name}" (${user?.email})?`
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const res = await api.deleteUser(user._id);
      if (res.success) {
        if (onDeleted) onDeleted(user._id);
        onClose();
      } else {
        setError(res.message || 'Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'Error deleting user');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return null;

  const roleOptions = [
    { label: 'Employee (Raise & track own complaints)', value: 'employee' },
    { label: 'Technician / Assignee (Resolve assigned tickets)', value: 'technician' },
    { label: 'Team Lead (Department supervisor)', value: 'team_lead' },
    { label: 'Administrator (Full system management)', value: 'admin' },
  ];

  const deptOptions =
    departments.length > 0
      ? departments.map((d) => ({
          label: `${d.name} (${d.code || 'DEP'})`,
          value: d.name,
        }))
      : [
          { label: 'IT & Software', value: 'IT & Software' },
          { label: 'Facilities & Maintenance', value: 'Facilities & Maintenance' },
          { label: 'Human Resources', value: 'Human Resources' },
        ];

  const statusOptions = [
    { label: 'Active (Can log in & work)', value: 'active' },
    { label: 'Inactive (Account disabled)', value: 'inactive' },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Edit Team Member</Text>
              <Text style={styles.subtitle}>Modify role, department, credentials and status</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.scrollForm} showsVerticalScrollIndicator={false}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. user@company.com"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>NEW PASSWORD (LEAVE BLANK TO KEEP CURRENT)</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <FiEyeOff size={19} color="#64748B" />
                  ) : (
                    <FiEye size={19} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Department */}
            <SelectDropdown
              label="DEPARTMENT *"
              value={department}
              options={deptOptions}
              onSelect={setDepartment}
              style={{ zIndex: 40 }}
            />

            {/* Role */}
            <SelectDropdown
              label="ORGANIZATIONAL ROLE *"
              value={role}
              options={roleOptions}
              onSelect={setRole}
              style={{ zIndex: 30 }}
            />

            {/* Status */}
            <SelectDropdown
              label="ACCOUNT STATUS *"
              value={status}
              options={statusOptions}
              onSelect={setStatus}
              style={{ zIndex: 20 }}
            />

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>
          </ScrollView>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              disabled={deleting || submitting}
            >
              {deleting ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <Text style={styles.deleteBtnText}>Delete User</Text>
              )}
            </TouchableOpacity>

            <View style={styles.rightActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={submitting || deleting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={submitting || deleting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 580,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
  },
  closeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  scrollForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: '#0F172A',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 10,
  },
  deleteBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 6,
    backgroundColor: '#0F172A',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
