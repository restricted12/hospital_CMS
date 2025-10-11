import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaClipboardList, 
  FaFlask, 
  FaPrescriptionBottle, 
  FaCreditCard, 
  FaPills, 
  FaUserCog,
  FaUser,
  FaHospital
} from 'react-icons/fa';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'Administrator',
      reception: 'Reception',
      checkerDoctor: 'Checker Doctor',
      mainDoctor: 'Main Doctor',
      labTech: 'Lab Technician',
      pharmacy: 'Pharmacist'
    };
    return roleNames[role] || role;
  };

  const getNavigationItems = () => {
    const baseItems = [
      {
        path: '/',
        label: 'Dashboard',
        icon: FaTachometerAlt,
        roles: ['admin', 'reception', 'checkerDoctor', 'mainDoctor', 'labTech', 'pharmacy']
      }
    ];

    // Role-specific navigation
    const roleItems = {
      admin: [
        { path: '/patients', label: 'Patients', icon: FaUsers },
        { path: '/visits', label: 'Visits', icon: FaClipboardList },
        { path: '/labs', label: 'Lab Tests', icon: FaFlask },
        { path: '/prescriptions', label: 'Prescriptions', icon: FaPrescriptionBottle },
        { path: '/payments', label: 'Payments', icon: FaCreditCard },
        { path: '/medicines', label: 'Medicines', icon: FaPills },
        { path: '/users', label: 'Users', icon: FaUserCog }
      ],
      reception: [
        { path: '/patients', label: 'Patients', icon: FaUsers },
        { path: '/visits', label: 'Visits', icon: FaClipboardList },
        { path: '/payments', label: 'Payments', icon: FaCreditCard }
      ],
      checkerDoctor: [
        { path: '/visits', label: 'Patient Check', icon: FaClipboardList }
      ],
      mainDoctor: [
        { path: '/visits', label: 'Diagnosis', icon: FaClipboardList },
        { path: '/prescriptions', label: 'Prescriptions', icon: FaPrescriptionBottle }
      ],
      labTech: [
        { path: '/labs', label: 'Lab Tests', icon: FaFlask }
      ],
      pharmacy: [
        { path: '/prescriptions', label: 'Prescriptions', icon: FaPrescriptionBottle },
        { path: '/medicines', label: 'Medicines', icon: FaPills }
      ]
    };

    const userItems = roleItems[user?.role] || [];
    return [...baseItems, ...userItems];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="sidebar d-flex flex-column" style={{ width: '250px' }}>
      {/* Header */}
      <div className="p-4 text-center border-bottom">
        <div className="d-flex align-items-center justify-content-center mb-3">
          <div className="bg-white rounded-circle d-flex align-items-center justify-content-center me-3" 
               style={{ width: '40px', height: '40px' }}>
            <FaHospital className="text-primary" />
          </div>
          <div className="text-start">
            <div className="fw-bold text-white">Hospital CMS</div>
            <small className="text-white-50">{getRoleDisplayName(user?.role)}</small>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <Nav className="flex-column flex-grow-1 p-3">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Nav.Item key={index} className="mb-1">
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center ${
                  isActive ? 'active' : ''
                }`}
              >
                <Icon className="me-3" style={{ width: '20px' }} />
                <span>{item.label}</span>
              </Link>
            </Nav.Item>
          );
        })}
      </Nav>

      {/* Profile Link */}
      <div className="p-3 border-top">
        <Link
          to="/profile"
          className={`nav-link d-flex align-items-center ${
            location.pathname === '/profile' ? 'active' : ''
          }`}
        >
          <FaUser className="me-3" style={{ width: '20px' }} />
          <span>Profile</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;

