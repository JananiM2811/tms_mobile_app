const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Department = require('../models/Department');
const Notification = require('../models/Notification');

// Seed file ensuring guaranteed Admin account, Departments, Users, and Sample Complaints
const seedData = async () => {
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin123';

    // 1. Ensure Default Admin Account
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        department: 'Administration',
      });
      console.log('🔑 DEFAULT ADMIN ACCOUNT CREATED:', adminEmail);
    }

    // 2. Ensure Team Lead, Technician, and Employee
    let lead = await User.findOne({ email: 'david@deskflow.com' });
    if (!lead) {
      lead = await User.create({
        name: 'David Chen',
        email: 'david@deskflow.com',
        password: 'password123',
        role: 'team_lead',
        department: 'IT & Software',
      });
    }

    let tech = await User.findOne({ email: 'alex@deskflow.com' });
    if (!tech) {
      tech = await User.create({
        name: 'Alex Rivera',
        email: 'alex@deskflow.com',
        password: 'password123',
        role: 'technician',
        department: 'IT & Software',
      });
    }

    let employee = await User.findOne({ email: 'priya@deskflow.com' });
    if (!employee) {
      employee = await User.create({
        name: 'Priya Sharma',
        email: 'priya@deskflow.com',
        password: 'password123',
        role: 'employee',
        department: 'HR & Workplace',
      });
    }

    // 3. Ensure Departments
    const depts = [
      { name: 'IT & Software', code: 'IT-SW', description: 'Internal applications, software licenses & developer tools' },
      { name: 'Network & Connectivity', code: 'NET-CON', description: 'Enterprise WiFi, LAN cables, switches & VPN tunnels' },
      { name: 'Facilities & Maintenance', code: 'FAC-MNT', description: 'Workstation desks, chairs, lighting & clean bay ops' },
      { name: 'Electrical & HVAC', code: 'ELEC-AC', description: 'Central air conditioning, UPS backups & power sockets' },
      { name: 'HR & Workplace', code: 'HR-WRK', description: 'Workplace policies, employee ergonomics & access IDs' },
    ];

    for (const d of depts) {
      const exists = await Department.findOne({ name: d.name });
      if (!exists) {
        await Department.create(d);
      }
    }

    // 4. Ensure Sample Complaints / Tickets if 0 exist
    const ticketCount = await Ticket.countDocuments();
    if (ticketCount === 0) {
      const sampleTickets = [
        {
          ticketId: 'TKT-1001',
          title: 'WiFi connection dropping intermittently in Marketing Bay 3',
          description: 'Laptops frequently lose DNS resolution during zoom calls on DeskFlow-Corp-5G network. Ping drops 30% packets.',
          category: 'Network & Connectivity',
          priority: 'high',
          status: 'open',
          location: 'Building A, Floor 2, Bay 3',
          createdBy: employee._id,
          assignedTo: null,
          activityLog: [
            {
              action: 'TICKET_CREATED',
              performedBy: employee._id,
              note: 'Complaint submitted by employee via web portal.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            },
          ],
        },
        {
          ticketId: 'TKT-1002',
          title: 'Floor 2 Central AC water condensation leakage near Server Room',
          description: 'Water droplets detected above rack #4 cooling conduit. Urgent technician inspection requested to prevent electrical short-circuit.',
          category: 'Electrical & HVAC',
          priority: 'urgent',
          status: 'in_progress',
          location: 'Floor 2, Server Room Annex',
          createdBy: employee._id,
          assignedTo: tech._id,
          activityLog: [
            {
              action: 'TICKET_CREATED',
              performedBy: employee._id,
              note: 'High-risk incident reported.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
            },
            {
              action: 'STATUS_UPDATED',
              performedBy: tech._id,
              note: 'Assigned to Alex Rivera and marked In Progress. Drainage tray placed under conduit.',
              timestamp: new Date(Date.now() - 1000 * 60 * 45),
            },
          ],
        },
        {
          ticketId: 'TKT-1003',
          title: 'Production Database Redis Cache Latency Spike & High Memory Usage',
          description: 'Memory consumption exceeded 88% on cache node 2. API response times degraded from 40ms to 450ms.',
          category: 'IT & Software',
          priority: 'urgent',
          status: 'in_progress',
          location: 'Cloud Infrastructure / AWS Cluster',
          createdBy: lead._id,
          assignedTo: tech._id,
          activityLog: [
            {
              action: 'TICKET_CREATED',
              performedBy: lead._id,
              note: 'System telemetry alarm raised by DevOps.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
            },
          ],
        },
        {
          ticketId: 'TKT-1004',
          title: 'Ergonomic office chair hydraulic cylinder sink failure',
          description: 'The height adjustment cylinder on desk chair #42 sinks automatically when sitting down. Needs cylinder replacement.',
          category: 'Facilities & Maintenance',
          priority: 'low',
          status: 'resolved',
          location: 'Floor 1, Design Bay, Desk 42',
          createdBy: employee._id,
          assignedTo: tech._id,
          resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          resolutionNotes: 'Replaced pneumatic cylinder with heavy-duty class 4 unit. Tested and verified.',
          activityLog: [
            {
              action: 'TICKET_RESOLVED',
              performedBy: tech._id,
              note: 'Replaced hydraulic piston with new warranty part.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            },
          ],
        },
        {
          ticketId: 'TKT-1005',
          title: 'Requesting JetBrains WebStorm & GitHub Copilot Enterprise License',
          description: 'New frontend developer onboarding. Approved by Team Lead David Chen for frontend repository access.',
          category: 'IT & Software',
          priority: 'medium',
          status: 'resolved',
          location: 'Remote Workstation',
          createdBy: employee._id,
          assignedTo: lead._id,
          resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
          resolutionNotes: 'Issued enterprise license seat key and invited to GitHub organization.',
          activityLog: [
            {
              action: 'TICKET_RESOLVED',
              performedBy: lead._id,
              note: 'Assigned seat key and verified activation.',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
            },
          ],
        },
        {
          ticketId: 'TKT-1006',
          title: 'Conference Room 4 Projector HDMI Cable Damaged',
          description: 'HDMI connector pins bent, displaying magenta tint on screen during client presentations.',
          category: 'Facilities & Maintenance',
          priority: 'medium',
          status: 'closed',
          location: 'Boardroom 4, West Wing',
          createdBy: employee._id,
          assignedTo: tech._id,
          resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          closedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
          resolutionNotes: 'Replaced with 5-meter gold-plated 4K braided HDMI cable.',
        },
      ];

      await Ticket.insertMany(sampleTickets);
      console.log('✨ Seeded 6 realistic enterprise complaints with audit trail & activity logs.');
    }

    // 5. Ensure Sample Messages
    const Message = require('../models/Message');
    const msgCount = await Message.countDocuments();
    if (msgCount === 0) {
      await Message.insertMany([
        {
          sender: tech._id,
          channel: 'it-escalations',
          content: 'Bay 3 WiFi router gateway has been rebooted. The DNS flush is complete.',
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          sender: lead._id,
          channel: 'it-escalations',
          content: 'Thanks Alex. Please check ticket #TKT-1042 and mark it in-progress if verified.',
          createdAt: new Date(Date.now() - 1000 * 60 * 20),
        },
        {
          sender: tech._id,
          channel: 'it-escalations',
          content: 'On it! Monitoring packet loss for another 5 minutes.',
          createdAt: new Date(Date.now() - 1000 * 60 * 15),
        },
        {
          sender: lead._id,
          channel: 'facilities-maintenance',
          content: 'Floor 2 AC maintenance is scheduled for 4:00 PM today.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        },
        {
          sender: admin._id,
          channel: 'general-ops',
          content: 'Welcome team! DeskFlow complaint response time is down 18% this month. Great effort everyone.',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        },
      ]);
      console.log('💬 Seeded initial channel discussions.');
    }
  } catch (err) {
    console.error('[Setup] Error seeding data:', err);
  }
};

// Allow direct execution: node seed.js
if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = seedData;
