import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import {
  FiBookOpen,
  FiSearch,
  FiThumbsUp,
  FiChevronDown,
  FiChevronUp,
  FiPlusCircle,
  FiCheckCircle,
  FiTag,
  FiHelpCircle,
} from './Icons';

const ARTICLES = [
  {
    id: 'kb-1',
    category: 'IT & Network',
    title: 'Connecting to Office 5GHz Secure Corporate WiFi',
    summary: 'Step-by-step credentials and certificate configuration for laptops & mobile devices.',
    steps: [
      'Open your device WiFi settings and select "DeskFlow-Corp-5G".',
      'Choose EAP method "PEAP" and phase 2 authentication "MSCHAPV2".',
      'Enter your employee domain email and portal password.',
      'Accept the corporate security certificate when prompted.',
    ],
    views: 342,
    initialLikes: 89,
    tags: ['WiFi', 'Network', 'Internet'],
  },
  {
    id: 'kb-2',
    category: 'Software & Access',
    title: 'VPN Connection Fails or Shows Error 809',
    summary: 'Fix common IP routing and firewall conflict issues when working remotely.',
    steps: [
      'Ensure you are not connected to a restricted public guest hotspot.',
      'Open terminal/command prompt as Administrator and run: `ipconfig /flushdns`.',
      'Restart the DeskFlow Secure Client daemon.',
      'If error persists, raise a ticket under "Network & Connectivity" for token re-issue.',
    ],
    views: 215,
    initialLikes: 64,
    tags: ['VPN', 'Remote Access', 'Software'],
  },
  {
    id: 'kb-3',
    category: 'IT & Network',
    title: 'Password Reset & Two-Factor Authentication (2FA)',
    summary: 'How to recover account access or link a new authenticator device.',
    steps: [
      'Go to the Login screen and click "Forgot Password".',
      'Enter your registered employee email to receive an instant OTP.',
      'If locked out by security admin, your Team Lead must approve unlocking.',
    ],
    views: 520,
    initialLikes: 142,
    tags: ['Security', 'Password', 'Account'],
  },
  {
    id: 'kb-4',
    category: 'Facilities & Maintenance',
    title: 'Air Conditioning (HVAC) & Temperature Adjustment Protocol',
    summary: 'Standard operating temperatures and reporting urgent heating/cooling anomalies.',
    steps: [
      'Central office HVAC is automatically regulated between 22°C - 24°C.',
      'For meeting rooms or bays experiencing condensation or noise, raise a ticket.',
      'Maintenance team responds within 45 minutes during operational hours.',
    ],
    views: 110,
    initialLikes: 35,
    tags: ['HVAC', 'AC', 'Facilities'],
  },
  {
    id: 'kb-5',
    category: 'Software & Access',
    title: 'Requesting Specialized Software Licenses (Figma, GitHub, IDEs)',
    summary: 'Approval hierarchy and departmental allocation process for development tools.',
    steps: [
      'Verify that the requested software is on the approved company vendor list.',
      'Submit a complaint/request under "General Administration" specifying the license name.',
      'Your Team Lead will review and approve licensing costs.',
    ],
    views: 180,
    initialLikes: 58,
    tags: ['Licenses', 'GitHub', 'Software'],
  },
];

export const KnowledgeBaseView = ({ onOpenCreateTicket }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState('kb-1');
  const [likedArticles, setLikedArticles] = useState({});

  const categories = ['All', 'IT & Network', 'Software & Access', 'Facilities & Maintenance'];

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCategory =
      selectedCategory === 'All' || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (id) => {
    setLikedArticles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner */}
      <View style={styles.heroCard}>
        <View style={styles.heroTextCol}>
          <View style={styles.badgeRow}>
            <FiHelpCircle size={15} color="#38BDF8" />
            <Text style={styles.badgeText}>Self-Service Hub</Text>
          </View>
          <Text style={styles.heroTitle}>Knowledge Base & Instant Troubleshooting</Text>
          <Text style={styles.heroDesc}>
            Find step-by-step solutions to common operational and technical issues before filing a complaint.
          </Text>
        </View>

        {onOpenCreateTicket && (
          <TouchableOpacity
            style={styles.raiseCtaBtn}
            activeOpacity={0.8}
            onPress={onOpenCreateTicket}
          >
            <FiPlusCircle size={15} color="#FFFFFF" />
            <Text style={styles.raiseCtaText}>Raise New Complaint</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <FiSearch size={16} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guides (e.g. WiFi, VPN, HVAC, Password reset)..."
          placeholderTextColor="#94A3B8"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        {searchTerm ? (
          <TouchableOpacity onPress={() => setSearchTerm('')}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catChip,
              selectedCategory === cat && styles.catChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.catChipText,
                selectedCategory === cat && styles.catChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Articles List */}
      <View style={styles.articlesList}>
        {filteredArticles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matching articles found</Text>
            <Text style={styles.emptySub}>
              Can't find a solution? You can file a direct ticket with our support technicians.
            </Text>
            {onOpenCreateTicket && (
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={onOpenCreateTicket}
              >
                <Text style={styles.emptyBtnText}>Raise a Complaint Ticket →</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredArticles.map((art) => {
            const isExpanded = expandedId === art.id;
            const isLiked = !!likedArticles[art.id];
            const likeCount = art.initialLikes + (isLiked ? 1 : 0);

            return (
              <View key={art.id} style={styles.articleCard}>
                <TouchableOpacity
                  style={styles.articleHeader}
                  activeOpacity={0.7}
                  onPress={() => setExpandedId(isExpanded ? null : art.id)}
                >
                  <View style={styles.articleHeaderLeft}>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>{art.category}</Text>
                    </View>
                    <Text style={styles.articleTitle}>{art.title}</Text>
                    <Text style={styles.articleSummary}>{art.summary}</Text>
                  </View>

                  <View style={styles.chevronBox}>
                    {isExpanded ? (
                      <FiChevronUp size={18} color="#64748B" />
                    ) : (
                      <FiChevronDown size={18} color="#64748B" />
                    )}
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.articleBody}>
                    <Text style={styles.stepsHeading}>Resolution Steps:</Text>
                    {art.steps.map((step, idx) => (
                      <View key={idx} style={styles.stepRow}>
                        <View style={styles.stepNumBox}>
                          <Text style={styles.stepNumText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}

                    {/* Tags and Helpful Counter */}
                    <View style={styles.footerRow}>
                      <View style={styles.tagsGroup}>
                        {art.tags.map((t) => (
                          <View key={t} style={styles.tagBadge}>
                            <FiTag size={10} color="#64748B" />
                            <Text style={styles.tagText}>{t}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.feedbackRow}>
                        <TouchableOpacity
                          style={[
                            styles.likeBtn,
                            isLiked && styles.likeBtnActive,
                          ]}
                          onPress={() => toggleLike(art.id)}
                        >
                          <FiThumbsUp
                            size={12}
                            color={isLiked ? '#2563EB' : '#64748B'}
                          />
                          <Text
                            style={[
                              styles.likeBtnText,
                              isLiked && styles.likeBtnTextActive,
                            ]}
                          >
                            Helpful ({likeCount})
                          </Text>
                        </TouchableOpacity>
                      </View>
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
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 24,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 180,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroDesc: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 6,
    lineHeight: 18,
  },
  raiseCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    cursor: 'pointer',
  },
  raiseCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  clearBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: 'pointer',
  },
  catChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  catChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  articlesList: {
    gap: 12,
    marginBottom: 32,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 18,
    cursor: 'pointer',
  },
  articleHeaderLeft: {
    flex: 1,
    paddingRight: 16,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    textTransform: 'uppercase',
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  articleSummary: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  chevronBox: {
    paddingTop: 4,
  },
  articleBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  stepsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginVertical: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNumBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    cursor: 'pointer',
  },
  likeBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  likeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  likeBtnTextActive: {
    color: '#2563EB',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 400,
  },
  emptyBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
