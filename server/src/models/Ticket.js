const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  isInternal: {
    type: Boolean,
    default: false, // Internal notes only visible to technician & admin
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  note: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide ticket title/summary'],
      trim: true,
      maxlength: 140,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed complaint description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select category'],
      enum: [
        'IT & Software',
        'Hardware & Equipment',
        'Network & Connectivity',
        'Facilities & Maintenance',
        'Electrical & HVAC',
        'HR & Workplace',
        'General Administration',
      ],
      default: 'IT & Software',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'],
      default: 'open',
    },
    location: {
      type: String,
      default: 'Main Office',
      trim: true,
    },
    attachment: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    comments: [commentSchema],
    activityLog: [activityLogSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
