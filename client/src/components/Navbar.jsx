import { Navbar, Nav, Dropdown } from 'react-bootstrap';
import { FaBell, FaUserCircle, FaBars, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CustomNavbar = ({ onToggleSidebar, isMobile }) => {
  const { user, logout, getRoleDisplayName } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleMenuToggle = () => {
    if (isMobile) {
      // For mobile, dispatch a custom event that the sidebar can listen to
      const event = new CustomEvent('toggleMobileMenu');
      window.dispatchEvent(event);
    } else {
      // For desktop, use the normal toggle
      onToggleSidebar();
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="navbar-custom border-bottom px-4 shadow-sm">
      <button 
        className="btn btn-link text-dark me-3 p-2 rounded-3"
        onClick={handleMenuToggle}
        style={{ 
          border: 'none', 
          background: 'rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
      >
        <FaBars size={18} />
      </button>
      
      <Navbar.Brand href="/dashboard" className="fw-bold text-primary">
        <span className="text-primary">Hospital</span> CMS
      </Navbar.Brand>
      
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto align-items-center">
          <Nav.Link href="#" className="position-relative me-3">
            <FaBell size={18} className="text-muted" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.7rem' }}>
              3
            </span>
          </Nav.Link>
          
          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="d-flex align-items-center text-decoration-none">
              <FaUserCircle size={24} className="text-primary me-2" />
              <div className="d-flex flex-column align-items-start">
                <span className="fw-medium text-dark">{user?.fullName || 'User'}</span>
                <small className="text-muted">{getRoleDisplayName(user?.role)}</small>
              </div>
            </Dropdown.Toggle>
            
            <Dropdown.Menu className="border-0 shadow">
              <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center">
                <FaUserCircle className="me-2 text-muted" />
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate('/profile')} className="d-flex align-items-center">
                <FaCog className="me-2 text-muted" />
                Settings
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center text-danger">
                <FaSignOutAlt className="me-2" />
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default CustomNavbar;
