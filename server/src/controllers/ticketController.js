const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to generate unique ticket ID
const generateTicketId = () => {
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `CMP-${Date.now().toString().slice(-4)}${randomStr}`;
};

// Department to category mapping helper for Team Leads
const getCategoriesForDepartment = (dept) => {
  if (!dept) return [];
  const d = dept.toLowerCase();
  if (d.includes('it') || d.includes('software')) {
    return ['IT & Software', 'Hardware & Equipment', 'Network & Connectivity'];
  }
  if (d.includes('facilities') || d.includes('maintenance')) {
    return ['Facilities & Maintenance', 'Electrical & HVAC'];
  }
  if (d.includes('hr') || d.includes('human')) {
    return ['HR & Workplace'];
  }
  return [dept];
};

// @desc    Create a new complaint / ticket
// @route   POST /api/tickets
// @access  Private (Employee, Technician, TL, Admin)
exports.createTicket = async (req, res) => {
  try {
    const { title, description, category, priority, location, attachment, attachmentName } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const ticketId = generateTicketId();

    const ticket = await Ticket.create({
      ticketId,
      title,
      description,
      category: category || 'IT & Software',
      priority: priority || 'medium',
      location: location || 'Main Office',
      attachment: attachment || '',
      attachmentName: attachmentName || '',
      createdBy: req.user._id,
      activityLog: [
        {
          action: 'Created',
          performedBy: req.user._id,
          note: `Complaint created by ${req.user.name} (${req.user.role.toUpperCase()})`,
        },
      ],
    });

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email department role')
      .populate('assignedTo', 'name email department role');

    // Notify Department Team Leads & Admins about new ticket
    const teamLeads = await User.find({
      role: { $in: ['team_lead', 'admin'] },
      _id: { $ne: req.user._id },
    });

    for (const tl of teamLeads) {
      await Notification.create({
        recipient: tl._id,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'ticket_created',
        title: `New Complaint Logged: ${ticket.ticketId}`,
        message: `[${ticket.category}] "${ticket.title}" filed by ${req.user.name} (${req.user.department})`,
      });
    }

    res.status(201).json({
      success: true,
      ticket: populated,
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating ticket',
    });
  }
};

// @desc    Get all tickets with exact Hierarchical RBAC filtering
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res) => {
  try {
    const { status, priority, category, search, department } = req.query;
    let query = {};

    // EXACT RBAC FILTERING:
    // 1. Employee: Sees ONLY tickets created by them
    if (req.user.role === 'employee') {
      query.createdBy = req.user._id;
    }
    // 2. Technician: Sees ONLY tickets assigned directly to them!
    else if (req.user.role === 'technician') {
      query.assignedTo = req.user._id;
    }
    // 3. Team Lead (TL): Sees tickets for their DEPARTMENT only
    else if (req.user.role === 'team_lead') {
      const allowedCategories = getCategoriesForDepartment(req.user.department);
      query.category = { $in: allowedCategories };
    }
    // 4. Admin: Sees ALL tickets across ALL departments!
    else if (req.user.role === 'admin') {
      if (department && department !== 'all') {
        const allowedCategories = getCategoriesForDepartment(department);
        query.category = { $in: allowedCategories };
      }
    }

    // Secondary filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search keywords
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email department role')
      .populate('assignedTo', 'name email department role')
      .sort({ createdAt: -1 });

    // Clean internal comments if requester is employee
    const filteredTickets = tickets.map((t) => {
      const ticketObj = t.toObject();
      if (req.user.role === 'employee') {
        ticketObj.comments = ticketObj.comments.filter((c) => !c.isInternal);
      }
      return ticketObj;
    });

    res.json({
      success: true,
      count: filteredTickets.length,
      userScope: {
        role: req.user.role,
        department: req.user.department,
        scopeDescription:
          req.user.role === 'admin'
            ? 'All Departments & Organization-Wide'
            : req.user.role === 'team_lead'
            ? `${req.user.department} Department Queue`
            : req.user.role === 'technician'
            ? 'Complaints Assigned to Me'
            : 'My Raised Complaints',
      },
      tickets: filteredTickets,
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching tickets',
    });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email department role phone')
      .populate('assignedTo', 'name email department role phone')
      .populate('comments.user', 'name role department')
      .populate('activityLog.performedBy', 'name role');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // RBAC validation:
    if (
      req.user.role === 'employee' &&
      ticket.createdBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view complaints raised by yourself',
      });
    }

    if (
      req.user.role === 'technician' &&
      (!ticket.assignedTo || ticket.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only view complaints assigned to you',
      });
    }

    const ticketObj = ticket.toObject();
    if (req.user.role === 'employee') {
      ticketObj.comments = ticketObj.comments.filter((c) => !c.isInternal);
    }

    res.json({
      success: true,
      ticket: ticketObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching ticket',
    });
  }
};

// @desc    Update ticket status & create notifications
// @route   PATCH /api/tickets/:id/status
// @access  Private
exports.updateStatus = async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    // Role-based permission to update status
    if (req.user.role === 'employee') {
      if (ticket.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You can only update status of your own ticket',
        });
      }
      if (!['closed', 'open'].includes(status)) {
        return res.status(403).json({
          success: false,
          message: 'Employees can only close or reopen resolved tickets',
        });
      }
    }

    const previousStatus = ticket.status;
    ticket.status = status;

    if (status === 'resolved') {
      ticket.resolvedAt = new Date();
      if (resolutionNotes) ticket.resolutionNotes = resolutionNotes;
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    ticket.activityLog.push({
      action: 'Status Change',
      performedBy: req.user._id,
      note: `Changed status from ${previousStatus.toUpperCase()} to ${status.toUpperCase()}${
        resolutionNotes ? `. Note: ${resolutionNotes}` : ''
      }`,
    });

    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email department role')
      .populate('assignedTo', 'name email department role')
      .populate('comments.user', 'name role')
      .populate('activityLog.performedBy', 'name role');

    // Create Notification for raiser (Employee)
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.createdBy,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'status_change',
        title: `Status Updated: ${ticket.ticketId}`,
        message: `Your complaint "${ticket.title}" status changed to ${status.toUpperCase()} by ${req.user.name}`,
      });
    }

    // Create Notification for Assignee if updated by someone else
    if (ticket.assignedTo && ticket.assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.assignedTo,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'status_change',
        title: `Status Updated: ${ticket.ticketId}`,
        message: `Ticket "${ticket.title}" status was changed to ${status.toUpperCase()} by ${req.user.name}`,
      });
    }

    res.json({
      success: true,
      ticket: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating status',
    });
  }
};

// @desc    Assign ticket to technician & notify assignee
// @route   PATCH /api/tickets/:id/assign
// @access  Private (Admin, Team Lead)
exports.assignTicket = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    if (!['admin', 'team_lead'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators and Team Leads can assign tickets',
      });
    }

    const technician = await User.findById(technicianId);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Assignee technician not found',
      });
    }

    ticket.assignedTo = technician._id;
    if (ticket.status === 'open') {
      ticket.status = 'assigned';
    }

    ticket.activityLog.push({
      action: 'Assigned',
      performedBy: req.user._id,
      note: `Assigned to ${technician.name} (${technician.department}) by ${req.user.name} (${req.user.role.toUpperCase()})`,
    });

    await ticket.save();

    const updated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email department role')
      .populate('assignedTo', 'name email department role')
      .populate('activityLog.performedBy', 'name role');

    // Notify the assigned technician!
    await Notification.create({
      recipient: technician._id,
      sender: req.user._id,
      ticket: ticket._id,
      type: 'assigned',
      title: `New Assignment: ${ticket.ticketId}`,
      message: `You were assigned to resolve "${ticket.title}" by ${req.user.name}`,
    });

    // Notify the ticket raiser
    if (ticket.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.createdBy,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'assigned',
        title: `Assignee Updated: ${ticket.ticketId}`,
        message: `Your complaint is now assigned to ${technician.name} (${technician.department})`,
      });
    }

    res.json({
      success: true,
      ticket: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error assigning ticket',
    });
  }
};

// @desc    Add comment / reply to ticket & notify participants
// @route   POST /api/tickets/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { message, isInternal } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment message is required',
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    const internalFlag = req.user.role === 'employee' ? false : Boolean(isInternal);

    ticket.comments.push({
      user: req.user._id,
      message: message.trim(),
      isInternal: internalFlag,
      createdAt: new Date(),
    });

    ticket.activityLog.push({
      action: 'Comment Added',
      performedBy: req.user._id,
      note: `${internalFlag ? 'Staff internal note' : 'Public reply'} by ${req.user.name}`,
    });

    await ticket.save();

    // Notify other party
    if (!internalFlag && ticket.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.createdBy,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'comment',
        title: `New Reply on ${ticket.ticketId}`,
        message: `${req.user.name} replied: "${message.slice(0, 70)}..."`,
      });
    }

    if (ticket.assignedTo && ticket.assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: ticket.assignedTo,
        sender: req.user._id,
        ticket: ticket._id,
        type: 'comment',
        title: `New Comment on ${ticket.ticketId}`,
        message: `${req.user.name} commented: "${message.slice(0, 70)}..."`,
      });
    }

    const updated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email department role')
      .populate('assignedTo', 'name email department role')
      .populate('comments.user', 'name role department')
      .populate('activityLog.performedBy', 'name role');

    const ticketObj = updated.toObject();
    if (req.user.role === 'employee') {
      ticketObj.comments = ticketObj.comments.filter((c) => !c.isInternal);
    }

    res.json({
      success: true,
      ticket: ticketObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding comment',
    });
  }
};

// @desc    Get dashboard statistics with exact Hierarchical RBAC
// @route   GET /api/tickets/stats/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    let baseQuery = {};

    if (req.user.role === 'employee') {
      baseQuery.createdBy = req.user._id;
    } else if (req.user.role === 'technician') {
      baseQuery.assignedTo = req.user._id;
    } else if (req.user.role === 'team_lead') {
      const allowedCategories = getCategoriesForDepartment(req.user.department);
      baseQuery.category = { $in: allowedCategories };
    }

    const total = await Ticket.countDocuments(baseQuery);
    const open = await Ticket.countDocuments({ ...baseQuery, status: 'open' });
    const assigned = await Ticket.countDocuments({ ...baseQuery, status: 'assigned' });
    const inProgress = await Ticket.countDocuments({ ...baseQuery, status: 'in_progress' });
    const resolved = await Ticket.countDocuments({ ...baseQuery, status: 'resolved' });
    const closed = await Ticket.countDocuments({ ...baseQuery, status: 'closed' });
    const urgent = await Ticket.countDocuments({
      ...baseQuery,
      priority: 'urgent',
      status: { $nin: ['resolved', 'closed', 'rejected'] },
    });

    res.json({
      success: true,
      stats: {
        total,
        open,
        assigned,
        inProgress,
        resolved,
        closed,
        urgent,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating statistics',
    });
  }
};

// @desc    Update a complaint / ticket details
// @route   PUT /api/tickets/:id
// @access  Private (Admin, Team Lead, Technician, or Ticket Creator)
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, priority, location, status, assignedTo } = req.body;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const isCreator = ticket.createdBy && ticket.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isTeamLead = req.user.role === 'team_lead';
    const isTechnician = req.user.role === 'technician';

    if (!isAdmin && !isTeamLead && !isTechnician && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this complaint',
      });
    }

    if (title) ticket.title = title.trim();
    if (description) ticket.description = description.trim();
    if (category) ticket.category = category;
    if (priority) ticket.priority = priority;
    if (location !== undefined) ticket.location = location;
    if (status) ticket.status = status;
    if (assignedTo !== undefined) ticket.assignedTo = assignedTo || null;

    ticket.activityLog.push({
      action: 'Updated',
      performedBy: req.user._id,
      note: `Complaint updated by ${req.user.name} (${req.user.role.toUpperCase()})`,
    });

    await ticket.save();

    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role department')
      .populate('assignedTo', 'name email role department')
      .populate('activityLog.performedBy', 'name role')
      .populate('comments.user', 'name role');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      ticket: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating complaint',
    });
  }
};

// @desc    Delete a complaint / ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin, Team Lead, or Ticket Creator)
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const isCreator = ticket.createdBy && ticket.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isTeamLead = req.user.role === 'team_lead';

    if (!isAdmin && !isTeamLead && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this complaint',
      });
    }

    await Ticket.findByIdAndDelete(id);

    // Also delete any notifications referencing this ticket
    await Notification.deleteMany({ ticket: id });

    res.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting complaint',
    });
  }
};

