const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketById,
  updateStatus,
  assignTicket,
  addComment,
  getDashboardStats,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All ticket routes require authentication
router.use(protect);

// Dashboard statistics
router.get('/stats/dashboard', getDashboardStats);

// List tickets (RBAC filtered) & Create complaint
router.route('/')
  .get(getTickets)
  .post(createTicket);

// Single ticket detail, Update & Delete
router.route('/:id')
  .get(getTicketById)
  .put(updateTicket)
  .delete(deleteTicket);

// Update status (Technician, Admin, Employee closing)
router.patch('/:id/status', updateStatus);

// Assign ticket (Admin or Technician self-assign)
router.patch('/:id/assign', authorize('admin', 'technician'), assignTicket);

// Add comments
router.post('/:id/comments', addComment);

module.exports = router;
