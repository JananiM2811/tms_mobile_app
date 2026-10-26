import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { SelectDropdown } from '../components/SelectDropdown';
import { FiEye, FiEyeOff } from '../components/Icons';
import { api } from '../api/api';
import { TMSLogoIcon } from '../components/TMSLogo';

export const LoginScreen = ({ onBackToLanding }) => {
  const { login, register } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('IT & Software');
  const [role, setRole] = useState('employee');
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic Departments from Database
  const [departmentList, setDepartmentList] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepts(true);
      const res = await api.getDepartments();
      if (res.success && res.departments && res.departments.length > 0) {
        setDepartmentList(res.departments);
        if (!department) {
          setDepartment(res.departments[0].name);
        }
      }
    } catch (e) {
      console.warn('Error fetching departments for register:', e.message);
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your email and password');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegisterMode) {
        if (!name.trim()) {
          setErrorMsg('Please enter your full name');
          setSubmitting(false);
          return;
        }
        const deptToUse = department || (departmentList[0]?.name) || 'IT & Software';
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          department: deptToUse,
          role,
        });
        if (!res.success) {
          setErrorMsg(res.message);
        }
      } else {
        const res = await login(email.trim(), password.trim());
        if (!res.success) {
          setErrorMsg(res.message || 'Invalid email or password');
        }
      }
    } catch (e) {
      setErrorMsg(e.message || 'Authentication error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.centerContainer, isMobile && { paddingVertical: 16, paddingHorizontal: 12 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.cardContainer, isMobile && { flexDirection: 'column' }]}>
        {/* Left Side: Professional Deep Slate Branding Panel */}
        <View style={[styles.infoSide, isMobile && { padding: 18, minWidth: '100%' }]}>
          {onBackToLanding && (
            <TouchableOpacity style={styles.backBtn} onPress={onBackToLanding}>
              <Text style={styles.backBtnText}>← Back</Text>
            </TouchableOpacity>
          )}

          <View style={styles.brandRow}>
            <TMSLogoIcon size={isMobile ? 36 : 42} />
            <View>
              <Text style={styles.brandTitle}>TMS</Text>
              <Text style={styles.brandSub}>Ticket Management System</Text>
            </View>
          </View>

          <Text style={[styles.infoHeadline, isMobile && { fontSize: 15, lineHeight: 20, marginBottom: 10 }]}>
            Workplace Complaint & Ticket Resolution System
          </Text>

          {!isMobile && (
            <View style={styles.infoList}>
              <View style={styles.infoItem}>
                <View style={[styles.bulletIconBox, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.bulletNumber}>01</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoItemTitle}>Multi-Department Administration</Text>
                  <Text style={styles.infoItemDesc}>
                    Admins manage IT, HR, Maintenance and create custom departments.
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.bulletIconBox, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.bulletNumber}>02</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoItemTitle}>Departmental Team Leads</Text>
                  <Text style={styles.infoItemDesc}>
                    Supervisors assign complaints directly to technicians within their team.
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={[styles.bulletIconBox, { backgroundColor: '#1E293B' }]}>
                  <Text style={styles.bulletNumber}>03</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoItemTitle}>Employee Self-Service</Text>
                  <Text style={styles.infoItemDesc}>
                    Raise complaints easily with priority tags and track live progress.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Right Side: Clean Form with Dynamic Dropdowns */}
        <View style={[styles.formSide, isMobile && { padding: 20, minWidth: '100%' }]}>
          <Text style={styles.formTitle}>
            {isRegisterMode ? 'Register Member' : 'Welcome Back'}
          </Text>
          <Text style={styles.formSub}>
            {isRegisterMode
              ? 'Join your organization department and team'
              : 'Sign in to access your scoped dashboard'}
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Register: Name field */}
          {isRegisterMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>FULL NAME *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Priya Sundaram"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>EMAIL ADDRESS *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. employee@company.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>PASSWORD *</Text>
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

          {/* Register Mode: Dynamic Dropdown for Department & Role */}
          {isRegisterMode && (
            <>
              {/* Dynamic Department Dropdown */}
              <SelectDropdown
                label="SELECT DEPARTMENT *"
                value={department}
                placeholder={loadingDepts ? 'Loading departments...' : 'Choose Department...'}
                options={
                  departmentList.length > 0
                    ? departmentList.map((d) => ({
                        label: `${d.name} (${d.code || 'DEP'})`,
                        value: d.name,
                      }))
                    : [
                        { label: 'IT & Software', value: 'IT & Software' },
                        { label: 'Facilities & Maintenance', value: 'Facilities & Maintenance' },
                        { label: 'HR & Workplace', value: 'HR & Workplace' },
                      ]
                }
                onSelect={setDepartment}
                style={{ zIndex: 30 }}
              />

              {/* Dynamic Role Dropdown */}
              <SelectDropdown
                label="SELECT ROLE *"
                value={role}
                options={[
                  { label: 'Employee (Raise & track own complaints)', value: 'employee' },
                  { label: 'Technician (Resolve assigned complaints)', value: 'technician' },
                  { label: 'Team Lead (Manage department complaints)', value: 'team_lead' },
                  { label: 'Administrator (Manage all depts & users)', value: 'admin' },
                ]}
                onSelect={setRole}
                style={{ zIndex: 20 }}
              />
            </>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isRegisterMode ? 'Create Account & Sign In →' : 'Sign In to Portal →'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle between Login and Register */}
          <View style={styles.toggleRow}>
            <Text style={styles.togglePrompt}>
              {isRegisterMode
                ? 'Already have an account?'
                : "Don't have an account?"}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setIsRegisterMode(!isRegisterMode);
                setErrorMsg('');
                if (!isRegisterMode) {
                  loadDepartments();
                }
              }}
            >
              <Text style={styles.toggleLink}>
                {isRegisterMode ? 'Sign In' : 'Register Here'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  cardContainer: {
    width: '100%',
    maxWidth: 960,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  infoSide: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#0F172A',
    padding: 36,
    justifyContent: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 24,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  brandIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  brandIcon: {
    fontSize: 15,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandSub: {
    fontSize: 12,
    color: '#94A3B8',
  },
  infoHeadline: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: 24,
    marginBottom: 28,
  },
  infoList: {
    gap: 20,
  },
  infoItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bulletIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  bulletNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  infoItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  infoItemDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  formSide: {
    flex: 1.1,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    padding: 36,
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  formSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    alignItems: 'center',
  },
  togglePrompt: {
    fontSize: 13,
    color: '#64748B',
  },
  toggleLink: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
});
