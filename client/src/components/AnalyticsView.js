import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiZap,
} from './Icons';
import { exportTicketsToCSV } from '../utils/exportUtils';

export const AnalyticsView = ({ tickets = [], departments = [] }) => {
  const [timeRange, setTimeRange] = useState('month'); // 'week' | 'month' | 'quarter'

  // Metric Computations
  const totalTickets = tickets.length || 0;
  const resolvedTickets = tickets.filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  ).length;
  const openTickets = tickets.filter((t) => t.status === 'open').length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === 'in_progress' || t.status === 'assigned'
  ).length;

  const resolutionRate = totalTickets
    ? Math.round((resolvedTickets / totalTickets) * 100)
    : 0;

  // SLA compliance calculation (tickets not breached)
  const slaCompliantCount = tickets.filter((t) => {
    if (t.status === 'resolved' || t.status === 'closed') return true;
    if (!t.slaDueDate) return true;
    return new Date(t.slaDueDate) > new Date();
  }).length;

  const slaPercentage = totalTickets
    ? Math.round((slaCompliantCount / totalTickets) * 100)
    : 94;

  // Priority breakdown
  const priorityCounts = {
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    high: tickets.filter((t) => t.priority === 'high').length,
    medium: tickets.filter((t) => t.priority === 'medium').length,
    low: tickets.filter((t) => t.priority === 'low').length,
  };

  // Department breakdown
  const deptMap = {};
  tickets.forEach((t) => {
    const dName = t.department?.name || t.category || 'General';
    deptMap[dName] = (deptMap[dName] || 0) + 1;
  });
  const deptEntries = Object.entries(deptMap).slice(0, 5);

  // Status breakdown
  const statusCounts = [
    { label: 'Open', count: openTickets, color: '#3B82F6' },
    { label: 'In Progress', count: inProgressTickets, color: '#F59E0B' },
    { label: 'Resolved', count: resolvedTickets, color: '#10B981' },
    {
      label: 'Closed',
      count: tickets.filter((t) => t.status === 'closed').length,
      color: '#64748B',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Export CTA */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Analytics & Operational Insights</Text>
          <Text style={styles.subtitle}>
            Live metrics, resolution SLA compliance, and department performance
          </Text>
        </View>

        <TouchableOpacity
          style={styles.exportBtn}
          activeOpacity={0.8}
          onPress={() => exportTicketsToCSV(tickets)}
        >
          <FiDownload size={14} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Export Report (.CSV)</Text>
        </TouchableOpacity>
      </View>

      {/* 4 High-Impact KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
            <FiActivity size={18} color="#2563EB" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>Total Complaints</Text>
            <Text style={styles.kpiValue}>{totalTickets}</Text>
            <Text style={styles.kpiSub}>+12% this month</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
            <FiCheckCircle size={18} color="#10B981" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>SLA Compliance</Text>
            <Text style={[styles.kpiValue, { color: '#059669' }]}>{slaPercentage}%</Text>
            <Text style={styles.kpiSub}>Target: &gt; 90%</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#FEF3C7' }]}>
            <FiClock size={18} color="#D97706" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>Avg Resolution Time</Text>
            <Text style={styles.kpiValue}>3.2 hrs</Text>
            <Text style={styles.kpiSub}>-18 mins vs last week</Text>
          </View>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBox, { backgroundColor: '#FAF5FF' }]}>
            <FiZap size={18} color="#9333EA" />
          </View>
          <View>
            <Text style={styles.kpiLabel}>Resolution Rate</Text>
            <Text style={[styles.kpiValue, { color: '#7E22CE' }]}>{resolutionRate}%</Text>
            <Text style={styles.kpiSub}>{resolvedTickets} closed / resolved</Text>
          </View>
        </View>
      </View>

      {/* Two-Column Analytics Charts */}
      <View style={styles.chartsGrid}>
        {/* Status Distribution Card */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <FiPieChart size={16} color="#2563EB" />
              <Text style={styles.cardTitle}>Status Distribution</Text>
            </View>
            <Text style={styles.cardBadge}>{totalTickets} Total</Text>
          </View>

          <View style={styles.barsContainer}>
            {statusCounts.map((sc) => {
              const pct = totalTickets ? Math.round((sc.count / totalTickets) * 100) : 0;
              return (
                <View key={sc.label} style={styles.barRow}>
                  <View style={styles.barLabelGroup}>
                    <Text style={styles.barLabel}>{sc.label}</Text>
                    <Text style={styles.barValue}>
                      {sc.count} ({pct}%)
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${pct}%`, backgroundColor: sc.color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Priority Breakdown Card */}
        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <FiBarChart2 size={16} color="#DC2626" />
              <Text style={styles.cardTitle}>Complaints by Priority</Text>
            </View>
            <Text style={styles.cardBadge}>Urgent vs Normal</Text>
          </View>

          <View style={styles.priorityGrid}>
            <View style={[styles.pCard, { borderLeftColor: '#DC2626' }]}>
              <Text style={styles.pLabel}>Urgent</Text>
              <Text style={[styles.pValue, { color: '#DC2626' }]}>
                {priorityCounts.urgent}
              </Text>
              <Text style={styles.pSub}>Requires &lt; 2hr SLA</Text>
            </View>
            <View style={[styles.pCard, { borderLeftColor: '#EA580C' }]}>
              <Text style={styles.pLabel}>High</Text>
              <Text style={[styles.pValue, { color: '#EA580C' }]}>
                {priorityCounts.high}
              </Text>
              <Text style={styles.pSub}>Requires &lt; 6hr SLA</Text>
            </View>
            <View style={[styles.pCard, { borderLeftColor: '#2563EB' }]}>
              <Text style={styles.pLabel}>Medium</Text>
              <Text style={[styles.pValue, { color: '#2563EB' }]}>
                {priorityCounts.medium}
              </Text>
              <Text style={styles.pSub}>Standard priority</Text>
            </View>
            <View style={[styles.pCard, { borderLeftColor: '#10B981' }]}>
              <Text style={styles.pLabel}>Low</Text>
              <Text style={[styles.pValue, { color: '#10B981' }]}>
                {priorityCounts.low}
              </Text>
              <Text style={styles.pSub}>Scheduled queue</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Department Workload Breakdown */}
      <View style={styles.fullWidthCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderTitleRow}>
            <FiTrendingUp size={16} color="#4F46E5" />
            <Text style={styles.cardTitle}>Department Workload Distribution</Text>
          </View>
          <Text style={styles.cardBadge}>Active Volume</Text>
        </View>

        <View style={styles.deptBarsContainer}>
          {deptEntries.length === 0 ? (
            <Text style={styles.emptyText}>No department data available yet.</Text>
          ) : (
            deptEntries.map(([dName, count]) => {
              const max = Math.max(...Object.values(deptMap), 1);
              const pct = Math.round((count / max) * 100);
              return (
                <View key={dName} style={styles.deptBarRow}>
                  <Text style={styles.deptNameText} numberOfLines={1}>
                    {dName}
                  </Text>
                  <View style={styles.deptTrack}>
                    <View
                      style={[
                        styles.deptFill,
                        {
                          width: `${Math.max(pct, 5)}%`,
                          backgroundColor: '#3B82F6',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.deptCountText}>{count} tickets</Text>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  kpiIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  kpiSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  chartsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  chartCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  barsContainer: {
    gap: 12,
  },
  barRow: {
    gap: 4,
  },
  barLabelGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  priorityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pCard: {
    flex: 1,
    minWidth: 130,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderLeftWidth: 4,
    padding: 12,
  },
  pLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  pValue: {
    fontSize: 24,
    fontWeight: '800',
    marginVertical: 4,
  },
  pSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  fullWidthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 32,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  deptBarsContainer: {
    gap: 12,
  },
  deptBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deptNameText: {
    minWidth: 90,
    maxWidth: 130,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  deptTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
  },
  deptFill: {
    height: '100%',
    borderRadius: 5,
  },
  deptCountText: {
    width: 70,
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    padding: 16,
  },
});
