const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Null for group/channel messages
    },
    channel: {
      type: String,
      default: null, // e.g. 'it-escalations', 'facilities-maintenance', 'general-ops'
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing for rapid conversation retrieval
messageSchema.index({ channel: 1, createdAt: 1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
