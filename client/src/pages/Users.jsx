import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { userService } from '../services/userService';

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'reception',
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }

      const result = await userService.getUsers(params);
      
      if (result.success) {
        setUsers(result.data.users);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (selectedUser) {
        // Update user
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        result = await userService.updateUser(selectedUser._id, updateData);
      } else {
        // Create user
        result = await userService.createUser(formData);
      }
      
      if (result.success) {
        toast.success(selectedUser ? 'User updated successfully!' : 'User created successfully!');
        setShowModal(false);
        setSelectedUser(null);
        resetForm();
        loadUsers();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await userService.deleteUser(userId);
        if (result.success) {
          toast.success('User deleted successfully!');
          loadUsers();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const result = await userService.toggleUserStatus(userId);
      if (result.success) {
        toast.success('User status updated successfully!');
        loadUsers();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'reception',
      isActive: true
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedUser(null);
    resetForm();
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

  if (loading && users.length === 0) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold text-dark">User Management</h2>
          <p className="text-muted">Manage system users and their roles</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaUserPlus className="me-2" />
            Add User
          </Button>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="reception">Reception</option>
            <option value="checkerDoctor">Checker Doctor</option>
            <option value="mainDoctor">Main Doctor</option>
            <option value="labTech">Lab Technician</option>
            <option value="pharmacy">Pharmacy</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>User ID</th>
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
                    <Badge bg="primary">#{user._id.slice(-6)}</Badge>
                  </td>
                  <td>
                    <div className="fw-medium">{user.fullName}</div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.isActive)}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      <FaEye />
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleEdit(user)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant={user.isActive ? "outline-warning" : "outline-success"} 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleToggleStatus(user._id)}
                    >
                      {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(user._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {users.length === 0 && !loading && (
            <div className="text-center py-4 text-muted">
              No users found
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Row className="mt-3">
          <Col>
            <div className="d-flex justify-content-center">
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="me-2"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="align-self-center me-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button 
                variant="outline-primary" 
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </Col>
        </Row>
      )}

      {/* User Modal */}
      <Modal show={showModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedUser ? 'Edit User' : 'Create New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name *</Form.Label>
              <Form.Control
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Email *</Form.Label>
              <Form.Control
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password {!selectedUser && '*'}</Form.Label>
              <Form.Control
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required={!selectedUser}
                placeholder={selectedUser ? "Leave blank to keep current password" : ""}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role *</Form.Label>
              <Form.Select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
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
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Users;