const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getChannelMessages,
  getDirectMessages,
  getGroups,
  createGroup,
  getConversations,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

// Protect all messaging routes
router.use(protect);

router.get('/conversations', getConversations);
router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.post('/', sendMessage);
router.get('/channel/:channel', getChannelMessages);
router.get('/direct/:userId', getDirectMessages);

module.exports = router;
