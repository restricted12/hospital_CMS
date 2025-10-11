# Hospital CMS Backend API

A comprehensive Clinic Management System backend built with Node.js, Express, MongoDB, and Mongoose.

## 🚀 Features

- **User Management**: Role-based access control with 6 different user roles
- **Patient Management**: Complete patient registration and information management
- **Visit Workflow**: End-to-end visit management from registration to completion
- **Laboratory System**: Lab test management and result tracking
- **Prescription Management**: Digital prescription creation and pharmacy workflow
- **Payment Processing**: Multiple payment methods and transaction tracking
- **Dashboard Analytics**: Comprehensive reporting and analytics
- **File Upload**: Support for lab test results and document uploads
- **Security**: JWT authentication, rate limiting, and input validation

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-cms/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/hospital_cms
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   PORT=5000
   NODE_ENV=development
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗂️ Database Models

### User
- `_id`, `fullName`, `email`, `password`, `role`, `isActive`, `createdAt`
- Roles: `admin`, `reception`, `checkerDoctor`, `mainDoctor`, `labTech`, `pharmacy`

### Patient
- `_id`, `firstName`, `lastName`, `gender`, `age`, `contact`, `address`, `registeredBy`, `createdAt`

### Visit
- `_id`, `patient`, `visitDate`, `complaint`, `symptoms`, `diagnosis`, `checkerDoctor`, `mainDoctor`, `labTests`, `status`, `totalCost`, `paid`, `notes`, `createdAt`
- Status: `registered`, `checked`, `lab_pending`, `lab_done`, `diagnosed`, `done`

### LabTest
- `_id`, `visit`, `testName`, `testType`, `result`, `fileUrl`, `performedBy`, `isCompleted`, `completedAt`, `notes`, `cost`, `createdAt`

### Prescription
- `_id`, `visit`, `mainDoctor`, `medicines`, `pharmacyStatus`, `dispensedBy`, `dispensedAt`, `notes`, `totalCost`, `createdAt`
- Status: `pending`, `dispensed`, `partially_dispensed`

### Payment
- `_id`, `visit`, `amount`, `paymentType`, `paymentMethod`, `isPaid`, `receivedBy`, `transactionId`, `notes`, `paidAt`, `createdAt`

### Medicine
- `_id`, `name`, `genericName`, `price`, `stock`, `minimumStock`, `description`, `category`, `unit`, `manufacturer`, `expiryDate`, `batchNumber`, `isActive`, `createdAt`

## 🛣️ API Endpoints

### Authentication & Users
- `POST /api/auth/register` - Create new user (admin only)
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update current user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:id` - Update user role/status
- `DELETE /api/users/:id` - Delete user

### Patients & Visits
- `POST /api/patients` - Register patient (reception)
- `GET /api/patients` - List patients
- `GET /api/patients/:id` - Get patient details
- `POST /api/visits` - Create new visit (reception)
- `GET /api/visits` - List visits (filter by role/status)
- `PUT /api/visits/:id/status` - Update visit status

### Checker Doctor Workflow
- `GET /api/checker/visits/pending` - Get paid patients for checking
- `PUT /api/checker/visits/:id/checker` - Save symptoms & lab test list
- `PUT /api/checker/visits/:id/direct` - Direct diagnosis without lab tests

### Laboratory Management
- `GET /api/labs` - Get lab tests assigned to lab tech
- `PUT /api/labs/:id/result` - Upload test result
- `GET /api/labs/pending` - Get pending lab tests
- `GET /api/labs/completed` - Get completed lab tests

### Main Doctor Prescriptions
- `GET /api/prescriptions/visits/lab-done` - Get visits with lab results
- `POST /api/prescriptions` - Add final prescription
- `GET /api/prescriptions/:visitId` - Get prescription for visit

### Pharmacy Management
- `GET /api/pharmacy/prescriptions/pending` - List pending prescriptions
- `PUT /api/pharmacy/prescriptions/:id/dispense` - Mark as dispensed
- `PUT /api/pharmacy/prescriptions/:id/partial-dispense` - Partial dispensing
- `GET /api/pharmacy/medicines` - Get medicine inventory

### Payment Processing
- `POST /api/payments` - Create payment record
- `GET /api/payments/visit/:visitId` - View payments by visit
- `PUT /api/payments/:id/confirm` - Mark as paid

### Admin Dashboard
- `GET /api/dashboard/overview` - Total patients, revenue, visits
- `GET /api/dashboard/revenue` - Revenue chart data
- `GET /api/dashboard/patients` - Patient analytics
- `GET /api/dashboard/visits` - Visit analytics
- `GET /api/dashboard/performance` - System performance metrics

## 🔄 System Flow

1. **Reception** registers patient → creates Visit → accepts consultation payment
2. **Checker Doctor** sees visit → adds symptoms + lab tests → sends lab request → Reception adds lab cost → patient pays
3. **Lab Tech** sees paid lab requests → performs test → uploads result → notifies Main Doctor
4. **Main Doctor** sees result → diagnoses → writes prescription → sends to Pharmacy
5. **Pharmacy** sees prescription → dispenses medicine → marks "dispensed"
6. **Admin** can monitor everything from dashboard

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── errorHandler.js      # Error handling middleware
│   └── upload.js            # File upload middleware
├── models/
│   ├── User.js              # User model
│   ├── Patient.js           # Patient model
│   ├── Visit.js             # Visit model
│   ├── LabTest.js           # Lab test model
│   ├── Prescription.js      # Prescription model
│   ├── Payment.js           # Payment model
│   └── Medicine.js          # Medicine model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management routes
│   ├── patients.js          # Patient routes
│   ├── visits.js            # Visit routes
│   ├── checker.js           # Checker doctor routes
│   ├── labs.js              # Laboratory routes
│   ├── prescriptions.js     # Prescription routes
│   ├── pharmacy.js          # Pharmacy routes
│   ├── payments.js          # Payment routes
│   └── dashboard.js         # Dashboard routes
├── utils/
│   └── generateToken.js     # JWT token generation
├── uploads/                 # File upload directory
├── server.js                # Main server file
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

1. **Environment Variables**: Set up production environment variables
2. **Database**: Set up MongoDB Atlas or production MongoDB instance
3. **File Storage**: Configure file upload directory
4. **Security**: Update CORS origins and JWT secrets
5. **Process Management**: Use PM2 or similar for production

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "hospital-cms"

# Monitor application
pm2 monit
```

## 📝 API Documentation

### Request/Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": {
    // Response data
  }
}
```

### Error Handling

Errors are returned with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Pagination

List endpoints support pagination:

```
GET /api/endpoint?page=1&limit=10
```

Response includes pagination metadata:

```json
{
  "success": true,
  "count": 10,
  "total": 100,
  "pagination": {
    "page": 1,
    "limit": 10,
    "pages": 10
  },
  "data": {
    // Array of results
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Hospital CMS Backend API v1.0.0** - Built with ❤️ for better healthcare management
