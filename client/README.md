# Hospital CMS Frontend

A comprehensive React frontend for the Hospital Management System.

## Features

- **Role-based Authentication**: Secure login system with different user roles
- **Dashboard Views**: Customized dashboards for each user role
- **Patient Management**: Complete patient registration and management
- **Visit Tracking**: End-to-end visit management workflow
- **Prescription Management**: Digital prescription system
- **Lab Test Management**: Lab test ordering and result management
- **Payment Processing**: Payment tracking and management
- **User Management**: Admin panel for user administration
- **Responsive Design**: Modern, mobile-friendly interface

## User Roles

1. **Admin**: Full system access and user management
2. **Reception**: Patient registration and visit management
3. **Checker Doctor**: Initial patient assessment and lab ordering
4. **Main Doctor**: Diagnosis and prescription writing
5. **Lab Technician**: Lab test processing and result upload
6. **Pharmacy**: Prescription dispensing and inventory management

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
```

### Environment Setup

Create a `.env` file in the client directory:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000
REACT_APP_APP_NAME=Hospital CMS
REACT_APP_APP_VERSION=1.0.0
REACT_APP_DEBUG=true
```

### Running the Application

```bash
# Start the development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will be available at `http://localhost:3000`

## Demo Credentials

Use these credentials to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | admin123 |
| Reception | reception@hospital.com | reception123 |
| Checker Doctor | checker@hospital.com | checker123 |
| Main Doctor | main@hospital.com | main123 |
| Lab Technician | lab@hospital.com | lab123 |
| Pharmacy | pharmacy@hospital.com | pharmacy123 |

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Navbar.jsx      # Navigation bar
│   ├── Sidebar.jsx     # Sidebar navigation
│   ├── ProtectedRoute.jsx # Route protection
│   └── Unauthorized.jsx # Unauthorized access page
├── context/            # React context providers
│   └── AuthContext.jsx # Authentication context
├── pages/              # Page components
│   ├── Login.jsx       # Login page
│   ├── *Dashboard.jsx  # Role-specific dashboards
│   ├── Patients.jsx    # Patient management
│   ├── Visits.jsx      # Visit management
│   ├── Prescriptions.jsx # Prescription management
│   ├── Payments.jsx    # Payment management
│   ├── Users.jsx       # User management
│   └── Profile.jsx     # User profile
├── services/           # API service layer
│   ├── api.js         # Axios configuration
│   ├── authService.js # Authentication services
│   ├── patientService.js # Patient services
│   ├── visitService.js # Visit services
│   ├── prescriptionService.js # Prescription services
│   ├── paymentService.js # Payment services
│   ├── labTestService.js # Lab test services
│   ├── medicineService.js # Medicine services
│   ├── dashboardService.js # Dashboard services
│   └── userService.js # User services
├── utils/              # Utility functions
├── App.jsx            # Main app component
├── main.jsx          # App entry point
└── index.css         # Global styles
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control
- Protected routes
- Auto-login persistence

### Dashboard Features
- **Reception**: Patient registration, visit creation, payment processing
- **Checker Doctor**: Patient assessment, lab test ordering, direct diagnosis
- **Lab Technician**: Lab test processing, result upload, inventory management
- **Main Doctor**: Patient diagnosis, prescription writing, follow-up scheduling
- **Pharmacy**: Prescription dispensing, inventory management, stock updates
- **Admin**: User management, system analytics, comprehensive overview

### Data Management
- Real-time data loading
- Pagination and filtering
- Search functionality
- Form validation
- Error handling

### UI/UX Features
- Responsive design
- Loading states
- Toast notifications
- Modal dialogs
- Form validation
- Status badges and indicators

## API Integration

The frontend communicates with the backend through a comprehensive service layer:

- **Authentication**: Login, logout, profile management
- **Patients**: CRUD operations, statistics
- **Visits**: Visit management, status updates, workflow
- **Prescriptions**: Prescription creation, dispensing, tracking
- **Payments**: Payment processing, confirmation, tracking
- **Lab Tests**: Test ordering, result upload, status management
- **Users**: User management, role assignment, status updates
- **Dashboard**: Analytics, statistics, overview data

## Development

### Adding New Features

1. Create service functions in the appropriate service file
2. Create/update page components
3. Add routing in App.jsx
4. Update navigation in Sidebar.jsx
5. Add role-based access control

### Styling

The application uses Bootstrap 5 for styling with custom CSS for specific components. All components are responsive and follow a consistent design pattern.

### State Management

The application uses React Context for global state management (authentication) and local state for component-specific data.

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `build` folder.

### Environment Variables

Make sure to set the correct API URL for your production environment:

```env
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

## Support

For issues and questions, please refer to the backend documentation or contact the development team.

## License

This project is licensed under the MIT License.