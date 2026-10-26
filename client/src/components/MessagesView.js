import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
  useWindowDimensions,
} from 'react-native';
import {
  FiMessageSquare,
  FiSend,
  FiUser,
  FiUsers,
  FiX,
  FiSearch,
  FiPaperclip,
  FiSmile,
  FiCheck,
  FiMoreVertical,
  FiPlus,
  FiCircle,
  FiRefreshCw,
  FiChevronLeft,
} from './Icons';
import { api } from '../api/api';

export const MessagesView = ({
  usersList = [],
  currentUser,
  onOpenCreateUser,
  selectedTarget = null,
  onTargetSelected = null,
}) => {
  const [groups, setGroups] = useState([
    {
      _id: 'grp-it',
      name: 'IT Support & Alerts',
      description: 'Server alerts, priority software tickets & hardware outages',
    },
    {
      _id: 'grp-facilities',
      name: 'Facilities Operations',
      description: 'AC regulation, electrical maintenance & office ergonomics',
    },
    {
      _id: 'grp-general',
      name: 'General Operations',
      description: 'Daily team discussions & organizational announcements',
    },
  ]);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState('');

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const [activeTarget, setActiveTarget] = useState({
    type: 'group',
    id: 'grp-it',
    name: 'IT Support & Alerts',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [dbUsers, setDbUsers] = useState(Array.isArray(usersList) ? usersList : []);
  const scrollViewRef = useRef(null);

  const currentUserId = currentUser?._id || currentUser?.id;

  // Auto-sync chat groups from MongoDB
  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.getGroups();
      if (res.success && Array.isArray(res.groups) && res.groups.length > 0) {
        setGroups(res.groups);
      }
    } catch (e) {
      console.warn('Could not fetch groups:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  // Auto-sync real registered users from MongoDB
  const fetchRealUsers = useCallback(async () => {
    try {
      const res = await api.getAllUsers();
      if (res.success && Array.isArray(res.users)) {
        setDbUsers(res.users);
      }
    } catch (e) {
      console.warn('Could not fetch real users:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchRealUsers();
  }, [fetchRealUsers]);

  useEffect(() => {
    if (Array.isArray(usersList) && usersList.length > 0) {
      setDbUsers(usersList);
    }
  }, [usersList]);

  const [conversations, setConversations] = useState([]);
  const hasAutoSwitchedRef = useRef(false);

  // Auto-sync DM conversations and unread counts
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.getConversations();
      if (res.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
      }
    } catch (e) {
      console.warn('Could not fetch conversations:', e.message);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Only real team members from database (excluding myself)
  const teamMembers = dbUsers.filter(
    (m) => m && (m._id || m.id) && String(m._id || m.id) !== String(currentUserId)
  );

  const activeGroup = activeTarget.type === 'group'
    ? groups.find((g) => (g._id || g.id) === activeTarget.id || g.name === activeTarget.name) || groups[0]
    : null;

  const activeDMUser = activeTarget.type === 'dm'
    ? (teamMembers.find((u) => String(u._id || u.id) === String(activeTarget.id)) || (activeTarget.name ? { _id: activeTarget.id, name: activeTarget.name, role: 'STAFF' } : null))
    : null;

  // Handle direct target navigation from external notification click
  useEffect(() => {
    if (selectedTarget && selectedTarget.id) {
      setActiveTarget({
        type: 'dm',
        id: selectedTarget.id,
        name: selectedTarget.name || 'Team Member',
      });
      if (isMobile) setMobileChatOpen(true);
      if (onTargetSelected) onTargetSelected();
    }
  }, [selectedTarget, onTargetSelected, isMobile]);

  // Auto-switch to direct message if an unread DM exists for current user
  useEffect(() => {
    if (!hasAutoSwitchedRef.current && conversations.length > 0 && teamMembers.length > 0) {
      const unreadConv = conversations.find((c) => c.unreadCount > 0);
      if (unreadConv) {
        const sender = teamMembers.find((u) => String(u._id || u.id) === String(unreadConv.userId));
        if (sender) {
          hasAutoSwitchedRef.current = true;
          setActiveTarget({
            type: 'dm',
            id: sender._id || sender.id,
            name: sender.name,
          });
        }
      }
    }
  }, [conversations, teamMembers]);

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      setGroupError('Please enter a group name');
      return;
    }
    setCreatingGroup(true);
    setGroupError('');
    try {
      const res = await api.createGroup({
        name: newGroupName.trim(),
        description: newGroupDesc.trim(),
      });
      if (res.success && res.group) {
        setGroups((prev) => [...prev, res.group]);
        setActiveTarget({
          type: 'group',
          id: res.group._id || res.group.id,
          name: res.group.name,
        });
        setNewGroupName('');
        setNewGroupDesc('');
        setCreateGroupModalVisible(false);
      }
    } catch (err) {
      setGroupError(err.message || 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  // Fetch messages from backend MongoDB
  const fetchMessages = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      if (activeTarget.type === 'group') {
        const groupIdentifier = activeGroup?.name || activeTarget.name;
        const res = await api.getChannelMessages(groupIdentifier);
        if (res.success) {
          const formatted = (res.messages || []).map((m) => {
            const senderId = m.sender?._id || m.sender?.id;
            const isMe = senderId === currentUserId;
            return {
              id: m._id,
              sender: isMe ? 'You' : (m.sender?.name || 'Staff'),
              role: m.sender?.role ? m.sender.role.toUpperCase() : 'USER',
              text: m.content,
              time: formatTime(m.createdAt),
              isMe,
              avatarColor: isMe ? '#2563EB' : '#0F172A',
            };
          });
          setMessages(formatted);
        }
      } else {
        const targetUserId = activeTarget.id;
        const res = await api.getDirectMessages(targetUserId);
        if (res.success) {
          const formatted = (res.messages || []).map((m) => {
            const senderId = (m.sender?._id || m.sender?.id || m.sender)?.toString();
            const isMe = senderId === String(currentUserId);
            return {
              id: m._id,
              sender: isMe ? 'You' : (m.sender?.name || activeDMUser?.name || 'Staff'),
              role: m.sender?.role ? m.sender.role.toUpperCase() : 'USER',
              text: m.content,
              time: formatTime(m.createdAt),
              isMe,
              avatarColor: isMe ? '#2563EB' : '#0F172A',
            };
          });
          setMessages(formatted);
        }
      }
    } catch (err) {
      console.warn('Error fetching messages from server:', err.message);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [activeTarget, activeGroup, activeDMUser, currentUserId]);

  // Load messages on target change
  useEffect(() => {
    fetchMessages(false);
  }, [fetchMessages]);

  // Live Auto-Refresh Polling every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMessages(true);
      fetchConversations();
    }, 3500);
    return () => clearInterval(timer);
  }, [fetchMessages, fetchConversations]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    // Optimistic UI preview
    const tempId = 'temp-' + Date.now();
    const optimisticMsg = {
      id: tempId,
      sender: 'You',
      role: currentUser?.role ? currentUser.role.toUpperCase() : 'USER',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      avatarColor: '#2563EB',
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const payload = activeTarget.type === 'group'
        ? { channel: activeGroup?.name || activeTarget.name, content: textToSend }
        : { recipientId: activeDMUser?._id || activeDMUser?.id || activeTarget.id, content: textToSend };

      const res = await api.sendMessage(payload);
      if (res.success && res.message) {
        // Replace temp message with server saved message
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? {
            ...m,
            id: res.message._id,
            time: formatTime(res.message.createdAt),
          } : m))
        );
      }
    } catch (err) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMembers = teamMembers.filter((m) =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, isMobile && { height: 620, minHeight: 500, flexDirection: 'column' }]}>
      {/* LEFT COLUMN: TEAM GROUPS & DIRECT MESSAGES */}
      <View style={[styles.sidebarCol, isMobile && { width: '100%', flex: 1, borderRightWidth: 0, display: mobileChatOpen ? 'none' : 'flex' }]}>
        {/* Search Bar */}
        <View style={styles.searchWrap}>
          <FiSearch size={14} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups or team..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          style={styles.conversationsScroll}
          contentContainerStyle={{ paddingBottom: 30 }}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {/* TEAM GROUPS SECTION */}
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeadingText}>TEAM GROUPS</Text>
            <TouchableOpacity
              style={styles.addMemberBtn}
              onPress={() => {
                setGroupError('');
                setCreateGroupModalVisible(true);
              }}
            >
              <FiPlus size={11} color="#2563EB" />
              <Text style={styles.addMemberBtnText}>New Group</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.channelsList}>
            {filteredGroups.map((g) => {
              const gId = g._id || g.id;
              const isActive = activeTarget.type === 'group' && (activeTarget.id === gId || activeTarget.name === g.name);
              return (
                <TouchableOpacity
                  key={gId || g.name}
                  style={[styles.convItem, isActive && styles.convItemActive]}
                  onPress={() => {
                    setActiveTarget({ type: 'group', id: gId, name: g.name });
                    if (isMobile) setMobileChatOpen(true);
                  }}
                >
                  <View style={styles.convItemLeft}>
                    <View style={[styles.groupIconBox, isActive && styles.groupIconBoxActive]}>
                      <FiUsers size={13} color={isActive ? '#1D4ED8' : '#64748B'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.convItemName, isActive && styles.convItemNameActive]}
                        numberOfLines={1}
                      >
                        {g.name}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* DIRECT MESSAGES SECTION */}
          <View style={[styles.sectionHeadingRow, { marginTop: 20 }]}>
            <Text style={styles.sectionHeadingText}>DIRECT MESSAGES</Text>
            {onOpenCreateUser && (
              <TouchableOpacity
                style={styles.addMemberBtn}
                onPress={onOpenCreateUser}
              >
                <FiPlus size={11} color="#2563EB" />
                <Text style={styles.addMemberBtnText}>Add User</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.membersList}>
            {filteredMembers.length === 0 ? (
              <View style={styles.noMembersBox}>
                <Text style={styles.noMembersTitle}>No other members found</Text>
                <Text style={styles.noMembersSub}>
                  Create a team member to start chatting directly!
                </Text>
                {onOpenCreateUser && (
                  <TouchableOpacity
                    style={styles.createMemberActionBtn}
                    onPress={onOpenCreateUser}
                  >
                    <FiPlus size={12} color="#FFFFFF" />
                    <Text style={styles.createMemberActionBtnText}>Create Member</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              filteredMembers.map((m) => {
                const mId = (m._id || m.id)?.toString();
                const isActive = activeTarget.type === 'dm' && String(activeTarget.id) === String(mId);
                const conv = conversations.find((c) => String(c.userId) === String(mId));

                return (
                  <TouchableOpacity
                    key={mId}
                    style={[styles.convItem, isActive && styles.convItemActive]}
                    onPress={() => {
                      setActiveTarget({ type: 'dm', id: mId, name: m.name });
                      if (isMobile) setMobileChatOpen(true);
                      if (conv && conv.unreadCount > 0) {
                        setConversations((prev) =>
                          prev.map((c) => (String(c.userId) === String(mId) ? { ...c, unreadCount: 0 } : c))
                        );
                      }
                    }}
                  >
                    <View style={styles.convItemLeft}>
                      <View style={styles.avatarMiniWrap}>
                        <View style={styles.avatarMini}>
                          <Text style={styles.avatarMiniLetter}>
                            {m.name ? m.name[0].toUpperCase() : 'U'}
                          </Text>
                        </View>
                        <View style={styles.onlineDotMini} />
                      </View>

                      <View style={{ flex: 1 }}>
                        <View style={styles.memberNameRow}>
                          <Text
                            style={[
                              styles.convItemName,
                              isActive && styles.convItemNameActive,
                              conv?.unreadCount > 0 && styles.convItemNameUnread,
                            ]}
                            numberOfLines={1}
                          >
                            {m.name}
                          </Text>
                          {conv?.unreadCount > 0 && (
                            <View style={styles.unreadCountBadge}>
                              <Text style={styles.unreadCountText}>{conv.unreadCount}</Text>
                            </View>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.memberSubText,
                            conv?.unreadCount > 0 && styles.memberSubTextUnread,
                          ]}
                          numberOfLines={1}
                        >
                          {conv?.lastMessage
                            ? conv.lastMessage
                            : `${m.role ? m.role.toUpperCase() : 'STAFF'} • ${m.department || 'Operations'}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* RIGHT COLUMN: ACTIVE CHAT PANE */}
      <View style={[styles.chatPane, isMobile && { width: '100%', flex: 1, display: mobileChatOpen ? 'flex' : 'none' }]}>
        {/* Chat Pane Header */}
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderLeft}>
            {isMobile && (
              <TouchableOpacity
                style={styles.mobileBackBtn}
                onPress={() => setMobileChatOpen(false)}
              >
                <FiChevronLeft size={20} color="#0F172A" />
                <Text style={styles.mobileBackBtnText}>Chats</Text>
              </TouchableOpacity>
            )}
            {activeTarget.type === 'group' ? (
              <View style={styles.headerTitleGroup}>
                <View style={styles.channelTitleRow}>
                  <View style={styles.groupHeaderBadge}>
                    <FiUsers size={16} color="#2563EB" />
                  </View>
                  <View>
                    <Text style={styles.chatHeaderTitle}>{activeGroup?.name || activeTarget.name}</Text>
                    {activeGroup?.description ? (
                      <Text style={styles.chatHeaderTopic} numberOfLines={1}>
                        {activeGroup.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : activeDMUser ? (
              <View style={styles.headerTitleGroup}>
                <View style={styles.dmTitleRow}>
                  <View style={styles.dmAvatar}>
                    <Text style={styles.dmAvatarText}>
                      {activeDMUser?.name ? activeDMUser.name[0].toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.chatHeaderTitle}>{activeDMUser?.name}</Text>
                    <View style={styles.onlineStatusRow}>
                      <View style={styles.liveGreenDot} />
                      <Text style={styles.liveOnlineText}>
                        Active Now • {activeDMUser?.role ? activeDMUser.role.toUpperCase() : 'STAFF'} ({activeDMUser?.department || 'Operations'})
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.headerTitleGroup}>
                <Text style={styles.chatHeaderTitle}>Direct Messages</Text>
                <Text style={styles.chatHeaderTopic}>Select a team member to start chatting</Text>
              </View>
            )}
          </View>

          <View style={styles.chatHeaderActions}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => fetchMessages(false)}
              title="Refresh conversation"
            >
              <FiRefreshCw size={14} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Message Stream */}
        {activeTarget.type === 'dm' && !activeDMUser ? (
          <View style={styles.emptySelectionPane}>
            <FiUser size={38} color="#94A3B8" />
            <Text style={styles.emptyChatTitle}>No Team Member Selected</Text>
            <Text style={styles.emptyChatSub}>
              Select a team member from the list on the left to start chatting, or create a new user.
            </Text>
            {onOpenCreateUser && (
              <TouchableOpacity
                style={styles.createMemberActionBtn}
                onPress={onOpenCreateUser}
              >
                <FiPlus size={14} color="#FFFFFF" />
                <Text style={styles.createMemberActionBtnText}>Create New User</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            style={styles.messageStream}
            contentContainerStyle={{ paddingBottom: 24 }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {loading && messages.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.loadingText}>Syncing messages from server...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyChatBox}>
                <FiMessageSquare size={28} color="#94A3B8" />
                <Text style={styles.emptyChatTitle}>No messages in this conversation yet</Text>
                <Text style={styles.emptyChatSub}>
                  Be the first to send a message to {activeTarget.type === 'group' ? (activeGroup?.name || activeTarget.name) : (activeDMUser?.name || 'this member')}!
                </Text>
              </View>
          ) : (
            messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  msg.isMe && styles.messageRowMe,
                ]}
              >
                {!msg.isMe && (
                  <View style={[styles.msgAvatar, { backgroundColor: msg.avatarColor || '#0F172A' }]}>
                    <Text style={styles.msgAvatarText}>
                      {msg.sender ? msg.sender[0].toUpperCase() : 'U'}
                    </Text>
                  </View>
                )}

                <View
                  style={[
                    styles.bubbleWrap,
                    msg.isMe && styles.bubbleWrapMe,
                  ]}
                >
                  {!msg.isMe && (
                    <View style={styles.senderHeader}>
                      <Text style={styles.senderName}>{msg.sender}</Text>
                      <Text style={styles.senderRoleBadge}>{msg.role}</Text>
                      <Text style={styles.msgTime}>{msg.time}</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      msg.isMe ? styles.bubbleMe : styles.bubbleThem,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>

                  {msg.isMe && (
                    <View style={styles.meFooterRow}>
                      <Text style={styles.msgTimeMe}>{msg.time}</Text>
                      <FiCheck size={12} color="#2563EB" />
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
        )}

        {/* Chat Input Bar */}
        {!(activeTarget.type === 'dm' && !activeDMUser) && (
          <View style={styles.inputArea}>
            <View style={styles.inputContainer}>
              <TouchableOpacity style={styles.attachBtn}>
                <FiPaperclip size={16} color="#64748B" />
              </TouchableOpacity>

              <TextInput
                style={styles.chatTextInput}
                placeholder={
                  activeTarget.type === 'group'
                    ? `Message ${activeGroup?.name || activeTarget.name}...`
                    : `Message ${activeDMUser?.name || 'member'}...`
                }
                placeholderTextColor="#94A3B8"
                value={inputText}
                onChangeText={setInputText}
                onKeyPress={handleKeyPress}
                editable={!sending}
              />

              <TouchableOpacity
                style={[
                  styles.sendBtn,
                  (!inputText.trim() || sending) && styles.sendBtnDisabled,
                ]}
                disabled={!inputText.trim() || sending}
                onPress={handleSendMessage}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <FiSend size={14} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* CREATE GROUP MODAL */}
      <Modal
        visible={createGroupModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCreateGroupModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.groupModalCard}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.groupModalIconWrap}>
                  <FiUsers size={18} color="#2563EB" />
                </View>
                <Text style={styles.modalTitleText}>Create Team Group</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setCreateGroupModalVisible(false)}
              >
                <FiX size={16} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubText}>
              Create a real-time discussion group for your department or project team.
            </Text>

            {groupError ? (
              <View style={styles.modalErrorBox}>
                <Text style={styles.modalErrorText}>{groupError}</Text>
              </View>
            ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>GROUP NAME *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Hardware Engineering, Network Team"
                placeholderTextColor="#94A3B8"
                value={newGroupName}
                onChangeText={setNewGroupName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>DESCRIPTION & PURPOSE</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="What is this group for? (e.g. Emergency alerts & hardware fixes)"
                placeholderTextColor="#94A3B8"
                value={newGroupDesc}
                onChangeText={setNewGroupDesc}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setCreateGroupModalVisible(false)}
                disabled={creatingGroup}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (!newGroupName.trim() || creatingGroup) && styles.modalSubmitBtnDisabled,
                ]}
                onPress={handleCreateGroup}
                disabled={!newGroupName.trim() || creatingGroup}
              >
                {creatingGroup ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create Group</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: 660,
    minHeight: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  sidebarCol: {
    width: 280,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 14,
    paddingHorizontal: 12,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
  },
  conversationsScroll: {
    flex: 1,
    paddingHorizontal: 10,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  sectionHeadingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  channelsList: {
    gap: 2,
  },
  convItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
    cursor: 'pointer',
  },
  convItemActive: {
    backgroundColor: '#EFF6FF',
  },
  convItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  convItemName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  convItemNameActive: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  membersList: {
    gap: 2,
    marginBottom: 16,
  },
  avatarMiniWrap: {
    position: 'relative',
  },
  avatarMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMiniLetter: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineDotMini: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#10B981',
  },
  memberSubText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  chatPane: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 10,
    marginRight: 6,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  mobileBackBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitleGroup: {
    gap: 2,
    flex: 1,
  },
  channelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  chatHeaderTopic: {
    fontSize: 12,
    color: '#64748B',
  },
  dmTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dmAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dmAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveOnlineText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  chatHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  messageStream: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  emptyChatBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyChatTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyChatSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  messageRowMe: {
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  msgAvatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bubbleWrap: {
    maxWidth: '70%',
    alignItems: 'flex-start',
  },
  bubbleWrapMe: {
    alignItems: 'flex-end',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  senderRoleBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  msgTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bubbleThem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleMe: {
    backgroundColor: '#2563EB',
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  bubbleTextThem: {
    color: '#0F172A',
  },
  bubbleTextMe: {
    color: '#FFFFFF',
  },
  meFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  msgTimeMe: {
    fontSize: 10,
    color: '#94A3B8',
  },
  inputArea: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 44,
  },
  attachBtn: {
    padding: 4,
    cursor: 'pointer',
  },
  chatTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  addMemberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
    cursor: 'pointer',
  },
  addMemberBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
  },
  noMembersBox: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 6,
    marginVertical: 6,
    gap: 6,
  },
  noMembersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  noMembersSub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
  },
  createMemberActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
    cursor: 'pointer',
  },
  createMemberActionBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptySelectionPane: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 10,
    backgroundColor: '#F8FAFC',
  },
  groupIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconBoxActive: {
    backgroundColor: '#DBEAFE',
  },
  groupHeaderBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  groupModalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupModalIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    cursor: 'pointer',
  },
  modalSubText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 16,
  },
  modalErrorBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  formGroup: {
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    outlineStyle: 'none',
  },
  modalTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    cursor: 'pointer',
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  modalSubmitBtnDisabled: {
    backgroundColor: '#94A3B8',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  convItemNameUnread: {
    fontWeight: '700',
    color: '#0F172A',
  },
  unreadCountBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  memberSubTextUnread: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
