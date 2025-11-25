# 🏥 Hospital CMS - Complete System Flow with Real-time Updates

## 📋 Table of Contents
- [System Overview](#system-overview)
- [Real-time Updates Feature](#real-time-updates-feature)
- [Complete User Flow](#complete-user-flow)
- [Technical Architecture](#technical-architecture)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## 🎯 System Overview

The Hospital CMS is a comprehensive web-based management system designed to streamline hospital operations through role-based access control, integrated workflows, and **real-time updates**. The system manages the complete patient journey from registration to treatment completion with live notifications and automatic data synchronization.

### 🌟 Key Features
- **Real-time WebSocket Communication** - Live updates across all dashboards
- **Multi-Role Dashboard System** - 6 distinct user roles with specialized interfaces
- **Complete Patient Workflow** - From registration to prescription dispensing
- **Live Status Updates** - Real-time tracking of patient progress
- **File Management** - Secure upload and storage of medical documents
- **Payment Processing** - Integrated financial transaction handling
- **Analytics & Reporting** - Comprehensive data insights and metrics

## 🔄 Real-time Updates Feature

### 🌐 WebSocket Integration
The system now includes real-time WebSocket communication that enables instant updates across all dashboards when data changes occur.

#### **How Real-time Updates Work:**

1. **Backend WebSocket Server**
   - Socket.IO server running on the same port as the API
   - Room-based messaging system for different user roles
   - Automatic event emission when data changes

2. **Frontend WebSocket Client**
   - React context for WebSocket connection management
   - Automatic room joining based on user role
   - Real-time event listeners for data updates

3. **Real-time Events**
   - `new-visit` - When receptionist creates a new visit
   - `visit-updated` - When visit status changes
   - `lab-result-ready` - When lab results are uploaded
   - `prescription-ready` - When prescription is created

#### **Real-time Features by Role:**

| Role | Real-time Updates |
|------|------------------|
| **Reception** | New patient registrations, payment confirmations |
| **Checker Doctor** | New visits, lab test orders, status updates |
| **Lab Technician** | New lab test assignments, result uploads |
| **Main Doctor** | Lab results ready, prescription requests |
| **Pharmacy** | New prescriptions, medicine dispensing |
| **Admin** | System-wide updates, user activities |

## 👥 User Roles & Permissions

### 🔐 Role Hierarchy & Access Levels

| Role | Dashboard | Primary Functions | Real-time Features |
|------|-----------|------------------|-------------------|
| **Admin** | AdminDashboard | System management, analytics, user control | All system updates |
| **Reception** | ReceptionDashboard | Patient registration, payments, visit management | New patient notifications |
| **Checker Doctor** | CheckerDoctorDashboard | Patient examination, lab test ordering | **New visit alerts** |
| **Lab Technician** | LabDashboard | Lab test execution, result upload | New test assignments |
| **Main Doctor** | MainDoctorDashboard | Diagnosis, prescription writing | Lab results ready |
| **Pharmacy** | PharmacyDashboard | Medicine dispensing, inventory | New prescriptions |

## 🔄 Complete User Flow

### 1. 🔑 Authentication Flow
```
Login Page → Role Detection → Dashboard Redirect → Protected Routes
```

**Components:**
- **Login.jsx** - Central authentication interface
- **AuthContext.jsx** - Global authentication state management
- **ProtectedRoute.jsx** - Route protection and role validation

**User Journey:**
1. User accesses `/login`
2. Enters credentials (email/password)
3. System validates and assigns role-based token
4. **WebSocket connection established** based on user role
5. Redirects to appropriate dashboard with real-time updates enabled
6. All subsequent routes are protected by role permissions

### 2. 🏠 Dashboard Flow with Real-time Updates
```
RoleBasedDashboard → WebSocket Connection → Real-time Data Sync → Role-Specific Features
```

**Dashboard Components:**
- **AdminDashboard.jsx** - System overview, analytics, user management
- **ReceptionDashboard.jsx** - Patient registration, payments, visit queue
- **CheckerDoctorDashboard.jsx** - **Real-time patient examination with live updates**
- **LabDashboard.jsx** - Test management, result upload
- **MainDoctorDashboard.jsx** - Diagnosis, prescription creation
- **PharmacyDashboard.jsx** - Prescription fulfillment, inventory

### 3. 👤 Patient Management Flow with Real-time Notifications
```
Patient Registration → Visit Creation → Payment Processing → Real-time Notifications → Medical Assessment
```

**Real-time Flow:**
1. **Reception** registers new patient
2. Creates visit record with patient details
3. Processes consultation payment
4. **WebSocket event emitted** to checker doctors
5. **Checker Doctor Dashboard** receives real-time notification
6. Visit appears instantly in pending visits list
7. Visit status: `registered` → `paid`

### 4. 🩺 Medical Assessment Flow with Live Updates
```
Patient Examination → Symptom Recording → Lab Test Ordering → Real-time Status Updates
```

**Real-time Features:**
- **Live Notifications**: Toast messages when new patients arrive
- **Auto-refresh**: Dashboard data updates automatically
- **Status Indicators**: Real-time connection status
- **Visual Alerts**: Dismissible notification banners

**User Journey:**
1. **Checker Doctor** views pending visits (auto-updated)
2. **Real-time notification** shows new patient details
3. Examines patient and records symptoms
4. Orders lab tests if needed
5. **WebSocket event** notifies lab technicians
6. Updates visit status: `registered` → `lab_pending` or `checked`

### 5. 🧪 Laboratory Workflow with Live Updates
```
Lab Test Assignment → Sample Collection → Test Execution → Real-time Result Upload
```

**Real-time Features:**
- **Instant Notifications**: New test assignments appear immediately
- **Live Status Updates**: Test progress tracked in real-time
- **Auto-refresh**: Results appear instantly when uploaded

**User Journey:**
1. **Lab Technician** receives real-time notification of new tests
2. Performs required laboratory tests
3. Uploads test results and files
4. **WebSocket event** notifies main doctor
5. System automatically updates visit status: `lab_pending` → `lab_done`

### 6. 🩺 Diagnosis & Prescription Flow with Live Updates
```
Lab Result Review → Diagnosis Creation → Prescription Writing → Real-time Pharmacy Notification
```

**Real-time Features:**
- **Instant Lab Results**: Results appear immediately when ready
- **Live Notifications**: New prescriptions notify pharmacy
- **Auto-refresh**: Dashboard updates automatically

**User Journey:**
1. **Main Doctor** receives real-time notification of lab results
2. Reviews lab results (auto-refreshed)
3. Makes diagnosis based on findings
4. Creates prescription with medicines
5. **WebSocket event** notifies pharmacy
6. Updates visit status: `lab_done` → `diagnosed`

### 7. 💊 Pharmacy Dispensing Flow with Live Updates
```
Prescription Review → Medicine Dispensing → Stock Update → Real-time Visit Completion
```

**Real-time Features:**
- **Instant Prescriptions**: New prescriptions appear immediately
- **Live Stock Updates**: Inventory updates in real-time
- **Auto-completion**: Visit status updates automatically

**User Journey:**
1. **Pharmacy** receives real-time notification of new prescription
2. Reviews prescription details and medicine availability
3. Dispenses medicines to patient
4. Updates medicine stock automatically
5. **WebSocket event** completes the workflow
6. Visit status: `diagnosed` → `done`

## 🏗️ Technical Architecture

### 🌐 Real-time Architecture
```
Frontend (React + WebSocket) ↔ WebSocket Server (Socket.IO) ↔ Backend API (Express) ↔ Database (MongoDB)
     ↕                              ↕                              ↕                      ↕
UI Components with Live Updates ↔ Real-time Events ↔ Route Handlers with Events ↔ Data Models
     ↕                              ↕                              ↕                      ↕
Real-time State Management ↔ Room-based Messaging ↔ Business Logic with Events ↔ Data Storage
```

### 🎯 Frontend Stack
- **React 18** with modern hooks and functional components
- **React Router v6** for client-side routing
- **Socket.IO Client** for real-time communication
- **Bootstrap 5** for responsive UI components
- **Axios** for API communication
- **React Context** for state management (Auth + WebSocket)
- **React Toastify** for real-time notifications

### 🔧 Backend Stack
- **Node.js** with Express.js framework
- **Socket.IO** for WebSocket communication
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **Express Validator** for input validation
- **CORS** and security middleware

### 📁 Project Structure
```
hospital_CMS/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layers
│   │   ├── context/        # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── WebSocketContext.jsx  # NEW: Real-time updates
│   │   └── App.jsx         # Main application component
│   └── package.json
├── backend/                # Node.js Backend
│   ├── routes/             # API route handlers
│   │   └── visits.js       # Updated with WebSocket events
│   ├── models/             # MongoDB models
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── server.js           # Updated with Socket.IO server
└── README.md               # This documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Backend Setup
```bash
cd backend
npm install
# Socket.IO will be installed automatically
cp env.example .env
# Configure your environment variables
npm run dev
```

**Backend Dependencies Added:**
```json
{
  "socket.io": "^4.8.1"
}
```

### Frontend Setup
```bash
cd client
npm install
# Socket.IO client already included
cp env.example .env.local
# Configure your API endpoints
npm run dev
```

**Frontend Dependencies:**
```json
{
  "socket.io-client": "^4.7.2"
}
```

### Environment Configuration
```env
# Backend (.env)
MONGODB_URI=mongodb://localhost:27017/hospital_cms
JWT_SECRET=your_jwt_secret_key
PORT=5000
CORS_ORIGIN=http://localhost:3000

# Frontend (.env.local)
VITE_API_URL=http://localhost:5000/api
```

## 🔌 WebSocket API Documentation

### Connection Events
```javascript
// Client connects
socket.emit('join-room', 'checkerDoctor');

// Server responses
socket.on('connect', () => {
  console.log('Connected to real-time updates');
});

socket.on('disconnect', () => {
  console.log('Disconnected from real-time updates');
});
```

### Real-time Events

#### New Visit Event
```javascript
// Emitted when receptionist creates a new visit
socket.on('new-visit', (data) => {
  console.log('New visit:', data.visit);
  // data.visit contains:
  // - _id, patient, complaint, visitDate, status, createdAt
});
```

#### Visit Updated Event
```javascript
// Emitted when visit status changes
socket.on('visit-updated', (data) => {
  console.log('Visit updated:', data.visit);
  // data.visit contains updated visit information
});
```

#### Lab Result Ready Event
```javascript
// Emitted when lab results are uploaded
socket.on('lab-result-ready', (data) => {
  console.log('Lab results ready:', data.visit);
  // Notifies main doctor of completed lab tests
});
```

#### Prescription Ready Event
```javascript
// Emitted when prescription is created
socket.on('prescription-ready', (data) => {
  console.log('Prescription ready:', data.prescription);
  // Notifies pharmacy of new prescription
});
```

### Room-based Messaging
- **checkerDoctor** - Checker doctor notifications
- **labTechnician** - Lab technician notifications
- **mainDoctor** - Main doctor notifications
- **pharmacy** - Pharmacy notifications
- **reception** - Reception notifications
- **admin** - Admin notifications

## 🎛️ Real-time Dashboard Features

### 🩺 Checker Doctor Dashboard (Enhanced)
- **Live Connection Status** - Shows WebSocket connection state
- **Real-time Notifications** - Toast messages for new visits
- **Auto-refresh Data** - Pending visits update automatically
- **Visual Alerts** - Dismissible notification banners
- **Manual Refresh** - Backup refresh button

### 🏥 Reception Dashboard
- **Real-time Patient Updates** - New registrations appear instantly
- **Payment Confirmations** - Live payment status updates
- **Visit Queue Management** - Real-time queue updates

### 🧪 Lab Dashboard
- **Instant Test Assignments** - New tests appear immediately
- **Live Result Uploads** - Results sync in real-time
- **Status Tracking** - Test progress updates live

### 👨‍⚕️ Main Doctor Dashboard
- **Live Lab Results** - Results appear when ready
- **Prescription Notifications** - Real-time prescription updates
- **Patient History** - Live medical record updates

### 💊 Pharmacy Dashboard
- **Instant Prescriptions** - New prescriptions appear immediately
- **Live Inventory Updates** - Stock changes in real-time
- **Dispensing Confirmations** - Real-time completion updates

## 🔧 Troubleshooting

### WebSocket Connection Issues
```javascript
// Check connection status
const { isConnected } = useWebSocket();
console.log('WebSocket connected:', isConnected);

// Manual reconnection
socket.connect();
```

### Common Issues

1. **WebSocket Not Connecting**
   - Check CORS settings in backend
   - Verify Socket.IO version compatibility
   - Check network connectivity

2. **Real-time Updates Not Working**
   - Verify user role and room assignment
   - Check browser console for errors
   - Ensure WebSocket context is properly wrapped

3. **Notifications Not Showing**
   - Check ToastContainer configuration
   - Verify event listeners are properly set up
   - Check browser notification permissions

### Debug Mode
```javascript
// Enable Socket.IO debug mode
localStorage.debug = 'socket.io-client:*';
```

## 📈 System Benefits with Real-time Updates

### 🎯 Enhanced Operational Efficiency
- **Instant Notifications** - No more manual refreshing
- **Live Status Updates** - Real-time progress tracking
- **Reduced Wait Times** - Immediate data synchronization
- **Improved Workflow** - Seamless handoffs between departments

### 📊 Better User Experience
- **Real-time Feedback** - Users see changes immediately
- **Live Notifications** - Toast messages and alerts
- **Visual Indicators** - Connection status and updates
- **Responsive Interface** - Smooth, modern user experience

### 🔒 Enhanced Security
- **Role-based Rooms** - Secure message routing
- **Authenticated Connections** - Only authorized users receive updates
- **Data Validation** - All real-time data is validated
- **Audit Trail** - All events are logged

### 🚀 Scalability & Performance
- **Efficient Messaging** - Room-based communication
- **Minimal Data Transfer** - Only necessary data sent
- **Connection Management** - Automatic cleanup and reconnection
- **Error Handling** - Graceful fallbacks and recovery

---

## 📞 Support & Contact

For technical support, feature requests, or system documentation, please refer to the project repository or contact the development team.

**Version:** 2.0.0 (with Real-time Updates)  
**Last Updated:** December 2024  
**License:** MIT

---

*This Hospital CMS system with real-time updates provides a complete solution for modern healthcare facility management, combining intuitive user interfaces with robust backend functionality and live data synchronization to deliver exceptional patient care experiences.*
