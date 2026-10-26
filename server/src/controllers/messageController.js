const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message (channel or direct)
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { recipientId, channel, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    if (!recipientId && !channel) {
      return res.status(400).json({ success: false, message: 'Recipient or channel must be specified' });
    }

    const newMsg = await Message.create({
      sender: req.user.id,
      recipient: recipientId || null,
      channel: channel ? channel.toLowerCase() : null,
      content: content.trim(),
    });

    const populated = await Message.findById(newMsg._id)
      .populate('sender', 'name email role department avatar')
      .populate('recipient', 'name email role department avatar');

    // Create a real-time Notification for the recipient if direct message
    if (recipientId) {
      try {
        const Notification = require('../models/Notification');
        const senderName = req.user.name || 'Team Member';
        const snippet = content.trim().length > 60 ? content.trim().substring(0, 57) + '...' : content.trim();
        await Notification.create({
          recipient: recipientId,
          sender: req.user.id,
          type: 'message',
          title: `New Message from ${senderName}`,
          message: snippet,
          isRead: false,
        });
      } catch (notifErr) {
        console.warn('Could not create notification for message:', notifErr.message);
      }
    }

    res.status(201).json({
      success: true,
      message: populated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get channel messages
// @route   GET /api/messages/channel/:channel
// @access  Private
exports.getChannelMessages = async (req, res) => {
  try {
    const channelName = req.params.channel.toLowerCase();
    const messages = await Message.find({ channel: channelName })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role department avatar');

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get direct messages between authenticated user and another user
// @route   GET /api/messages/direct/:userId
// @access  Private
exports.getDirectMessages = async (req, res) => {
  try {
    const myId = req.user.id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, recipient: otherId },
        { sender: otherId, recipient: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email role department avatar')
      .populate('recipient', 'name email role department avatar');

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: otherId, recipient: myId, isRead: false },
      { $set: { isRead: true } }
    );

    // Also mark corresponding message notifications as read for this sender
    try {
      const Notification = require('../models/Notification');
      await Notification.updateMany(
        { sender: otherId, recipient: myId, type: 'message', isRead: false },
        { $set: { isRead: true } }
      );
    } catch (notifErr) {
      console.warn('Could not mark message notifications as read:', notifErr.message);
    }

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get all chat groups
// @route   GET /api/messages/groups
// @access  Private
exports.getGroups = async (req, res) => {
  try {
    const Group = require('../models/Group');
    let groups = await Group.find().sort({ createdAt: 1 });

    if (groups.length === 0) {
      // Create initial clean enterprise groups
      groups = await Group.insertMany([
        {
          name: 'IT Support & Alerts',
          description: 'Server alerts, priority software tickets & hardware outages',
          createdBy: req.user ? req.user.id : null,
        },
        {
          name: 'Facilities Operations',
          description: 'AC regulation, electrical maintenance & office ergonomics',
          createdBy: req.user ? req.user.id : null,
        },
        {
          name: 'General Team Discussion',
          description: 'Daily operations & team announcements',
          createdBy: req.user ? req.user.id : null,
        },
      ]);
    }

    res.json({
      success: true,
      count: groups.length,
      groups,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create a new chat group
// @route   POST /api/messages/groups
// @access  Private
exports.createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }

    const Group = require('../models/Group');
    const existing = await Group.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A group with this name already exists' });
    }

    const newGroup = await Group.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      group: newGroup,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get user DM conversations with last message and unread counts
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const myId = req.user._id.toString();
    const directMessages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
      recipient: { $ne: null },
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name email role department')
      .populate('recipient', 'name email role department');

    const conversationMap = {};

    directMessages.forEach((msg) => {
      const senderId = (msg.sender?._id || msg.sender)?.toString();
      const recipientId = (msg.recipient?._id || msg.recipient)?.toString();
      const otherId = senderId === myId ? recipientId : senderId;

      if (!otherId) return;

      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          userId: otherId,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
        };
      }

      if (recipientId === myId && !msg.isRead) {
        conversationMap[otherId].unreadCount += 1;
      }
    });

    res.json({
      success: true,
      conversations: Object.values(conversationMap),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
