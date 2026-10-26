const User = require('../models/User');
const Department = require('../models/Department');

// @desc    Get all users in organization
// @route   GET /api/users
// @access  Private (Admin, Team Lead)
exports.getAllUsers = async (req, res) => {
  try {
    let query = {};
    if (req.query.department && req.query.department !== 'all') {
      query.department = req.query.department;
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching users',
    });
  }
};

// @desc    Create a new user (Admin)
// @route   POST /api/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, phone } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'password123',
      role: role || 'employee',
      department: department || 'General',
      phone: phone || '',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating user',
    });
  }
};

// @desc    Get all technicians/agents for assignment dropdown
// @route   GET /api/users/technicians
// @access  Private (Admin, Team Lead)
exports.getTechnicians = async (req, res) => {
  try {
    let query = {
      role: { $in: ['technician', 'team_lead', 'admin'] },
      status: 'active',
    };

    if (req.user.role === 'team_lead') {
      query.department = req.user.department;
    }

    const technicians = await User.find(query)
      .select('name email role department')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: technicians.length,
      technicians,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching technicians',
    });
  }
};

// @desc    Update user (Admin only - edit all details)
// @route   PATCH /api/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const { role, department, status, name, email, password, phone } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name && name.trim()) user.name = name.trim();
    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This email is already in use by another user',
        });
      }
      user.email = cleanEmail;
    }
    if (password && password.trim()) {
      user.password = password.trim();
    }
    if (role) user.role = role;
    if (department) user.department = department;
    if (status) user.status = status;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user',
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Safety: prevent deleting own active account
    if (user._id.toString() === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own logged-in account.',
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting user',
    });
  }
};

// @desc    Get all departments
// @route   GET /api/users/departments
// @access  Public
exports.getDepartments = async (req, res) => {
  try {
    let departments = await Department.find().sort({ name: 1 });
    if (departments.length === 0) {
      // Initialize common departments
      departments = await Department.create([
        { name: 'IT & Software', code: 'IT', description: 'Technical infrastructure, software and hardware' },
        { name: 'Facilities & Maintenance', code: 'FAC', description: 'Building facilities, electrical, HVAC and housekeeping' },
        { name: 'Human Resources', code: 'HR', description: 'Workplace, employee relations and policies' },
        { name: 'Finance & Accounts', code: 'FIN', description: 'Billing, invoicing, reimbursements and procurement' },
        { name: 'Operations', code: 'OPS', description: 'General operations and workspace management' },
      ]);
    }
    res.json({
      success: true,
      count: departments.length,
      departments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching departments',
    });
  }
};

// @desc    Create department
// @route   POST /api/users/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
    }

    const dept = await Department.create({
      name: name.trim(),
      code: code ? code.trim() : name.slice(0, 3).toUpperCase(),
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: dept,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating department',
    });
  }
};

// @desc    Update department (Admin only)
// @route   PATCH /api/users/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    const dept = await Department.findById(req.params.id);

    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    const oldName = dept.name;
    if (name && name.trim()) dept.name = name.trim();
    if (code !== undefined) dept.code = code.trim().toUpperCase();
    if (description !== undefined) dept.description = description;

    await dept.save();

    // Cascade update users and tickets if name changed
    if (name && name.trim() !== oldName) {
      await User.updateMany({ department: oldName }, { department: name.trim() });
      try {
        const Ticket = require('../models/Ticket');
        await Ticket.updateMany({ department: oldName }, { department: name.trim() });
      } catch (tErr) {
        console.warn('Could not cascade department name in tickets:', tErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Department updated successfully',
      department: dept,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating department',
    });
  }
};

// @desc    Delete department (Admin only)
// @route   DELETE /api/users/departments/:id
// @access  Private (Admin)
exports.deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Department deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting department',
    });
  }
};
