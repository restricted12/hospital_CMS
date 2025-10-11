import React, { useState, useEffect } from 'react';
import { Nav, Offcanvas } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUserMd, 
  FaFlask, 
  FaPills, 
  FaUserShield,
  FaHospitalUser,
  FaStethoscope,
  FaClipboardList,
  FaUsers,
  FaMoneyBillWave,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaChevronRight,
  FaChevronLeft,
  FaSignOutAlt,
  FaCog,
  FaBell,
  FaHome,
  FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ collapsed, onToggle, isMobile }) => {
  const { user, hasPermission, logout, getRoleDisplayName } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // Handle mobile menu toggle
  const handleMobileToggle = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Listen for mobile menu toggle events
  useEffect(() => {
    const handleMobileMenuToggle = () => {
      setShowMobileMenu(prev => !prev);
    };

    if (isMobile) {
      window.addEventListener('toggleMobileMenu', handleMobileMenuToggle);
      return () => {
        window.removeEventListener('toggleMobileMenu', handleMobileMenuToggle);
      };
    }
  }, [isMobile]);

  const getMenuItems = (role) => {
    const commonItems = [
      { 
        icon: FaTachometerAlt, 
        label: 'Dashboard', 
        path: '/dashboard', 
        color: 'primary',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
    ];

    const roleItems = {
      reception: [
        { 
          icon: FaHospitalUser, 
          label: 'Patients', 
          path: '/patients', 
          color: 'info',
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        },
        { 
          icon: FaClipboardList, 
          label: 'Visits', 
          path: '/visits', 
          color: 'warning',
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
        },
        { 
          icon: FaMoneyBillWave, 
          label: 'Payments', 
          path: '/payments', 
          color: 'success',
          gradient: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)'
        }
      ],
      checkerDoctor: [
        { 
          icon: FaStethoscope, 
          label: 'Patient Check', 
          path: '/visits', 
          color: 'info',
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        },
        { 
          icon: FaFlask, 
          label: 'Lab Orders', 
          path: '/visits', 
          color: 'warning',
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
        }
      ],
      labTech: [
        { 
          icon: FaFlask, 
          label: 'Lab Tests', 
          path: '/dashboard', 
          color: 'warning',
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
        },
        { 
          icon: FaChartBar, 
          label: 'Test Results', 
          path: '/dashboard', 
          color: 'info',
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        }
      ],
      mainDoctor: [
        { 
          icon: FaStethoscope, 
          label: 'Diagnosis', 
          path: '/dashboard', 
          color: 'success',
          gradient: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)'
        },
        { 
          icon: FaPills, 
          label: 'Prescriptions', 
          path: '/prescriptions', 
          color: 'primary',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }
      ],
      pharmacy: [
        { 
          icon: FaPills, 
          label: 'Prescriptions', 
          path: '/prescriptions', 
          color: 'primary',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        { 
          icon: FaClipboardList, 
          label: 'Inventory', 
          path: '/dashboard', 
          color: 'info',
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        }
      ],
      admin: [
        { 
          icon: FaUsers, 
          label: 'Users', 
          path: '/users', 
          color: 'dark',
          gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)'
        },
        { 
          icon: FaHospitalUser, 
          label: 'Patients', 
          path: '/patients', 
          color: 'info',
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
        },
        { 
          icon: FaClipboardList, 
          label: 'Visits', 
          path: '/visits', 
          color: 'warning',
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)'
        },
        { 
          icon: FaPills, 
          label: 'Prescriptions', 
          path: '/prescriptions', 
          color: 'primary',
          gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        { 
          icon: FaMoneyBillWave, 
          label: 'Payments', 
          path: '/payments', 
          color: 'success',
          gradient: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)'
        }
      ]
    };

    return [...commonItems, ...(roleItems[role] || [])];
  };

  const menuItems = getMenuItems(user?.role);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div 
      className={`sidebar position-fixed h-100 d-flex flex-column`}
      style={{ 
        width: collapsed ? '80px' : '300px', 
        zIndex: 1000,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
        boxShadow: '4px 0 25px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      {/* Header */}
      <div className="sidebar-header p-4 border-bottom">
        {!collapsed && (
          <div className="d-flex align-items-center">
            <div className="logo-container me-3">
              <div className="logo-icon" style={{
                width: '50px',
                height: '50px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                animation: 'pulse 2s infinite'
              }}>
                <span className="text-white fw-bold fs-5">H</span>
              </div>
            </div>
            <div>
              <h5 className="mb-1 text-primary fw-bold">Hospital CMS</h5>
              <small className="text-muted">Management System</small>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="text-center">
            <div className="logo-icon mx-auto" style={{
              width: '50px',
              height: '50px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              animation: 'pulse 2s infinite'
            }}>
              <span className="text-white fw-bold fs-5">H</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <Nav className="flex-column p-3 flex-grow-1">
        {menuItems.map((item, index) => (
          <Nav.Item key={index} className="mb-2">
            <button
              onClick={() => handleNavigation(item.path)}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`nav-link w-100 d-flex align-items-center py-3 px-3 rounded-3 text-decoration-none ${
                collapsed ? 'justify-content-center' : ''
              } ${isActive(item.path) ? 'active' : ''}`}
              style={{ 
                border: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                background: 'transparent',
                transform: hoveredItem === index ? 'translateX(8px) scale(1.02)' : 'translateX(0) scale(1)'
              }}
              title={collapsed ? item.label : ''}
            >
              <div className="nav-icon-container me-3" style={{
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                background: isActive(item.path) ? item.gradient : 'rgba(108, 117, 125, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isActive(item.path) ? '0 8px 20px rgba(0, 0, 0, 0.15)' : '0 4px 10px rgba(0, 0, 0, 0.05)'
              }}>
                <item.icon 
                  className={isActive(item.path) ? 'text-white' : 'text-muted'} 
                  size={20} 
                  style={{
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
              {!collapsed && (
                <div>
                  <div className={`fw-semibold ${isActive(item.path) ? 'text-white' : 'text-dark'}`}>
                    {item.label}
                  </div>
                  <small className={`${isActive(item.path) ? 'text-white-50' : 'text-muted'}`}>
                    Manage {item.label.toLowerCase()}
                  </small>
                </div>
              )}
              {isActive(item.path) && (
                <div 
                  className="position-absolute start-0 top-50 translate-middle-y rounded-end"
                  style={{ 
                    width: '4px', 
                    height: '30px',
                    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 0 10px rgba(102, 126, 234, 0.5)'
                  }}
                />
              )}
              {hoveredItem === index && !isActive(item.path) && (
                <div 
                  className="position-absolute start-0 top-50 translate-middle-y rounded-end"
                  style={{ 
                    width: '4px', 
                    height: '20px',
                    background: item.gradient,
                    transition: 'all 0.3s ease'
                  }}
                />
              )}
            </button>
          </Nav.Item>
        ))}
      </Nav>
      
      {/* User Section */}
      <div className="sidebar-footer p-4 border-top" style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
      }}>
        {!collapsed && (
          <div className="d-flex align-items-center mb-3">
            <div className="avatar-container me-3">
              <div className="avatar-sm" style={{
                width: '45px',
                height: '45px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <span className="text-white fw-semibold">
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                </span>
              </div>
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold text-dark">{user?.fullName}</div>
              <div className="text-muted small">{getRoleDisplayName(user?.role)}</div>
            </div>
            <button 
              onClick={onToggle}
              className="btn btn-sm btn-outline-secondary rounded-circle"
              style={{ 
                width: '35px', 
                height: '35px',
                transition: 'all 0.3s ease'
              }}
            >
              <FaChevronLeft size={12} />
            </button>
          </div>
        )}
        {collapsed && (
          <div className="text-center">
            <div className="avatar-sm mx-auto mb-3" style={{
              width: '45px',
              height: '45px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <span className="text-white fw-semibold">
                {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
              </span>
            </div>
            <button 
              onClick={onToggle}
              className="btn btn-sm btn-outline-secondary rounded-circle"
              style={{ 
                width: '35px', 
                height: '35px',
                transition: 'all 0.3s ease'
              }}
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className={`d-flex ${collapsed ? 'justify-content-center' : 'gap-2'}`}>
          {!collapsed && (
            <>
              <button 
                onClick={() => navigate('/profile')}
                className="btn btn-outline-primary btn-sm flex-fill rounded-pill"
                style={{
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  background: 'rgba(102, 126, 234, 0.05)'
                }}
              >
                <FaCog className="me-1" />
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm flex-fill rounded-pill"
                style={{
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  background: 'rgba(220, 53, 69, 0.05)'
                }}
              >
                <FaSignOutAlt className="me-1" />
                Logout
              </button>
            </>
          )}
          {collapsed && (
            <div className="d-flex flex-column gap-2">
              <button 
                onClick={() => navigate('/profile')}
                className="btn btn-outline-primary btn-sm rounded-circle"
                style={{ width: '35px', height: '35px' }}
                title="Profile"
              >
                <FaCog size={14} />
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm rounded-circle"
                style={{ width: '35px', height: '35px' }}
                title="Logout"
              >
                <FaSignOutAlt size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Offcanvas
  const MobileSidebar = () => (
    <>
      <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} placement="start" className="sidebar-offcanvas">
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="d-flex align-items-center">
            <div className="logo-icon me-3" style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
            }}>
              <span className="text-white fw-bold">H</span>
            </div>
            <div>
              <h5 className="mb-0 text-primary fw-bold">Hospital CMS</h5>
              <small className="text-muted">Management System</small>
            </div>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Nav className="flex-column">
            {menuItems.map((item, index) => (
              <Nav.Item key={index} className="border-bottom">
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`nav-link w-100 d-flex align-items-center py-3 px-4 text-decoration-none ${
                    isActive(item.path) ? 'active' : ''
                  }`}
                  style={{ 
                    border: 'none', 
                    background: 'transparent',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className="nav-icon-container me-3" style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: isActive(item.path) ? item.gradient : 'rgba(108, 117, 125, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive(item.path) ? '0 8px 20px rgba(0, 0, 0, 0.15)' : '0 4px 10px rgba(0, 0, 0, 0.05)'
                  }}>
                    <item.icon 
                      className={isActive(item.path) ? 'text-white' : 'text-muted'} 
                      size={20} 
                    />
                  </div>
                  <div>
                    <div className={`fw-semibold ${isActive(item.path) ? 'text-white' : 'text-dark'}`}>
                      {item.label}
                    </div>
                    <small className={`${isActive(item.path) ? 'text-white-50' : 'text-muted'}`}>
                      Manage {item.label.toLowerCase()}
                    </small>
                  </div>
                </button>
              </Nav.Item>
            ))}
          </Nav>
          
          {/* Mobile User Section */}
          <div className="p-4 border-top" style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
          }}>
            <div className="d-flex align-items-center mb-3">
              <div className="avatar-sm me-3" style={{
                width: '45px',
                height: '45px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <span className="text-white fw-semibold">
                  {user?.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                </span>
              </div>
              <div>
                <div className="fw-semibold text-dark">{user?.fullName}</div>
                <div className="text-muted small">{getRoleDisplayName(user?.role)}</div>
              </div>
            </div>
            
            <div className="d-flex gap-2">
              <button 
                onClick={() => {
                  navigate('/profile');
                  setShowMobileMenu(false);
                }}
                className="btn btn-outline-primary btn-sm flex-fill rounded-pill"
              >
                <FaCog className="me-1" />
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="btn btn-outline-danger btn-sm flex-fill rounded-pill"
              >
                <FaSignOutAlt className="me-1" />
                Logout
              </button>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );

  return (
    <>
      {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
    </>
  );
};

export default Sidebar;