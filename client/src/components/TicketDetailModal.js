import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge, RoleBadge } from './Badges';
import { api } from '../api/api';
import { SelectDropdown } from './SelectDropdown';
import { FiPaperclip, FiImage } from './Icons';

export const TicketDetailModal = ({
  visible,
  ticket,
  onClose,
  onStatusUpdated,
  onAssignUpdated,
  onCommentAdded,
  onEdit,
  onDelete,
}) => {
  const { user, isAdmin, isTechnician, isEmployee } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible && (isAdmin || isTechnician)) {
      loadTechnicians();
    }
  }, [visible, isAdmin, isTechnician]);

  const loadTechnicians = async () => {
    try {
      const res = await api.getTechnicians();
      if (res.success) {
        setTechnicians(res.technicians || []);
      }
    } catch (err) {
      console.warn('Error fetching technicians:', err.message);
    }
  };

  if (!ticket) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setErrorMsg('');
    try {
      await onStatusUpdated(ticket._id, newStatus, resolutionNotes);
      setResolutionNotes('');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAssign = async (techId) => {
    setErrorMsg('');
    try {
      await onAssignUpdated(ticket._id, techId);
      setShowAssignDropdown(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to assign ticket');
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    setErrorMsg('');
    try {
      await onCommentAdded(ticket._id, commentText.trim(), isInternal);
      setCommentText('');
      setIsInternal(false);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.badgeRow}>
                <Text style={styles.ticketId}>{ticket.ticketId}</Text>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </View>
              <Text style={styles.category}>{ticket.category}{ticket.location ? ` • Location: ${ticket.location}` : ''}</Text>
            </View>

            <View style={styles.headerRightActions}>
              {onEdit && (
                <TouchableOpacity
                  style={styles.headerEditBtn}
                  onPress={() => onEdit(ticket)}
                >
                  <Text style={styles.headerEditBtnText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity
                  style={styles.headerDeleteBtn}
                  onPress={() => onDelete(ticket._id)}
                >
                  <Text style={styles.headerDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {/* Title & Description */}
            <Text style={styles.title}>{ticket.title}</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{ticket.description}</Text>
            </View>

            {/* Attached Screenshot / Evidence */}
            {ticket.attachment ? (
              <View style={styles.detailAttachmentBox}>
                <View style={styles.detailAttachmentHeader}>
                  <FiPaperclip size={14} color="#2563EB" />
                  <Text style={styles.detailAttachmentTitle}>
                    Attached Evidence {ticket.attachmentName ? `(${ticket.attachmentName})` : ''}
                  </Text>
                </View>
                {ticket.attachment.startsWith('data:image') || ticket.attachment.startsWith('http') ? (
                  <View style={styles.screenshotPreviewWrapper}>
                    <Image
                      source={{ uri: ticket.attachment }}
                      style={{
                        width: '100%',
                        height: 240,
                        borderRadius: 8,
                        backgroundColor: '#0F172A',
                      }}
                      resizeMode="contain"
                    />
                  </View>
                ) : (
                  <Text style={styles.detailAttachmentText}>{ticket.attachmentName || ticket.attachment}</Text>
                )}
              </View>
            ) : null}

            {/* Ticket Parties (Raiser & Assignee) */}
            <View style={styles.partiesRow}>
              <View style={styles.partyCard}>
                <Text style={styles.partyLabel}>RAISED BY</Text>
                <Text style={styles.partyName}>{ticket.createdBy?.name || 'Staff'}</Text>
                <Text style={styles.partySub}>{ticket.createdBy?.email}</Text>
                <Text style={styles.partyDept}>Dept: {ticket.createdBy?.department || 'Operations'}</Text>
              </View>

              <View style={styles.partyCard}>
                <Text style={styles.partyLabel}>ASSIGNED TECHNICIAN</Text>
                <Text style={[styles.partyName, !ticket.assignedTo && styles.unassignedText]}>
                  {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}
                </Text>
                <Text style={styles.partySub}>
                  {ticket.assignedTo ? ticket.assignedTo.email : 'No agent assigned yet'}
                </Text>
                {ticket.assignedTo && (
                  <Text style={styles.partyDept}>Dept: {ticket.assignedTo.department}</Text>
                )}
              </View>
            </View>

            {/* RBAC Action Workflow Section */}
            <View style={styles.actionSection}>
              <Text style={styles.sectionHeader}>Status & Assignment Workflow</Text>

              {/* Technician Self-Assign or Admin Assign */}
              <View style={styles.assignControlsRow}>
                {isAdmin && (
                  <View style={{ flex: 1, zIndex: 100 }}>
                    <SelectDropdown
                      placeholder="Assign to technician..."
                      value={ticket.assignedTo?._id || ''}
                      onSelect={(techId) => handleAssign(techId)}
                      options={technicians.map((t) => ({
                        value: t._id,
                        label: `${t.name} (${t.department || 'IT'} - ${t.role})`,
                      }))}
                      style={{ marginBottom: 0 }}
                    />
                  </View>
                )}

                {isTechnician && !ticket.assignedTo && (
                  <TouchableOpacity
                    style={styles.selfAssignBtn}
                    onPress={() => handleAssign(user.id)}
                  >
                    <Text style={styles.selfAssignText}>Self-Assign Ticket</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Status Update Buttons according to RBAC role */}
              <View style={styles.statusButtonsWrap}>
                {(isAdmin || isTechnician) && (
                  <>
                    {ticket.status !== 'in_progress' && (
                      <TouchableOpacity
                        style={[styles.workflowBtn, { backgroundColor: '#D97706' }]}
                        onPress={() => handleStatusChange('in_progress')}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.btnLabel}>Mark In Progress</Text>
                      </TouchableOpacity>
                    )}

                    {ticket.status !== 'resolved' && (
                      <TouchableOpacity
                        style={[styles.workflowBtn, { backgroundColor: '#059669' }]}
                        onPress={() => handleStatusChange('resolved')}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.btnLabel}>Mark Resolved</Text>
                      </TouchableOpacity>
                    )}

                    {ticket.status !== 'rejected' && (
                      <TouchableOpacity
                        style={[styles.workflowBtn, { backgroundColor: '#DC2626' }]}
                        onPress={() => handleStatusChange('rejected')}
                        disabled={updatingStatus}
                      >
                        <Text style={styles.btnLabel}>Reject Ticket</Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}

                {/* Employee actions: close once resolved */}
                {isEmployee && ticket.status === 'resolved' && (
                  <TouchableOpacity
                    style={[styles.workflowBtn, { backgroundColor: '#475569' }]}
                    onPress={() => handleStatusChange('closed')}
                    disabled={updatingStatus}
                  >
                    <Text style={styles.btnLabel}>Confirm & Close Ticket</Text>
                  </TouchableOpacity>
                )}

                {/* Reopen option */}
                {['resolved', 'closed'].includes(ticket.status) && (
                  <TouchableOpacity
                    style={[styles.workflowBtn, { backgroundColor: '#2563EB' }]}
                    onPress={() => handleStatusChange('open')}
                    disabled={updatingStatus}
                  >
                    <Text style={styles.btnLabel}>Reopen Issue</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Resolution notes input if marking resolved */}
              {(isAdmin || isTechnician) && ticket.status !== 'resolved' && (
                <View style={styles.resolutionInputBox}>
                  <Text style={styles.resolutionInputLabel}>Resolution Notes (optional):</Text>
                  <TextInput
                    style={styles.resolutionInput}
                    placeholder="Describe how the problem was resolved..."
                    placeholderTextColor="#94A3B8"
                    value={resolutionNotes}
                    onChangeText={setResolutionNotes}
                  />
                </View>
              )}

              {ticket.resolutionNotes ? (
                <View style={styles.resolvedNotesCard}>
                  <Text style={styles.resolvedNotesTitle}>Official Resolution Note:</Text>
                  <Text style={styles.resolvedNotesText}>{ticket.resolutionNotes}</Text>
                </View>
              ) : null}
            </View>

            {/* Comments & Discussion */}
            <View style={styles.commentsSection}>
              <Text style={styles.sectionHeader}>
                Comments & Communication ({ticket.comments?.length || 0})
              </Text>

              <View style={styles.commentsList}>
                {(!ticket.comments || ticket.comments.length === 0) ? (
                  <Text style={styles.emptyComments}>No comments yet. Start the conversation below.</Text>
                ) : (
                  ticket.comments.map((c, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.commentBubble,
                        c.isInternal && styles.internalCommentBubble,
                      ]}
                    >
                      <View style={styles.commentHeader}>
                        <View style={styles.commentUserRow}>
                          <Text style={styles.commentAuthor}>{c.user?.name || 'Staff'}</Text>
                          <RoleBadge role={c.user?.role} />
                          {c.isInternal && (
                            <View style={styles.internalBadge}>
                              <Text style={styles.internalBadgeText}>Staff Note</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.commentDate}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text style={styles.commentMessage}>{c.message}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Add Comment Input */}
              <View style={styles.addCommentBox}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Type a message or update..."
                  placeholderTextColor="#94A3B8"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />

                <View style={styles.commentControlRow}>
                  {(isAdmin || isTechnician) ? (
                    <TouchableOpacity
                      style={styles.internalCheckbox}
                      onPress={() => setIsInternal(!isInternal)}
                    >
                      <View style={[styles.checkboxBox, isInternal && styles.checkboxActive]}>
                        {isInternal && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={styles.internalLabel}>Internal note (hidden from employee)</Text>
                    </TouchableOpacity>
                  ) : <View />}

                  <TouchableOpacity
                    style={[styles.postCommentBtn, submittingComment && styles.btnDisabled]}
                    onPress={handleAddComment}
                    disabled={submittingComment}
                  >
                    {submittingComment ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.postCommentText}>Send Reply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Activity Audit Timeline Toggle */}
            <View style={styles.timelineSection}>
              <TouchableOpacity
                style={styles.timelineToggle}
                onPress={() => setShowTimeline(!showTimeline)}
              >
                <Text style={styles.timelineToggleText}>
                  Activity Audit Log ({ticket.activityLog?.length || 0} events){' '}
                  {showTimeline ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showTimeline && (
                <View style={styles.timelineContainer}>
                  {ticket.activityLog?.map((log, idx) => (
                    <View key={idx} style={styles.timelineItem}>
                      <View style={styles.timelineDot} />
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeaderRow}>
                          <Text style={styles.timelineAction}>{log.action}</Text>
                          <Text style={styles.timelineDate}>
                            {new Date(log.timestamp).toLocaleString()}
                          </Text>
                        </View>
                        <Text style={styles.timelineNote}>{log.note}</Text>
                        <Text style={styles.timelineBy}>
                          By: {log.performedBy?.name || 'System'} ({log.performedBy?.role || 'user'})
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
              <Text style={styles.doneBtnText}>Close Window</Text>
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
    maxWidth: 780,
    maxHeight: '92%',
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
  headerLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  ticketId: {
    fontSize: 15,
    fontWeight: '800',
    color: '#4F46E5',
  },
  category: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerEditBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  headerEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerDeleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  headerDeleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
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
  body: {
    marginVertical: 4,
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
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
  },
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  descriptionText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 22,
  },
  partiesRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 14,
    flexWrap: 'wrap',
  },
  partyCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  partyLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  partyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 3,
  },
  partySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
  },
  partyDept: {
    fontSize: 11,
    color: '#4F46E5',
    marginTop: 3,
  },
  unassignedText: {
    color: '#D97706',
  },
  actionSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  assignControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  dropdownToggle: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  dropdownToggleText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemName: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownItemSub: {
    color: '#64748B',
    fontSize: 11,
  },
  selfAssignBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selfAssignText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  statusButtonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  workflowBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  resolutionInputBox: {
    marginTop: 10,
  },
  resolutionInputLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  resolutionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#0F172A',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  resolvedNotesCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  resolvedNotesTitle: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 12,
  },
  resolvedNotesText: {
    color: '#065F46',
    fontSize: 13,
    marginTop: 2,
  },
  commentsSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentsList: {
    marginVertical: 8,
    gap: 10,
  },
  emptyComments: {
    color: '#94A3B8',
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  commentBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  internalCommentBubble: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthor: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  internalBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  internalBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  commentDate: {
    color: '#94A3B8',
    fontSize: 11,
  },
  commentMessage: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  addCommentBox: {
    marginTop: 10,
  },
  commentInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    color: '#0F172A',
    fontSize: 13,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  commentControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  internalCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxActive: {
    backgroundColor: '#7C3AED',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  internalLabel: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '500',
  },
  postCommentBtn: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postCommentText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineSection: {
    marginBottom: 10,
  },
  timelineToggle: {
    paddingVertical: 8,
  },
  timelineToggleText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '600',
  },
  timelineContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4F46E5',
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineAction: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineDate: {
    color: '#94A3B8',
    fontSize: 11,
  },
  timelineNote: {
    color: '#475569',
    fontSize: 12,
    marginTop: 2,
  },
  timelineBy: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
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
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  doneBtnText: {
    color: '#334155',
    fontWeight: '600',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  detailAttachmentBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 16,
  },
  detailAttachmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  detailAttachmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  screenshotPreviewWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAttachmentText: {
    fontSize: 12,
    color: '#64748B',
  },
});
