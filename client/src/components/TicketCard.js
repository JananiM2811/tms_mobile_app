import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './Badges';

export const TicketCard = ({ ticket, onPress, onEdit, onDelete }) => {
  const formattedDate = new Date(ticket.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(ticket)} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <View style={styles.idWrap}>
          <Text style={styles.ticketId}>{ticket.ticketId}</Text>
          <Text style={styles.category}>{ticket.category}</Text>
        </View>

        <View style={styles.badges}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {ticket.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {ticket.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>Raised by:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {ticket.createdBy?.name || 'Staff'} ({ticket.createdBy?.department || 'Dept'})
          </Text>
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.label}>Assignee:</Text>
          <Text style={[styles.value, !ticket.assignedTo && styles.unassigned]} numberOfLines={1}>
            {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
          </Text>
        </View>

        <View style={styles.dateCol}>
          <Text style={styles.dateText}>{formattedDate}</Text>
          {ticket.comments?.length > 0 && (
            <Text style={styles.commentsText}>{ticket.comments.length} comments</Text>
          )}
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.actionButtonsRow}>
            {onEdit && (
              <TouchableOpacity
                style={styles.cardEditBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onEdit(ticket);
                }}
              >
                <Text style={styles.cardEditBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.cardDeleteBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  onDelete(ticket._id);
                }}
              >
                <Text style={styles.cardDeleteBtnText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  idWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ticketId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  infoCol: {
    flex: 1,
    minWidth: 110,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  value: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  unassigned: {
    color: '#D97706',
  },
  dateCol: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  commentsText: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
  cardEditBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cardEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  cardDeleteBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  cardDeleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
