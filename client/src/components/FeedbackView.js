import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import {
  FiStar,
  FiAward,
  FiUser,
  FiCheckCircle,
  FiMessageSquare,
  FiSmile,
  FiSend,
} from './Icons';

export const FeedbackView = ({ tickets = [], user }) => {
  // Local store of submitted ratings for demonstration / persistence in session
  const [ratings, setRatings] = useState({
    'sample-1': { rating: 5, comment: 'Technician arrived within 15 minutes and resolved the router gateway issue perfectly!' },
    'sample-2': { rating: 5, comment: 'Replaced monitor cable immediately, great support.' },
    'sample-3': { rating: 4, comment: 'Resolved promptly, good communication.' },
  });

  const [activeTicketId, setActiveTicketId] = useState(null);
  const [inputRating, setInputRating] = useState(5);
  const [inputComment, setInputComment] = useState('');

  // Resolved tickets that can be rated
  const resolvedTickets = tickets.filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  );

  const handleSubmitRating = (ticketId) => {
    if (!inputRating) return;
    setRatings((prev) => ({
      ...prev,
      [ticketId]: {
        rating: inputRating,
        comment: inputComment.trim() || 'Issue resolved satisfactorily.',
        date: new Date().toLocaleDateString(),
      },
    }));
    setActiveTicketId(null);
    setInputComment('');
    setInputRating(5);
  };

  // Technician leaderboard mock/aggregation
  const techLeaderboard = [
    { name: 'Alex Rivera', dept: 'IT & Software', score: '4.9 ★', count: 28 },
    { name: 'Priya Sharma', dept: 'Network & Security', score: '4.8 ★', count: 34 },
    { name: 'David Chen', dept: 'Facilities & Electrical', score: '4.7 ★', count: 19 },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <View style={styles.badgeRow}>
            <FiSmile size={16} color="#F59E0B" />
            <Text style={styles.badgeText}>Quality & Customer Satisfaction</Text>
          </View>
          <Text style={styles.title}>CSAT & Service Feedback</Text>
          <Text style={styles.subtitle}>
            Rate completed ticket resolutions and review technician performance ratings
          </Text>
        </View>
      </View>

      {/* CSAT Top Summary Cards */}
      <View style={styles.summaryGrid}>
        {/* Overall CSAT Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Overall CSAT Score</Text>
          <View style={styles.bigScoreRow}>
            <Text style={styles.bigScore}>4.9</Text>
            <View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar key={s} size={16} color="#F59E0B" style={{ fill: '#F59E0B' }} />
                ))}
              </View>
              <Text style={styles.totalReviewsText}>Based on 81 ratings</Text>
            </View>
          </View>

          {/* Star Distribution Breakdown */}
          <View style={styles.starBarsList}>
            <View style={styles.starBarRow}>
              <Text style={styles.starLabel}>5 ★</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '82%', backgroundColor: '#10B981' }]} />
              </View>
              <Text style={styles.starPct}>82%</Text>
            </View>
            <View style={styles.starBarRow}>
              <Text style={styles.starLabel}>4 ★</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '14%', backgroundColor: '#3B82F6' }]} />
              </View>
              <Text style={styles.starPct}>14%</Text>
            </View>
            <View style={styles.starBarRow}>
              <Text style={styles.starLabel}>3 ★</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: '4%', backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.starPct}>4%</Text>
            </View>
          </View>
        </View>

        {/* Technician Leaderboard */}
        <View style={styles.techCard}>
          <View style={styles.techCardHeader}>
            <FiAward size={16} color="#2563EB" />
            <Text style={styles.techCardTitle}>Top Rated Technicians</Text>
          </View>

          <View style={styles.leaderboardList}>
            {techLeaderboard.map((tech, idx) => (
              <View key={tech.name} style={styles.techItem}>
                <View style={styles.techRankBadge}>
                  <Text style={styles.techRankText}>#{idx + 1}</Text>
                </View>
                <View style={styles.techInfo}>
                  <Text style={styles.techName}>{tech.name}</Text>
                  <Text style={styles.techDept}>{tech.dept}</Text>
                </View>
                <View style={styles.techScoreBox}>
                  <Text style={styles.techScore}>{tech.score}</Text>
                  <Text style={styles.techCount}>{tech.count} reviews</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Resolved Tickets Needing / Having Feedback */}
      <View style={styles.ticketsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resolved Complaints Feedback</Text>
          <Text style={styles.sectionSubtitle}>
            Leave a review or rate the service delivery for tickets
          </Text>
        </View>

        {resolvedTickets.length === 0 ? (
          <View style={styles.emptyCard}>
            <FiCheckCircle size={24} color="#10B981" />
            <Text style={styles.emptyText}>No resolved tickets to rate at this moment.</Text>
          </View>
        ) : (
          resolvedTickets.map((t) => {
            const ticketKey = t.ticketId || t._id;
            const existingRating = ratings[ticketKey];
            const isEditing = activeTicketId === ticketKey;

            return (
              <View key={ticketKey} style={styles.ticketRatingCard}>
                <View style={styles.ticketTopRow}>
                  <View style={styles.ticketInfoCol}>
                    <View style={styles.ticketBadgeRow}>
                      <Text style={styles.ticketIdBadge}>#{t.ticketId || 'TKT'}</Text>
                      <View style={styles.resolvedTag}>
                        <Text style={styles.resolvedTagText}>RESOLVED</Text>
                      </View>
                    </View>
                    <Text style={styles.ticketTitle}>{t.title}</Text>
                    <Text style={styles.ticketMeta}>
                      Assigned to: {t.assignedTo?.name || 'Department Technician'} •{' '}
                      Category: {t.category || 'IT'}
                    </Text>
                  </View>

                  {/* Rating display / Action button */}
                  {existingRating ? (
                    <View style={styles.ratedBox}>
                      <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FiStar
                            key={s}
                            size={14}
                            color="#F59E0B"
                            style={{
                              fill: s <= existingRating.rating ? '#F59E0B' : 'transparent',
                            }}
                          />
                        ))}
                      </View>
                      <Text style={styles.ratedText}>
                        {existingRating.rating} / 5 Stars
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.rateNowBtn}
                      onPress={() => {
                        setActiveTicketId(ticketKey);
                        setInputRating(5);
                        setInputComment('');
                      }}
                    >
                      <FiStar size={13} color="#2563EB" />
                      <Text style={styles.rateNowText}>Rate Resolution</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Existing Comment Review */}
                {existingRating?.comment && (
                  <View style={styles.existingCommentBox}>
                    <FiMessageSquare size={13} color="#64748B" />
                    <Text style={styles.existingCommentText}>
                      "{existingRating.comment}"
                    </Text>
                  </View>
                )}

                {/* Rating Input Modal/Form if editing */}
                {isEditing && (
                  <View style={styles.ratingForm}>
                    <Text style={styles.formLabel}>Select Star Rating:</Text>
                    <View style={styles.interactiveStarsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setInputRating(star)}
                          style={styles.starTouch}
                        >
                          <FiStar
                            size={22}
                            color="#F59E0B"
                            style={{
                              fill: star <= inputRating ? '#F59E0B' : 'transparent',
                            }}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TextInput
                      style={styles.feedbackInput}
                      placeholder="Write a brief comment about the technician's support..."
                      placeholderTextColor="#94A3B8"
                      value={inputComment}
                      onChangeText={setInputComment}
                    />

                    <View style={styles.formBtnRow}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => setActiveTicketId(null)}
                      >
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.submitBtn}
                        onPress={() => handleSubmitRating(ticketKey)}
                      >
                        <FiSend size={13} color="#FFFFFF" />
                        <Text style={styles.submitBtnText}>Submit Rating</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })
        )}
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
    marginBottom: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 24,
  },
  scoreCard: {
    flex: 1,
    minWidth: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  scoreTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  bigScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 12,
  },
  bigScore: {
    fontSize: 44,
    fontWeight: '800',
    color: '#0F172A',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  totalReviewsText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  starBarsList: {
    gap: 6,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  starBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starLabel: {
    width: 26,
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  starPct: {
    width: 32,
    fontSize: 11,
    color: '#64748B',
    textAlign: 'right',
  },
  techCard: {
    flex: 1,
    minWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  techCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  techCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  leaderboardList: {
    gap: 12,
  },
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
  },
  techRankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  techRankText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  techInfo: {
    flex: 1,
  },
  techName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  techDept: {
    fontSize: 11,
    color: '#64748B',
  },
  techScoreBox: {
    alignItems: 'flex-end',
  },
  techScore: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  techCount: {
    fontSize: 10,
    color: '#94A3B8',
  },
  ticketsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 32,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  sectionHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  ticketRatingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  ticketInfoCol: {
    flex: 1,
    minWidth: 180,
  },
  ticketBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketIdBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  resolvedTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  resolvedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#059669',
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 3,
  },
  ticketMeta: {
    fontSize: 12,
    color: '#64748B',
  },
  ratedBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  ratedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  rateNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    cursor: 'pointer',
  },
  rateNowText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  existingCommentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  existingCommentText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#475569',
  },
  ratingForm: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  interactiveStarsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  starTouch: {
    padding: 2,
    cursor: 'pointer',
  },
  feedbackInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none',
    marginBottom: 10,
  },
  formBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
