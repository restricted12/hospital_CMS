import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      // For mobile, we'll handle this in the sidebar component
      // The sidebar component will handle mobile menu state internally
      return;
    }
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} isMobile={isMobile} />
      
      <div 
        className="flex-grow-1 d-flex flex-column main-content"
        style={{ 
          marginLeft: !isMobile ? (sidebarCollapsed ? '80px' : '300px') : '0',
          transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <Navbar onToggleSidebar={toggleSidebar} isMobile={isMobile} />
        <main className="flex-grow-1 main-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
