import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

// Import pages
import Login from './pages/Login';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import RoleBasedDashboard from './components/RoleBasedDashboard';

// Role-specific dashboards
import ReceptionDashboard from './pages/ReceptionDashboard';
import CheckerDoctorDashboard from './pages/CheckerDoctorDashboard';
import LabDashboard from './pages/LabDashboard';
import MainDoctorDashboard from './pages/MainDoctorDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Shared pages
import Patients from './pages/Patients';
import Visits from './pages/Visits';
import Prescriptions from './pages/Prescriptions';
import Payments from './pages/Payments';
import Users from './pages/Users';
import Profile from './pages/Profile';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="App">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route 
            index 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Dashboard - Role-based */}
          <Route 
            path="dashboard" 
            element={
              <ProtectedRoute>
                <RoleBasedDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Patients */}
          <Route 
            path="patients" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'reception']}>
                <Patients />
              </ProtectedRoute>
            } 
          />

          {/* Visits */}
          <Route 
            path="visits" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'reception', 'checkerDoctor', 'mainDoctor']}>
                <Visits />
              </ProtectedRoute>
            } 
          />

          {/* Prescriptions */}
          <Route 
            path="prescriptions" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'mainDoctor', 'pharmacy']}>
                <Prescriptions />
              </ProtectedRoute>
            } 
          />

          {/* Payments */}
          <Route 
            path="payments" 
            element={
              <ProtectedRoute requiredRoles={['admin', 'reception']}>
                <Payments />
              </ProtectedRoute>
            } 
          />

          {/* Users (Admin only) */}
          <Route 
            path="users" 
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />

          {/* Profile */}
          <Route 
            path="profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Routes>
    </div>
  );
}

export default App;