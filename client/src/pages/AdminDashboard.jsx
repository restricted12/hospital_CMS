import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaUsers, FaChartLine, FaUserPlus, FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { dashboardService } from '../services/dashboardService';
import { userService } from '../services/userService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Data states
  const [overview, setOverview] = useState({});
  const [users, setUsers] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [patientAnalytics, setPatientAnalytics] = useState({});
  const [visitAnalytics, setVisitAnalytics] = useState({});
  const [performance, setPerformance] = useState({});

  // Form states
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'reception',
    isActive: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load dashboard overview
      const overviewResult = await dashboardService.getOverview();
      if (overviewResult.success) {
        setOverview(overviewResult.data);
      }

      // Load users
      const usersResult = await userService.getUsers();
      if (usersResult.success) {
        setUsers(usersResult.data.users);
      }

      // Load revenue data
      const revenueResult = await dashboardService.getRevenue('30d');
      if (revenueResult.success) {
        setRevenue(revenueResult.data);
      }

      // Load patient analytics
      const patientResult = await dashboardService.getPatientAnalytics();
      if (patientResult.success) {
        setPatientAnalytics(patientResult.data);
      }

      // Load visit analytics
      const visitResult = await dashboardService.getVisitAnalytics();
      if (visitResult.success) {
        setVisitAnalytics(visitResult.data);
      }

      // Load performance metrics
      const performanceResult = await dashboardService.getPerformanceMetrics();
      if (performanceResult.success) {
        setPerformance(performanceResult.data);
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setUserForm({
      fullName: '',
      email: '',
      password: '',
      role: 'reception',
      isActive: true
    });
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserForm({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setShowUserModal(true);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (selectedUser) {
        // Update user
        const updateData = { ...userForm };
        if (!updateData.password) delete updateData.password;
        result = await userService.updateUser(selectedUser._id, updateData);
      } else {
        // Create user
        result = await userService.createUser(userForm);
      }
      
      if (result.success) {
        toast.success(selectedUser ? 'User updated successfully!' : 'User created successfully!');
        setShowUserModal(false);
        setSelectedUser(null);
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await userService.deleteUser(userId);
        if (result.success) {
          toast.success('User deleted successfully!');
          loadDashboardData();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const result = await userService.toggleUserStatus(userId);
      if (result.success) {
        toast.success('User status updated successfully!');
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      reception: 'primary',
      checkerDoctor: 'info',
      mainDoctor: 'success',
      labTech: 'warning',
      pharmacy: 'secondary'
    };
    return <Badge bg={variants[role] || 'secondary'}>{role}</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>;
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-4">
      {/* Header Section */}
      <Row className="mb-5">
        <Col>
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center">
            <div className="mb-4 mb-lg-0">
              <h1 className="fw-bold text-dark mb-2 display-6">Admin Dashboard</h1>
              <p className="text-muted mb-0 fs-5">Complete system overview and analytics</p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                className="btn-modern"
                onClick={() => setShowUserModal(true)}
              >
                <FaUserPlus className="me-2" />
                Add User
              </Button>
              <Button 
                variant="outline-primary" 
                size="lg" 
                className="btn-modern"
                onClick={() => setShowStatsModal(true)}
              >
                <FaChartLine className="me-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Enhanced Stats Cards */}
      <Row className="mb-5 g-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-lg h-100 stats-card-modern">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="stats-icon-modern bg-primary-gradient me-3">
                  <FaUsers className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-1 text-primary">{overview.totalUsers || 0}</h3>
                  <p className="text-muted mb-0 small">Total Users</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-lg h-100 stats-card-modern">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="stats-icon-modern bg-success-gradient me-3">
                  <FaChartLine className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-1 text-success">{overview.totalPatients || 0}</h3>
                  <p className="text-muted mb-0 small">Total Patients</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-lg h-100 stats-card-modern">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="stats-icon-modern bg-info-gradient me-3">
                  <FaEye className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-1 text-info">{overview.totalVisits || 0}</h3>
                  <p className="text-muted mb-0 small">Total Visits</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="border-0 shadow-lg h-100 stats-card-modern">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center">
                <div className="stats-icon-modern bg-warning-gradient me-3">
                  <FaChartLine className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="fw-bold mb-1 text-warning">${overview.totalRevenue || 0}</h3>
                  <p className="text-muted mb-0 small">Total Revenue</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Button 
                    variant="primary" 
                    className="w-100 mb-2"
                    onClick={handleCreateUser}
                  >
                    <FaUserPlus className="me-2" />
                    Create New User
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="info" 
                    className="w-100 mb-2"
                    onClick={() => navigate('/patients')}
                  >
                    <FaEye className="me-2" />
                    View Patients
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="success" 
                    className="w-100 mb-2"
                    onClick={() => navigate('/visits')}
                  >
                    <FaChartLine className="me-2" />
                    View Visits
                  </Button>
                </Col>
                <Col md={3}>
                  <Button 
                    variant="warning" 
                    className="w-100 mb-2"
                    onClick={() => setShowStatsModal(true)}
                  >
                    <FaChartLine className="me-2" />
                    View Analytics
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Management */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">User Management</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{user.fullName}</div>
                          <small className="text-muted">ID: {user._id.slice(-6)}</small>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>{getStatusBadge(user.isActive)}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleEditUser(user)}
                        >
                          <FaEdit />
                        </Button>
                        <Button 
                          variant={user.isActive ? "outline-warning" : "outline-success"} 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleToggleUserStatus(user._id)}
                        >
                          {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* System Analytics */}
      <Row>
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Patient Analytics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-primary">{patientAnalytics.newPatientsToday || 0}</h4>
                    <small className="text-muted">New Patients Today</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-success">{patientAnalytics.newPatientsThisWeek || 0}</h4>
                    <small className="text-muted">This Week</small>
                  </div>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-info">{patientAnalytics.newPatientsThisMonth || 0}</h4>
                    <small className="text-muted">This Month</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-warning">{patientAnalytics.averageAge || 0}</h4>
                    <small className="text-muted">Average Age</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Visit Analytics</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-primary">{visitAnalytics.visitsToday || 0}</h4>
                    <small className="text-muted">Visits Today</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-success">{visitAnalytics.visitsThisWeek || 0}</h4>
                    <small className="text-muted">This Week</small>
                  </div>
                </Col>
              </Row>
              <Row className="mt-3">
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-info">{visitAnalytics.visitsThisMonth || 0}</h4>
                    <small className="text-muted">This Month</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="text-center">
                    <h4 className="text-warning">{visitAnalytics.averageVisitDuration || 0}m</h4>
                    <small className="text-muted">Avg. Duration</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* User Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? 'Edit User' : 'Create New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUserSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={userForm.fullName}
                onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password {!selectedUser && '*'}</Form.Label>
              <Form.Control
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                required={!selectedUser}
                placeholder={selectedUser ? "Leave blank to keep current password" : ""}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                required
              >
                <option value="reception">Reception</option>
                <option value="checkerDoctor">Checker Doctor</option>
                <option value="mainDoctor">Main Doctor</option>
                <option value="labTech">Lab Technician</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Active User"
                checked={userForm.isActive}
                onChange={(e) => setUserForm({...userForm, isActive: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUserSubmit}>
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Analytics Modal */}
      <Modal show={showStatsModal} onHide={() => setShowStatsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>System Analytics</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Revenue Trends</h6>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <h4 className="text-success">${revenue.totalRevenue || 0}</h4>
                    <small className="text-muted">Total Revenue (30 days)</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h6 className="mb-0">Performance Metrics</h6>
                </Card.Header>
                <Card.Body>
                  <div className="text-center">
                    <h4 className="text-info">{performance.averageResponseTime || 0}s</h4>
                    <small className="text-muted">Avg. Response Time</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;