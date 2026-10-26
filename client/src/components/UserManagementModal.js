import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RoleBadge } from './Badges';
import { api } from '../api/api';

const AVAILABLE_ROLES = ['employee', 'technician', 'admin'];

export const UserManagementModal = ({ visible, onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getAllUsers();
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load organization users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await api.updateUser(userId, { role: newRole });
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      setError(err.message || 'Error updating user role');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Organization User Directory & RBAC</Text>
              <Text style={styles.subtitle}>
                Assign and modify role permissions across the organization
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : (
            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {users.map((u) => (
                <View key={u._id} style={styles.userCard}>
                  <View style={styles.userInfoCol}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{u.name}</Text>
                      <RoleBadge role={u.role} />
                    </View>
                    <Text style={styles.userEmail}>{u.email}</Text>
                    <Text style={styles.userMeta}>
                      {u.department || 'General'}{u.phone ? ` • ${u.phone}` : ''}
                    </Text>
                  </View>

                  <View style={styles.roleOptionsRow}>
                    <Text style={styles.changeRoleLabel}>Change Role:</Text>
                    <View style={styles.rolesRow}>
                      {AVAILABLE_ROLES.map((r) => {
                        const isCurrent = u.role === r;
                        return (
                          <TouchableOpacity
                            key={r}
                            style={[
                              styles.roleBtn,
                              isCurrent && styles.roleBtnCurrent,
                            ]}
                            disabled={isCurrent || updatingId === u._id}
                            onPress={() => handleRoleChange(u._id, r)}
                          >
                            <Text
                              style={[
                                styles.roleBtnText,
                                isCurrent && styles.roleBtnTextCurrent,
                              ]}
                            >
                              {r.toUpperCase()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Done</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 720,
    maxHeight: '85%',
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  closeText: {
    color: '#475569',
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  loader: {
    padding: 40,
    alignItems: 'center',
  },
  list: {
    marginVertical: 6,
  },
  userCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userInfoCol: {
    marginBottom: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    color: '#64748B',
    fontSize: 13,
  },
  userMeta: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
  },
  roleOptionsRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  changeRoleLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  rolesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  roleBtnCurrent: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  roleBtnText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  roleBtnTextCurrent: {
    color: '#FFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
    marginTop: 10,
  },
  doneBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
});
