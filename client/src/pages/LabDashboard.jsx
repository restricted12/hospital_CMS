import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaFlask, FaUpload, FaEye, FaCheck, FaTimes, FaFileAlt, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { labService } from '../services/labService';

const LabDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Data states
  const [pendingTests, setPendingTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [stats, setStats] = useState({
    pendingTests: 0,
    completedToday: 0,
    totalTests: 0,
    averageTime: 0
  });

  // Form states
  const [resultForm, setResultForm] = useState({
    result: '',
    notes: '',
    file: null,
    status: 'completed'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load pending lab tests
      const pendingResult = await labService.getPendingLabTests();
      if (pendingResult.success) {
        const pending = Array.isArray(pendingResult.data) ? pendingResult.data : [];
        setPendingTests(pending);
      }

      // Load completed lab tests
      const completedResult = await labService.getCompletedLabTests();
      if (completedResult.success) {
        const completed = Array.isArray(completedResult.data) ? completedResult.data : [];
        setCompletedTests(completed);
      }

      // Load stats
      const statsResult = await labService.getLabStats();
      if (statsResult.success) {
        const statsData = statsResult.data;
        setStats({
          pendingTests: statsData.pendingTests || 0,
          completedToday: statsData.todayTests || 0,
          totalTests: statsData.totalTests || 0,
          averageTime: 0 // This would need to be calculated based on completion times
        });
      } else {
        setStats({
          pendingTests: 0,
          completedToday: 0,
          totalTests: 0,
          averageTime: 0
        });
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadResult = (test) => {
    setSelectedTest(test);
    setResultForm({
      result: '',
      notes: '',
      file: null,
      status: 'completed'
    });
    setShowResultModal(true);
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('result', resultForm.result);
      formData.append('notes', resultForm.notes);
      formData.append('status', resultForm.status);
      if (resultForm.file) {
        formData.append('resultFile', resultForm.file);
      }

      const result = await labService.uploadResult(selectedTest._id, formData);
      if (result.success) {
        toast.success('Test result uploaded successfully!');
        setShowResultModal(false);
        setSelectedTest(null);
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to upload test result');
    }
  };

  const handleFileChange = (e) => {
    setResultForm({...resultForm, file: e.target.files[0]});
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      low: 'success',
      normal: 'info',
      high: 'warning',
      urgent: 'danger'
    };
    return <Badge bg={variants[priority] || 'secondary'}>{priority}</Badge>;
  };

  if (loading) {
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
          <h2 className="fw-bold text-dark">Laboratory Dashboard</h2>
          <p className="text-muted">Manage lab tests and upload results</p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaFlask size={32} className="text-warning mb-2" />
              <h4 className="fw-bold">{stats.pendingTests}</h4>
              <small className="text-muted">Pending Tests</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaCheck size={32} className="text-success mb-2" />
              <h4 className="fw-bold">{stats.completedToday}</h4>
              <small className="text-muted">Completed Today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaFileAlt size={32} className="text-info mb-2" />
              <h4 className="fw-bold">{stats.totalTests}</h4>
              <small className="text-muted">Total Tests</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaTimes size={32} className="text-primary mb-2" />
              <h4 className="fw-bold">{stats.averageTime}m</h4>
              <small className="text-muted">Avg. Time</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Lab Tests */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Pending Lab Tests</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Test ID</th>
                    <th>Patient</th>
                    <th>Test Name</th>
                    <th>Requested By</th>
                    <th>Priority</th>
                    <th>Requested Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTests.map(test => (
                    <tr key={test._id}>
                      <td>
                        <Badge bg="primary">#{test._id.slice(-6)}</Badge>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{test.visit?.patient?.firstName} {test.visit?.patient?.lastName}</div>
                          <small className="text-muted">Age: {test.visit?.patient?.age}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{test.testName}</div>
                        <small className="text-muted">{test.description}</small>
                      </td>
                      <td>
                        <div>{test.requestedBy?.fullName}</div>
                        <small className="text-muted">{test.requestedBy?.role}</small>
                      </td>
                      <td>{getPriorityBadge(test.priority || 'normal')}</td>
                      <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleUploadResult(test)}
                        >
                          <FaUpload className="me-1" />
                          Upload Result
                        </Button>
                        <Button variant="outline-primary" size="sm">
                          <FaEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {pendingTests.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No pending lab tests
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Completed Lab Tests */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Recent Completed Tests</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Test ID</th>
                    <th>Patient</th>
                    <th>Test Name</th>
                    <th>Result</th>
                    <th>Completed By</th>
                    <th>Completed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTests.map(test => (
                    <tr key={test._id}>
                      <td>
                        <Badge bg="success">#{test._id.slice(-6)}</Badge>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{test.visit?.patient?.firstName} {test.visit?.patient?.lastName}</div>
                          <small className="text-muted">Age: {test.visit?.patient?.age}</small>
                        </div>
                      </td>
                      <td>
                        <div className="fw-medium">{test.testName}</div>
                        <small className="text-muted">{test.description}</small>
                      </td>
                      <td>
                        <div className="fw-medium">{test.result?.substring(0, 50)}...</div>
                        <small className="text-muted">
                          {test.resultFile && (
                            <a href={test.resultFile} target="_blank" rel="noopener noreferrer">
                              <FaDownload className="me-1" />
                              Download File
                            </a>
                          )}
                        </small>
                      </td>
                      <td>
                        <div>{test.performedBy?.fullName}</div>
                        <small className="text-muted">{test.performedBy?.role}</small>
                      </td>
                      <td>{new Date(test.completedAt || test.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <FaEye />
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {completedTests.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No completed tests yet
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Upload Result Modal */}
      <Modal show={showResultModal} onHide={() => setShowResultModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Upload Test Result - {selectedTest?.testName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleResultSubmit}>
            {/* Test Info */}
            <Row className="mb-4">
              <Col>
                <Card className="bg-light">
                  <Card.Body>
                    <h6>Test Information</h6>
                    <Row>
                      <Col md={6}>
                        <strong>Patient:</strong> {selectedTest?.visit?.patient?.firstName} {selectedTest?.visit?.patient?.lastName}
                      </Col>
                      <Col md={6}>
                        <strong>Test Name:</strong> {selectedTest?.testName}
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col md={6}>
                        <strong>Requested By:</strong> {selectedTest?.requestedBy?.fullName}
                      </Col>
                      <Col md={6}>
                        <strong>Requested Date:</strong> {new Date(selectedTest?.createdAt).toLocaleDateString()}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Test Result */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Test Result *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={resultForm.result}
                    onChange={(e) => setResultForm({...resultForm, result: e.target.value})}
                    placeholder="Enter the test results in detail..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* File Upload */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Upload Result File (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <Form.Text className="text-muted">
                    Supported formats: PDF, JPG, PNG, DOC, DOCX
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Notes */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={resultForm.notes}
                    onChange={(e) => setResultForm({...resultForm, notes: e.target.value})}
                    placeholder="Additional notes or observations..."
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Status */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Test Status *</Form.Label>
                  <Form.Select
                    value={resultForm.status}
                    onChange={(e) => setResultForm({...resultForm, status: e.target.value})}
                    required
                  >
                    <option value="completed">Completed</option>
                    <option value="inconclusive">Inconclusive</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResultModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleResultSubmit}>
            Upload Result
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LabDashboard;