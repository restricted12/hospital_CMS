import React, { useState } from 'react';
import { Navbar as BSNavbar, Nav, Dropdown, Button } from 'react-bootstrap';
import { FaUser, FaSignOutAlt, FaBell, FaCog } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const Navbar = ({ user }) => {
  const { logout } = useAuth();
  const [notifications] = useState([]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

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

  return (
    <BSNavbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <div className="container-fluid">
        <BSNavbar.Brand className="fw-bold text-primary">
          <i className="fas fa-hospital me-2"></i>
          Hospital CMS
        </BSNavbar.Brand>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />

        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {/* Notifications */}
            <Dropdown className="me-3">
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="notifications-dropdown">
                <FaBell />
                {notifications.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {notifications.length}
                  </span>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" style={{ minWidth: '300px' }}>
                <Dropdown.Header>Notifications</Dropdown.Header>
                {notifications.length === 0 ? (
                  <Dropdown.ItemText className="text-muted">
                    No new notifications
                  </Dropdown.ItemText>
                ) : (
                  notifications.map((notification, index) => (
                    <Dropdown.Item key={index} className="d-flex align-items-start">
                      <div className="me-2">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '24px', height: '24px' }}>
                          <i className="fas fa-bell text-white" style={{ fontSize: '10px' }}></i>
                        </div>
                      </div>
                      <div>
                        <div className="fw-bold">{notification.title}</div>
                        <small className="text-muted">{notification.message}</small>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {notification.time}
                        </div>
                      </div>
                    </Dropdown.Item>
                  ))
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* User Menu */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" size="sm" className="d-flex align-items-center">
                <FaUser className="me-2" />
                <span className="d-none d-md-inline">{user?.fullName}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
                <Dropdown.Header>
                  <div className="fw-bold">{user?.fullName}</div>
                  <small className="text-muted">{getRoleDisplayName(user?.role)}</small>
                </Dropdown.Header>
                <Dropdown.Divider />
                <Dropdown.Item href="/profile">
                  <FaCog className="me-2" />
                  Profile Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout} className="text-danger">
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </BSNavbar.Collapse>
      </div>
    </BSNavbar>
  );
};

export default Navbar;

