import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SelectDropdown } from './SelectDropdown';
import { FiEye, FiEyeOff } from './Icons';
import { api } from '../api/api';

export const CreateUserModal = ({
  visible,
  onClose,
  onCreated,
  departments = [],
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [deptList, setDeptList] = useState(departments);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      if (departments && departments.length > 0) {
        setDeptList(departments);
        if (!department) setDepartment(departments[0].name);
      } else {
        loadDepartments();
      }
    }
  }, [visible, departments]);

  const loadDepartments = async () => {
    try {
      const res = await api.getDepartments();
      if (res.success && res.departments) {
        setDeptList(res.departments);
        if (res.departments.length > 0 && !department) {
          setDepartment(res.departments[0].name);
        }
      }
    } catch (e) {
      console.warn('Error loading depts in CreateUserModal:', e.message);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in name, email, and password');
      return;
    }
    if (!department) {
      setError('Please select a department');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createUser({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        department,
      });

      if (res.success) {
        setName('');
        setEmail('');
        setPassword('');
        if (onCreated) onCreated(res.user);
        onClose();
      } else {
        setError(res.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err.message || 'Error creating user');
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = [
    { label: 'Employee (Raise & track own complaints)', value: 'employee' },
    { label: 'Technician / Assignee (Resolve assigned complaints)', value: 'technician' },
    { label: 'Team Lead (Department supervisor)', value: 'team_lead' },
    { label: 'Administrator (Full system access)', value: 'admin' },
  ];

  const deptOptions =
    deptList.length > 0
      ? deptList.map((d) => ({
          label: `${d.name} (${d.code || 'DEP'})`,
          value: d.name,
        }))
      : [
          { label: 'IT & Software', value: 'IT & Software' },
          { label: 'Facilities & Maintenance', value: 'Facilities & Maintenance' },
          { label: 'HR & Workplace', value: 'HR & Workplace' },
        ];

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Organization Member</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor="#94A3B8"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. rahul@company.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD *</Text>
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

          {/* Role Dropdown */}
          <SelectDropdown
            label="ASSIGN ROLE *"
            value={role}
            options={roleOptions}
            onSelect={setRole}
            style={{ zIndex: 30 }}
          />

          {/* Department Dropdown */}
          <SelectDropdown
            label="ASSIGN DEPARTMENT *"
            value={department}
            options={deptOptions}
            onSelect={setDepartment}
            placeholder="Select department..."
            style={{ zIndex: 20 }}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveText}>Save Member</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  closeText: {
    color: '#64748B',
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
