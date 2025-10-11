import React from 'react';
import { useAuth } from '../context/AuthContext';

// Import all dashboard components
import ReceptionDashboard from '../pages/ReceptionDashboard';
import CheckerDoctorDashboard from '../pages/CheckerDoctorDashboard';
import LabDashboard from '../pages/LabDashboard';
import MainDoctorDashboard from '../pages/MainDoctorDashboard';
import PharmacyDashboard from '../pages/PharmacyDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const RoleBasedDashboard = () => {
  const { user } = useAuth();

  // Debug logging
  console.log('RoleBasedDashboard - Current user:', user);
  console.log('RoleBasedDashboard - User role:', user?.role);

  if (!user) {
    return (
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="text-center">
          <h3 className="text-muted">Loading user data...</h3>
          <p className="text-muted">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  switch (user?.role) {
    case 'reception':
      console.log('Rendering ReceptionDashboard');
      return <ReceptionDashboard />;
    case 'checkerDoctor':
      console.log('Rendering CheckerDoctorDashboard');
      return <CheckerDoctorDashboard />;
    case 'labTech':
      console.log('Rendering LabDashboard');
      return <LabDashboard />;
    case 'mainDoctor':
      console.log('Rendering MainDoctorDashboard');
      return <MainDoctorDashboard />;
    case 'pharmacy':
      console.log('Rendering PharmacyDashboard');
      return <PharmacyDashboard />;
    case 'admin':
      console.log('Rendering AdminDashboard');
      return <AdminDashboard />;
    default:
      console.log('Unknown role:', user?.role);
      return (
        <div className="container-fluid d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="text-center">
            <h3 className="text-muted">Unknown Role: {user?.role}</h3>
            <p className="text-muted">Please contact administrator</p>
            <p className="text-muted">Available roles: reception, checkerDoctor, labTech, mainDoctor, pharmacy, admin</p>
          </div>
        </div>
      );
  }
};

export default RoleBasedDashboard;
