import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

const CATEGORIES = [
  'IT & Software',
  'Hardware & Equipment',
  'Network & Connectivity',
  'Facilities & Maintenance',
  'Electrical & HVAC',
  'HR & Workplace',
  'General Administration',
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#059669', bg: '#ECFDF5' },
  { id: 'medium', label: 'Medium', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'high', label: 'High', color: '#D97706', bg: '#FFFBEB' },
  { id: 'urgent', label: 'Urgent', color: '#DC2626', bg: '#FEF2F2' },
];

const STATUSES = [
  { id: 'open', label: 'Open', color: '#D97706', bg: '#FFFBEB' },
  { id: 'assigned', label: 'Assigned', color: '#2563EB', bg: '#EFF6FF' },
  { id: 'in_progress', label: 'In Progress', color: '#475569', bg: '#F1F5F9' },
  { id: 'resolved', label: 'Resolved', color: '#059669', bg: '#ECFDF5' },
  { id: 'closed', label: 'Closed', color: '#1E293B', bg: '#F8FAFC' },
];

export const EditTicketModal = ({
  visible,
  ticket,
  departments = [],
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT & Software');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('open');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');

  const activeCategories = departments.length > 0
    ? departments.map((d) => d.name)
    : CATEGORIES;

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setCategory(ticket.category || 'IT & Software');
      setPriority(ticket.priority || 'medium');
      setLocation(ticket.location || '');
      setStatus(ticket.status || 'open');
      setError('');
      setShowDeleteConfirm(false);
    }
  }, [ticket]);

  if (!ticket) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please provide a ticket title');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onUpdated(ticket._id, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: location.trim(),
        status,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setDeleting(true);
    try {
      await onDeleted(ticket._id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete complaint');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.ticketIdRow}>
                <Text style={styles.ticketIdBadge}>{ticket.ticketId}</Text>
                <Text style={styles.titleText}>Edit Complaint</Text>
              </View>
              <Text style={styles.subtitle}>
                Update issue details, priority tier, category, or delete ticket
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Complaint Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Brief summary of the issue"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Detailed Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what happened, error codes, steps to reproduce..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Status Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Status State</Text>
              <View style={styles.statusRow}>
                {STATUSES.map((s) => {
                  const isSelected = status === s.id;
                  return (
                    <TouchableOpacity
                      key={s.id}
                      style={[
                        styles.statusBtn,
                        isSelected && { borderColor: s.color, backgroundColor: s.bg },
                      ]}
                      onPress={() => setStatus(s.id)}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          isSelected && { color: s.color, fontWeight: '700' },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Priority Selector */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Priority Level</Text>
              <View style={styles.priorityRow}>
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.priorityBtn,
                        isSelected && { borderColor: p.color, backgroundColor: p.bg },
                      ]}
                      onPress={() => setPriority(p.id)}
                    >
                      <Text
                        style={[
                          styles.priorityText,
                          isSelected && { color: p.color, fontWeight: '700' },
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Category / Department */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryContainer}>
                {activeCategories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryBtn,
                        isSelected && styles.categoryBtnSelected,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          isSelected && styles.categoryTextSelected,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Physical Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2nd Floor, Room 204, Desk B-12"
                placeholderTextColor="#94A3B8"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Delete Confirmation Box */}
            {showDeleteConfirm && (
              <View style={styles.deleteConfirmBox}>
                <Text style={styles.deleteConfirmTitle}>Confirm Deletion</Text>
                <Text style={styles.deleteConfirmText}>
                  Are you sure you want to permanently delete complaint {ticket.ticketId}? This action cannot be undone.
                </Text>
                <View style={styles.confirmActionRow}>
                  <TouchableOpacity
                    style={styles.confirmDeleteBtn}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmDeleteText}>Yes, Delete Complaint</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelDeleteBtn}
                    onPress={() => setShowDeleteConfirm(false)}
                  >
                    <Text style={styles.cancelDeleteText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            {!showDeleteConfirm && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setShowDeleteConfirm(true)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            )}

            <View style={styles.footerRight}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.btnDisabled]}
                onPress={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.submitText}>Save Changes</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 16,
  },
  ticketIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ticketIdBadge: {
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  closeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  errorText: {
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  formScroll: {
    maxHeight: 480,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statusBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryBtnSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  categoryText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  deleteConfirmBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 14,
    marginTop: 8,
    marginBottom: 12,
  },
  deleteConfirmTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  deleteConfirmText: {
    color: '#7F1D1D',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  confirmActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmDeleteBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cancelDeleteBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelDeleteText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    marginTop: 8,
  },
  footerRight: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 'auto',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  cancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
