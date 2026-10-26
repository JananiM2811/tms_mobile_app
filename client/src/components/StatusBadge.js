import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const STATUS_CONFIG = {
  open: { label: 'Open', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
  assigned: { label: 'Assigned', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
  in_progress: { label: 'In Progress', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  resolved: { label: 'Resolved', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
  closed: { label: 'Closed', color: '#4B5563', bg: '#F3F4F6', border: '#D1D5DB' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || {
    label: status ? status.toUpperCase() : 'UNKNOWN',
    color: '#6B7280',
    bg: '#F9FAFB',
    border: '#E5E7EB',
  };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.border }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
});
