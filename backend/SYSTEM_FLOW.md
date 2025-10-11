# Hospital CMS System Flow

## 🔄 Complete Workflow Overview

### 1. Patient Registration & Visit Creation
```
Reception Staff → Patient Registration → Visit Creation → Consultation Payment
```

**Steps:**
1. **Reception** registers new patient using `POST /api/patients`
2. **Reception** creates new visit using `POST /api/visits`
3. **Reception** processes consultation payment using `POST /api/payments`
4. Visit status: `registered` → `paid: true`

### 2. Checker Doctor Workflow
```
Paid Visit → Checker Assessment → Symptoms & Lab Tests → Lab Payment
```

**Steps:**
1. **Checker Doctor** views pending visits using `GET /api/checker/visits/pending`
2. **Checker Doctor** examines patient and records symptoms
3. **Checker Doctor** orders lab tests using `PUT /api/checker/visits/:id/checker`
4. **Reception** processes lab payment using `POST /api/payments`
5. Visit status: `registered` → `lab_pending` (if lab tests ordered) or `checked` (if no lab tests)

### 3. Laboratory Workflow
```
Lab Tests → Sample Collection → Test Performance → Result Upload → Status Update
```

**Steps:**
1. **Lab Tech** views assigned tests using `GET /api/labs`
2. **Lab Tech** performs tests and uploads results using `PUT /api/labs/:id/result`
3. **Lab Tech** marks tests as completed
4. System automatically updates visit status to `lab_done` when all tests are complete

### 4. Main Doctor Diagnosis & Prescription
```
Lab Results → Diagnosis → Prescription Creation → Pharmacy Notification
```

**Steps:**
1. **Main Doctor** views visits with lab results using `GET /api/prescriptions/visits/lab-done`
2. **Main Doctor** reviews lab results and makes diagnosis
3. **Main Doctor** creates prescription using `POST /api/prescriptions`
4. Visit status: `lab_done` → `diagnosed`

### 5. Pharmacy Dispensing
```
Prescription Review → Medicine Dispensing → Stock Update → Visit Completion
```

**Steps:**
1. **Pharmacy** views pending prescriptions using `GET /api/pharmacy/prescriptions/pending`
2. **Pharmacy** reviews prescription details
3. **Pharmacy** dispenses medicines using `PUT /api/pharmacy/prescriptions/:id/dispense`
4. **Pharmacy** updates medicine stock automatically
5. Visit status: `diagnosed` → `done`

### 6. Admin Dashboard & Analytics
```
System Monitoring → Performance Analytics → Revenue Tracking → User Management
```

**Steps:**
1. **Admin** accesses dashboard overview using `GET /api/dashboard/overview`
2. **Admin** monitors revenue using `GET /api/dashboard/revenue`
3. **Admin** tracks patient analytics using `GET /api/dashboard/patients`
4. **Admin** manages users using `GET /api/users` and related endpoints

## 📊 Data Flow Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Patient   │───▶│   Visit     │───▶│  Payment    │
│  (Personal) │    │ (Medical)   │    │(Financial)  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │  Lab Tests  │            │
       │            │ (Results)   │            │
       │            └─────────────┘            │
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │Prescription │            │
       │            │(Medicines)  │            │
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │  Medicine   │    │  Dashboard  │
│(Staff Info) │    │(Inventory)  │    │(Analytics)  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔐 Role-Based Access Control

### Admin
- Full system access
- User management
- Dashboard analytics
- System configuration

### Reception
- Patient registration
- Visit creation
- Payment processing
- Basic reporting

### Checker Doctor
- Patient examination
- Symptom recording
- Lab test ordering
- Visit status updates

### Main Doctor
- Lab result review
- Diagnosis creation
- Prescription writing
- Final visit approval

### Lab Tech
- Lab test performance
- Result upload
- Test status updates
- Lab inventory management

### Pharmacy
- Prescription review
- Medicine dispensing
- Inventory management
- Stock updates

## 📈 Status Flow

```
Visit Status Flow:
registered → checked → lab_pending → lab_done → diagnosed → done

Prescription Status Flow:
pending → dispensed (or partially_dispensed)

Payment Status Flow:
created → paid

Lab Test Status Flow:
created → completed
```

## 🔄 API Endpoint Relationships

### Core Entities
- **Patient**: Foundation for all medical records
- **Visit**: Central hub connecting all workflows
- **User**: Staff authentication and authorization
- **Payment**: Financial transaction tracking

### Supporting Entities
- **LabTest**: Medical test results and files
- **Prescription**: Medicine prescriptions and dispensing
- **Medicine**: Inventory management and pricing

### Workflow Integration
- Each role has specific endpoints for their workflow
- Status updates trigger automatic notifications
- Payment processing enables workflow progression
- File uploads support lab results and documents

## 📋 Key Features

### Real-time Updates
- Visit status changes trigger notifications
- Payment confirmations update visit status
- Lab completion updates main doctor queue

### File Management
- Lab result file uploads
- Document storage and retrieval
- Secure file access controls

### Analytics & Reporting
- Revenue tracking and trends
- Patient demographics analysis
- Staff performance metrics
- System usage statistics

### Security Features
- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- Rate limiting and CORS protection

## 🚀 System Benefits

1. **Streamlined Workflow**: Clear progression from registration to completion
2. **Role-based Access**: Secure access control for different staff types
3. **Real-time Updates**: Instant status updates across the system
4. **Comprehensive Analytics**: Detailed reporting and insights
5. **Scalable Architecture**: Modular design for easy expansion
6. **Secure Operations**: Robust security measures throughout

---

This system flow ensures efficient patient care delivery while maintaining data integrity and security across all operations.
