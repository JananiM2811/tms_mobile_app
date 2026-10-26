import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#059669', bg: '#ECFDF5' },
  medium: { label: 'Medium', color: '#2563EB', bg: '#EFF6FF' },
  high: { label: 'High', color: '#D97706', bg: '#FFFBEB' },
  urgent: { label: 'Urgent', color: '#DC2626', bg: '#FEF2F2' },
};

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

export const RoleBadge = ({ role }) => {
  let label = 'EMPLOYEE';
  let color = '#059669';
  let bg = '#ECFDF5';

  if (role === 'admin') {
    label = 'ADMIN';
    color = '#DC2626';
    bg = '#FEF2F2';
  } else if (role === 'team_lead') {
    label = 'TEAM LEAD';
    color = '#2563EB';
    bg = '#EFF6FF';
  } else if (role === 'technician') {
    label = 'TECHNICIAN';
    color = '#D97706';
    bg = '#FFFBEB';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: color, borderWidth: 1 }]}>
      <Text style={[styles.text, { color: color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
