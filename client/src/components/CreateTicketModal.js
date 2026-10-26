import React, { useState, useMemo } from 'react';
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
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { FiZap, FiPaperclip, FiX, FiCheck, FiCpu, FiAlertTriangle, FiCamera, FiImage, FiTrash2 } from './Icons';

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

export const CreateTicketModal = ({ visible, onClose, onSubmit, departments = [] }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT & Software');
  const [priority, setPriority] = useState('medium');
  const [location, setLocation] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [aiApplied, setAiApplied] = useState(false);

  const activeCategories = departments.length > 0 
    ? departments.map(d => d.name)
    : CATEGORIES;

  // Real-time AI NLP heuristic categorization
  const aiSuggestion = useMemo(() => {
    const text = `${title} ${description}`.toLowerCase();
    if (!text.trim() || text.length < 5) return null;

    let suggestedCat = null;
    let suggestedPri = 'medium';

    if (text.includes('wifi') || text.includes('network') || text.includes('vpn') || text.includes('internet') || text.includes('router') || text.includes('ip')) {
      suggestedCat = 'Network & Connectivity';
      suggestedPri = text.includes('down') || text.includes('slow') ? 'high' : 'medium';
    } else if (text.includes('server') || text.includes('crash') || text.includes('database') || text.includes('bug') || text.includes('api') || text.includes('login') || text.includes('software')) {
      suggestedCat = 'IT & Software';
      suggestedPri = text.includes('crash') || text.includes('down') || text.includes('urgent') ? 'urgent' : 'high';
    } else if (text.includes('ac') || text.includes('leak') || text.includes('temperature') || text.includes('heating') || text.includes('power') || text.includes('socket') || text.includes('smoke') || text.includes('spark')) {
      suggestedCat = 'Electrical & HVAC';
      suggestedPri = text.includes('smoke') || text.includes('leak') || text.includes('spark') ? 'urgent' : 'medium';
    } else if (text.includes('desk') || text.includes('chair') || text.includes('door') || text.includes('lock') || text.includes('cleaning') || text.includes('water')) {
      suggestedCat = 'Facilities & Maintenance';
      suggestedPri = 'low';
    } else if (text.includes('salary') || text.includes('payroll') || text.includes('leave') || text.includes('policy') || text.includes('harassment')) {
      suggestedCat = 'HR & Workplace';
      suggestedPri = 'high';
    }

    if (!suggestedCat) return null;

    // Check if suggestion differs from current state
    const isDifferent = category !== suggestedCat || priority !== suggestedPri;
    return {
      category: suggestedCat,
      priority: suggestedPri,
      isDifferent,
    };
  }, [title, description, category, priority]);

  const handleApplyAi = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setPriority(aiSuggestion.priority);
      setAiApplied(true);
      setTimeout(() => setAiApplied(false), 3000);
    }
  };

  const formatSize = (bytes) => `${((bytes || 0) / (1024 * 1024)).toFixed(2)} MB`;

  const pickNativeImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to attach a photo.');
      return;
    }

    const options = { mediaTypes: ['images'], quality: 0.6, base64: true };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'image/jpeg';
    setAttachment({
      name: asset.fileName || `photo_${Date.now()}.jpg`,
      size: formatSize(asset.fileSize),
      data: `data:${mimeType};base64,${asset.base64}`,
      isImage: true,
    });
  };

  const pickNativeDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType || 'application/pdf';
    const base64 = await new File(asset.uri).base64();
    setAttachment({
      name: asset.name,
      size: formatSize(asset.size),
      data: `data:${mimeType};base64,${base64}`,
      isImage: mimeType.startsWith('image/'),
    });
  };

  const handlePickFile = () => {
    if (Platform.OS !== 'web') {
      const run = (fn) => () =>
        fn().catch((err) => Alert.alert('Attachment Failed', err.message));
      Alert.alert('Attach File', 'Choose an option', [
        { text: 'Take Photo', onPress: run(() => pickNativeImage(true)) },
        { text: 'Choose from Gallery', onPress: run(() => pickNativeImage(false)) },
        { text: 'Choose PDF', onPress: run(pickNativeDocument) },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }
    if (typeof document === 'undefined') return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new window.Image();
          img.onload = () => {
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setAttachment({
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              data: compressedDataUrl,
              isImage: true,
            });
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setAttachment({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            data: event.target.result,
            isImage: false,
          });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please provide a ticket title/summary');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a description of the issue');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        location: location.trim() || 'Main Office',
        attachment: attachment?.data || '',
        attachmentName: attachment?.name || '',
      });
      setTitle('');
      setDescription('');
      setLocation('');
      setCategory('IT & Software');
      setPriority('medium');
      setAttachment(null);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Raise New Complaint</Text>
              <Text style={styles.modalSubtitle}>Report an operational, IT, or facility problem</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Smart AI Categorization Banner */}
            {aiSuggestion && aiSuggestion.isDifferent && (
              <View style={styles.aiBanner}>
                <View style={styles.aiLeft}>
                  <FiCpu size={16} color="#7C3AED" />
                  <View style={styles.aiTextCol}>
                    <Text style={styles.aiTitle}>Smart AI Detection</Text>
                    <Text style={styles.aiDesc}>
                      Suggested Category: <Text style={styles.aiHighlight}>{aiSuggestion.category}</Text> • Priority: <Text style={styles.aiHighlight}>{aiSuggestion.priority.toUpperCase()}</Text>
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.aiApplyBtn}
                  activeOpacity={0.8}
                  onPress={handleApplyAi}
                >
                  <FiZap size={12} color="#FFFFFF" />
                  <Text style={styles.aiApplyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}

            {aiApplied && (
              <View style={styles.aiSuccessBanner}>
                <FiCheck size={14} color="#059669" />
                <Text style={styles.aiSuccessText}>AI Suggestion applied to Category & Priority!</Text>
              </View>
            )}

            {/* Title */}
            <Text style={styles.inputLabel}>Subject / Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. WiFi dropping connection in Marketing bay"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            {/* Description */}
            <Text style={styles.inputLabel}>Issue Description & Details *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Explain what happened, error messages, and reproduction steps..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />

            {/* Category selection */}
            <Text style={styles.inputLabel}>Complaint Category</Text>
            <View style={styles.chipsContainer}>
              {activeCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority selection */}
            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const isActive = priority === p.id;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.priorityOption,
                      isActive && { borderColor: p.color, backgroundColor: p.bg },
                    ]}
                    onPress={() => setPriority(p.id)}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        isActive && { color: p.color, fontWeight: '700' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Location */}
            <Text style={styles.inputLabel}>Location / Desk / Room</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Floor 2, Desk #14B or Conference Room 3"
              placeholderTextColor="#94A3B8"
              value={location}
              onChangeText={setLocation}
            />

            {/* File / Screenshot Attachment */}
            <Text style={styles.inputLabel}>Screenshot or Photo Evidence</Text>
            {attachment ? (
              <View style={styles.attachmentBox}>
                <View style={styles.attachmentLeft}>
                  {attachment.isImage && attachment.data ? (
                    <Image
                      source={{ uri: attachment.data }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: '#93C5FD',
                      }}
                    />
                  ) : (
                    <View style={styles.docIconBox}>
                      <FiPaperclip size={18} color="#2563EB" />
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.attachmentName} numberOfLines={1}>
                      {attachment.name}
                    </Text>
                    <Text style={styles.attachmentSize}>
                      {attachment.size} • Ready to upload
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity
                    onPress={handlePickFile}
                    style={styles.changeAttachmentBtn}
                  >
                    <Text style={styles.changeAttachmentText}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setAttachment(null)}
                    style={styles.removeAttachmentBtn}
                  >
                    <FiTrash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={handlePickFile}
                activeOpacity={0.8}
              >
                <View style={styles.cameraIconCircle}>
                  <FiCamera size={20} color="#2563EB" />
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.uploadBtnText}>Tap to Attach Screenshot or Take Photo</Text>
                  <Text style={styles.uploadBtnSub}>Opens Camera or Photo Gallery (PNG, JPG, PDF)</Text>
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitText}>Submit Complaint</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  body: {
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginBottom: 12,
  },
  aiBanner: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  aiTextCol: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
  },
  aiDesc: {
    fontSize: 12,
    color: '#4C1D95',
    marginTop: 1,
  },
  aiHighlight: {
    fontWeight: '700',
  },
  aiApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7C3AED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    cursor: 'pointer',
  },
  aiApplyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  aiSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    padding: 8,
    marginBottom: 16,
  },
  aiSuccessText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: 'pointer',
  },
  categoryChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    cursor: 'pointer',
  },
  priorityText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    cursor: 'pointer',
  },
  cameraIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  uploadBtnSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeAttachmentBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#DBEAFE',
  },
  changeAttachmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  removeAttachmentBtn: {
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#FEE2E2',
  },
  attachmentBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 6,
    padding: 10,
  },
  attachmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  attachmentSize: {
    fontSize: 11,
    color: '#60A5FA',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
