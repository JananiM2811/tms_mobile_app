# 🏢 Enterprise Complaint & Ticket Management System (RBAC)

A full-stack, enterprise-grade **Complaint & Ticket Management System** with **Role-Based Access Control (RBAC)** built with **React Native (Expo)** and **Node.js / Express / MongoDB**.

---

## 🌟 Key Features

### 🔐 1. Role-Based Access Control (RBAC)
The system enforces strict permission boundaries across 3 organization roles:

| Feature / Action | 👤 Employee (Raiser) | 🛠️ Technician (Resolver) | 👑 Admin / Manager |
| :--- | :---: | :---: | :---: |
| **Raise New Complaint** | ✅ Yes | ✅ Yes | ✅ Yes |
| **View Complaints** | Own complaints only | Assigned & Dept queue | All organization complaints |
| **Status Updates** | Confirm Close / Reopen | In Progress, Resolved, Reject | Any status transition |
| **Assign / Reassign Tickets** | ❌ No | Self-assign unassigned | Assign to any technician |
| **Public Comments & Replies** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Private Internal Staff Notes** | ❌ Hidden | ✅ Create & View | ✅ Create & View |
| **Manage User Roles & Depts** | ❌ No | ❌ No | ✅ Full RBAC Directory |
| **Analytics & SLA Dashboard** | Personal Summary | Queue & Assigned Stats | Organization-wide Metrics |

---

## ⚡ Pre-Configured Demo Accounts (1-Click Login)

The system automatically initializes seed data on startup for instant testing:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **👑 Admin / Manager** | `admin@company.com` | `password123` | Full administrative control, role modification, ticket assignments |
| **🛠️ Technician** | `tech@company.com` | `password123` | Queue handling, diagnostics, internal staff notes, resolution logging |
| **👤 Employee** | `employee@company.com` | `password123` | Raise tickets, view personal issues, rate/close resolved complaints |

---

## 🏗️ Project Architecture

```
miniproject/
├── server/                        # Node.js + Express Backend
│   ├── src/
│   │   ├── config/db.js           # MongoDB connection + Auto in-memory fallback
│   │   ├── models/
│   │   │   ├── User.js            # User Schema (Roles: employee, technician, admin)
│   │   │   └── Ticket.js          # Ticket Schema (Timeline, Comments, Status, Priorities)
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT Token verification middleware
│   │   │   └── rbac.js            # Role-Based Access Control authorization middleware
│   │   ├── controllers/
│   │   │   ├── authController.js   # Register, Login, Profile
│   │   │   ├── ticketController.js # RBAC filtered complaints, status transitions, stats
│   │   │   └── userController.js   # User & Technician directory management
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── ticketRoutes.js
│   │   │   └── userRoutes.js
│   │   ├── seeds/seed.js          # Initial realistic organization complaints & users
│   │   └── server.js              # Express app bootstrap
│   ├── .env                       # Environment configuration (PORT, MONGODB_URI, JWT_SECRET)
│   └── package.json
│
└── client/                        # React Native (Expo) Frontend
    ├── src/
    │   ├── api/api.js             # Unified REST API client
    │   ├── context/AuthContext.js # Auth state & 1-click role switcher
    │   ├── theme/colors.js        # Design tokens & color system
    │   ├── components/
    │   │   ├── Header.js          # Header with user role badge & fast switcher
    │   │   ├── StatsCard.js       # Real-time metrics visualization
    │   │   ├── TicketCard.js      # Complaint card with badges and assignees
    │   │   ├── StatusBadge.js     # Colored status indicators
    │   │   ├── Badges.js          # Priority & Role badges
    │   │   ├── CreateTicketModal.js # Complaint submission modal
    │   │   ├── TicketDetailModal.js # Full details, status workflow, and comments
    │   │   └── UserManagementModal.js # Admin RBAC role assignment modal
    │   └── screens/
    │       ├── LoginScreen.js     # 1-Click fast login cards & credentials form
    │       └── MainDashboard.js   # Analytics, complaint feeds, and filters
    ├── App.js                     # Root component with AuthProvider
    └── package.json
```

---

## 🚀 How to Run Locally

### 1. Backend Server (Node.js & MongoDB)
```bash
cd server
npm install
npm start
```
- Runs at: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`
- *Note:* If a local MongoDB daemon or MongoDB Atlas URI is present in `.env`, it will connect to it; otherwise, it automatically starts an embedded in-memory MongoDB instance for zero-friction local testing.

### 2. Frontend App (React Native Expo)
```bash
cd client
npm run web
```
- Open your browser at: `http://localhost:8081`
- To run on Android or iOS devices via Expo Go:
  ```bash
  npx expo start
  ```
  Scan the QR code with the Expo Go app.

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Sign in with email and password (returns JWT)
- `POST /api/auth/register` — Register a new account
- `GET /api/auth/me` — Fetch authenticated profile

### Tickets / Complaints (`/api/tickets`)
- `GET /api/tickets` — Retrieve complaints (automatically scoped by RBAC role)
- `GET /api/tickets/:id` — Retrieve single complaint details & audit logs
- `POST /api/tickets` — Raise a new complaint
- `PATCH /api/tickets/:id/status` — Update ticket status (`in_progress`, `resolved`, `closed`, `rejected`)
- `PATCH /api/tickets/:id/assign` — Assign ticket to technician (`admin`, `technician`)
- `POST /api/tickets/:id/comments` — Add public reply or private staff note
- `GET /api/tickets/stats/dashboard` — Get metric counts and SLA breakdowns

### Users & RBAC (`/api/users`)
- `GET /api/users` — List organization users (*Admin only*)
- `GET /api/users/technicians` — List available technicians for assignment
- `PATCH /api/users/:id` — Update user's role or department (*Admin only*)
