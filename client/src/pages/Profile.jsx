import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Modal, Tab, Tabs, Badge } from 'react-bootstrap';
import { FaUser, FaLock, FaSave, FaEdit, FaCog, FaBell,  FaChartLine, FaHistory } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    notifications: true,
    emailNotifications: true,
    smsNotifications: false,
    theme: 'light'
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateProfile(profileForm);
      if (result.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (result.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="px-3 py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
            <div>
              <h1 className="fw-bold text-dark mb-2">My Profile</h1>
              <p className="text-muted mb-0">Manage your account settings and preferences</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* Profile Sidebar */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="p-4 text-center">
              <div className="avatar-lg bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3">
                <span className="text-primary fw-bold" style={{ fontSize: '2rem' }}>
                  {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : 'U'}
                </span>
              </div>
              <h4 className="fw-bold mb-1">{user.fullName}</h4>
              <p className="text-muted mb-3">{user.email}</p>
              <Badge bg="primary" className="mb-4">{user.role}</Badge>
              
              <div className="border-top pt-3">
                <Row className="text-center">
                  <Col xs={6}>
                    <div className="mb-2">
                      <h5 className="text-primary mb-0">0</h5>
                      <small className="text-muted">Total Tasks</small>
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-2">
                      <h5 className="text-success mb-0">0</h5>
                      <small className="text-muted">Completed</small>
                    </div>
                  </Col>
                </Row>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Profile Content */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom p-0">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="border-0"
                fill
              >
                <Tab eventKey="profile" title={
                  <span className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    Profile
                  </span>
                } />
                <Tab eventKey="security" title={
                  <span className="d-flex align-items-center">
                    <FaShield className="me-2" />
                    Security
                  </span>
                } />
                <Tab eventKey="settings" title={
                  <span className="d-flex align-items-center">
                    <FaCog className="me-2" />
                    Settings
                  </span>
                } />
              </Tabs>
            </Card.Header>
            <Card.Body className="p-4">
              <Tab.Content>
                {/* Profile Tab */}
                <Tab.Pane eventKey="profile">
                  <Form onSubmit={handleProfileSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Full Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={profileForm.fullName}
                            onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                            required
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            required
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Role</Form.Label>
                          <Form.Control
                            type="text"
                            value={user.role}
                            disabled
                            className="bg-light"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Account Status</Form.Label>
                          <Form.Control
                            type="text"
                            value={user.isActive ? 'Active' : 'Inactive'}
                            disabled
                            className="bg-light"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Member Since</Form.Label>
                          <Form.Control
                            type="text"
                            value={new Date(user.createdAt).toLocaleDateString()}
                            disabled
                            className="bg-light"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-semibold">Last Updated</Form.Label>
                          <Form.Control
                            type="text"
                            value={new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
                            disabled
                            className="bg-light"
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="text-end">
                      <Button type="submit" variant="primary" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>

                {/* Security Tab */}
                <Tab.Pane eventKey="security">
                  <Form onSubmit={handlePasswordSubmit}>
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Current Password *</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            required
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">New Password *</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            required
                            minLength={6}
                            size="lg"
                          />
                          <Form.Text className="text-muted">
                            Password must be at least 6 characters long.
                          </Form.Text>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Confirm New Password *</Form.Label>
                          <Form.Control
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            required
                            size="lg"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="text-end">
                      <Button type="submit" variant="primary" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Changing...
                          </>
                        ) : (
                          <>
                            <FaLock className="me-2" />
                            Change Password
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>

                {/* Settings Tab */}
                <Tab.Pane eventKey="settings">
                  <Form onSubmit={handleSettingsSubmit}>
                    <Row>
                      <Col md={12}>
                        <h6 className="fw-semibold mb-3">Notifications</h6>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="notifications"
                            label="Enable Notifications"
                            checked={settingsForm.notifications}
                            onChange={(e) => setSettingsForm({...settingsForm, notifications: e.target.checked})}
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Check
                            type="switch"
                            id="emailNotifications"
                            label="Email Notifications"
                            checked={settingsForm.emailNotifications}
                            onChange={(e) => setSettingsForm({...settingsForm, emailNotifications: e.target.checked})}
                            disabled={!settingsForm.notifications}
                          />
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Check
                            type="switch"
                            id="smsNotifications"
                            label="SMS Notifications"
                            checked={settingsForm.smsNotifications}
                            onChange={(e) => setSettingsForm({...settingsForm, smsNotifications: e.target.checked})}
                            disabled={!settingsForm.notifications}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={12}>
                        <h6 className="fw-semibold mb-3">Appearance</h6>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-semibold">Theme</Form.Label>
                          <Form.Select
                            value={settingsForm.theme}
                            onChange={(e) => setSettingsForm({...settingsForm, theme: e.target.value})}
                            size="lg"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="text-end">
                      <Button type="submit" variant="primary" size="lg" disabled={loading}>
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            Save Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Tab.Pane>
              </Tab.Content>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;