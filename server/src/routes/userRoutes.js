const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  getTechnicians,
  updateUser,
  deleteUser,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// Public: Fetch departments for registration and dropdowns
router.get('/departments', getDepartments);

router.use(protect);

// Department management (Admin only)
router.post('/departments', authorize('admin'), createDepartment);
router.patch('/departments/:id', authorize('admin'), updateDepartment);
router.delete('/departments/:id', authorize('admin'), deleteDepartment);

// Technicians list
router.get('/technicians', authorize('admin', 'team_lead', 'technician'), getTechnicians);

// Users management (Directory accessible to authenticated users, mutations admin only)
router.get('/', getAllUsers);
router.post('/', authorize('admin'), createUser);
router.patch('/:id', authorize('admin'), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
