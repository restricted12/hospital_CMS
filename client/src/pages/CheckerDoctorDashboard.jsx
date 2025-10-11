import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaStethoscope, FaFlask, FaEye, FaEdit, FaCheck, FaTimes, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { visitService } from '../services/visitService';
import { labService } from '../services/labService';

const CheckerDoctorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [showLabOrderModal, setShowLabOrderModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  
  // Data states
  const [pendingVisits, setPendingVisits] = useState([]);
  const [myVisits, setMyVisits] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [stats, setStats] = useState({
    pendingVisits: 0,
    todayChecked: 0,
    labOrdersSent: 0,
    directDiagnoses: 0
  });

  // Form states
  const [assessmentForm, setAssessmentForm] = useState({
    symptoms: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    notes: '',
    recommendedLabTests: []
  });

  const [labOrderForm, setLabOrderForm] = useState({
    selectedTests: [],
    urgency: 'normal',
    notes: ''
  });

  // Available lab tests
  const availableLabTests = [
    { id: 'blood_test', name: 'Blood Test', price: 50 },
    { id: 'urine_test', name: 'Urine Test', price: 25 },
    { id: 'xray', name: 'X-Ray', price: 100 },
    { id: 'ct_scan', name: 'CT Scan', price: 300 },
    { id: 'mri', name: 'MRI', price: 500 },
    { id: 'ecg', name: 'ECG', price: 75 },
    { id: 'ultrasound', name: 'Ultrasound', price: 150 }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load pending visits for checker doctor
      const pendingResult = await visitService.getPendingVisits();
      if (pendingResult.success) {
        // Ensure data is an array
        const visits = Array.isArray(pendingResult.data) ? pendingResult.data : 
                     Array.isArray(pendingResult.data?.visits) ? pendingResult.data.visits : 
                     [];
        setPendingVisits(visits);
        console.log('Pending visits loaded:', visits);
      } else {
        console.error('Failed to load pending visits:', pendingResult.error);
        setPendingVisits([]);
      }

      // Load my visits
      const myVisitsResult = await visitService.getCheckerDoctorVisits();
      if (myVisitsResult.success) {
        // Ensure data is an array
        const visits = Array.isArray(myVisitsResult.data) ? myVisitsResult.data : 
                     Array.isArray(myVisitsResult.data?.visits) ? myVisitsResult.data.visits : 
                     [];
        setMyVisits(visits);
        console.log('My visits loaded:', visits);
      } else {
        console.error('Failed to load my visits:', myVisitsResult.error);
        setMyVisits([]);
      }

      // Load stats
      const statsResult = await visitService.getCheckerDoctorStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = (visit) => {
    setSelectedVisit(visit);
    setAssessmentForm({
      symptoms: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        weight: '',
        height: ''
      },
      notes: '',
      recommendedLabTests: []
    });
    setShowAssessmentModal(true);
  };

  const handleAssessmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await visitService.saveSymptomsAndLabTests(selectedVisit._id, assessmentForm);
      if (result.success) {
        toast.success('Assessment completed successfully!');
        setShowAssessmentModal(false);
        setSelectedVisit(null);
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to complete assessment');
    }
  };

  const handleDirectDiagnosis = async (visitId) => {
    try {
      const result = await visitService.directDiagnosis(visitId);
      if (result.success) {
        toast.success('Direct diagnosis completed!');
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to complete direct diagnosis');
    }
  };

  const handleLabTestToggle = (testId) => {
    setAssessmentForm(prev => ({
      ...prev,
      recommendedLabTests: prev.recommendedLabTests.includes(testId)
        ? prev.recommendedLabTests.filter(id => id !== testId)
        : [...prev.recommendedLabTests, testId]
    }));
  };

  const getStatusBadge = (status) => {
    const variants = {
      registered: 'primary',
      checked: 'info',
      lab_pending: 'warning',
      lab_done: 'info',
      diagnosed: 'success',
      done: 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getUrgencyBadge = (urgency) => {
    const variants = {
      low: 'success',
      normal: 'info',
      high: 'warning',
      critical: 'danger'
    };
    return <Badge bg={variants[urgency] || 'secondary'}>{urgency}</Badge>;
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
          <h2 className="fw-bold text-dark">Checker Doctor Dashboard</h2>
          <p className="text-muted">Initial patient assessment and lab test ordering</p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaStethoscope size={32} className="text-primary mb-2" />
              <h4 className="fw-bold">{stats.pendingVisits}</h4>
              <small className="text-muted">Pending Assessments</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaCheck size={32} className="text-success mb-2" />
              <h4 className="fw-bold">{stats.todayChecked}</h4>
              <small className="text-muted">Today's Assessments</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaFlask size={32} className="text-info mb-2" />
              <h4 className="fw-bold">{stats.labOrdersSent}</h4>
              <small className="text-muted">Lab Orders Sent</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaEye size={32} className="text-warning mb-2" />
              <h4 className="fw-bold">{stats.directDiagnoses}</h4>
              <small className="text-muted">Direct Diagnoses</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Visits */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Pending Patient Assessments</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Visit Date</th>
                    <th>Complaint</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(pendingVisits) && pendingVisits.length > 0 ? pendingVisits.map(visit => (
                    <tr key={visit._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{visit.patient?.firstName} {visit.patient?.lastName}</div>
                          <small className="text-muted">Age: {visit.patient?.age}, {visit.patient?.gender}</small>
                        </div>
                      </td>
                      <td>{new Date(visit.visitDate).toLocaleDateString()}</td>
                      <td>{visit.complaint?.substring(0, 50)}...</td>
                      <td>{getStatusBadge(visit.status)}</td>
                      <td>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleStartAssessment(visit)}
                        >
                          <FaStethoscope className="me-1" />
                          Assess
                        </Button>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-1"
                        >
                          <FaEye />
                        </Button>
                        <Button 
                          variant="success" 
                          size="sm"
                          onClick={() => handleDirectDiagnosis(visit._id)}
                        >
                          <FaCheck />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="text-muted">
                          <FaStethoscope size={48} className="mb-3" />
                          <h6>No pending visits</h6>
                          <p className="small">All patients have been assessed</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {!Array.isArray(pendingVisits) && (
                <div className="text-center py-4 text-muted">
                  No pending assessments
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* My Recent Assessments */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">My Recent Assessments</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Assessment Date</th>
                    <th>Symptoms</th>
                    <th>Lab Tests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(myVisits) && myVisits.length > 0 ? myVisits.map(visit => (
                    <tr key={visit._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{visit.patient?.firstName} {visit.patient?.lastName}</div>
                          <small className="text-muted">Age: {visit.patient?.age}</small>
                        </div>
                      </td>
                      <td>{new Date(visit.visitDate).toLocaleDateString()}</td>
                      <td>{visit.symptoms?.substring(0, 30)}...</td>
                      <td>
                        <Badge bg="info">{visit.labTests?.length || 0} tests</Badge>
                      </td>
                      <td>{getStatusBadge(visit.status)}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <FaEye />
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        <div className="text-muted">
                          <FaCheck size={48} className="mb-3" />
                          <h6>No assessments completed</h6>
                          <p className="small">Start assessing patients to see them here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
              {!Array.isArray(myVisits) && (
                <div className="text-center py-4 text-muted">
                  No assessments completed yet
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Assessment Modal */}
      <Modal show={showAssessmentModal} onHide={() => setShowAssessmentModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Patient Assessment - {selectedVisit?.patient?.firstName} {selectedVisit?.patient?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAssessmentSubmit}>
            {/* Patient Info */}
            <Row className="mb-4">
              <Col>
                <Card className="bg-light">
                  <Card.Body>
                    <h6>Patient Information</h6>
                    <Row>
                      <Col md={3}>
                        <strong>Name:</strong> {selectedVisit?.patient?.firstName} {selectedVisit?.patient?.lastName}
                      </Col>
                      <Col md={3}>
                        <strong>Age:</strong> {selectedVisit?.patient?.age}
                      </Col>
                      <Col md={3}>
                        <strong>Gender:</strong> {selectedVisit?.patient?.gender}
                      </Col>
                      <Col md={3}>
                        <strong>Phone:</strong> {selectedVisit?.patient?.contact?.phone}
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <strong>Complaint:</strong> {selectedVisit?.complaint}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Symptoms */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Symptoms and Chief Complaint *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={assessmentForm.symptoms}
                    onChange={(e) => setAssessmentForm({...assessmentForm, symptoms: e.target.value})}
                    placeholder="Describe the patient's symptoms in detail..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Vital Signs */}
            <Row className="mb-3">
              <Col>
                <h6>Vital Signs</h6>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Blood Pressure</Form.Label>
                  <Form.Control
                    type="text"
                    value={assessmentForm.vitalSigns.bloodPressure}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      vitalSigns: {...assessmentForm.vitalSigns, bloodPressure: e.target.value}
                    })}
                    placeholder="120/80"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Heart Rate (BPM)</Form.Label>
                  <Form.Control
                    type="number"
                    value={assessmentForm.vitalSigns.heartRate}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      vitalSigns: {...assessmentForm.vitalSigns, heartRate: e.target.value}
                    })}
                    placeholder="72"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Temperature (°F)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    value={assessmentForm.vitalSigns.temperature}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      vitalSigns: {...assessmentForm.vitalSigns, temperature: e.target.value}
                    })}
                    placeholder="98.6"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Weight (lbs)</Form.Label>
                  <Form.Control
                    type="number"
                    value={assessmentForm.vitalSigns.weight}
                    onChange={(e) => setAssessmentForm({
                      ...assessmentForm,
                      vitalSigns: {...assessmentForm.vitalSigns, weight: e.target.value}
                    })}
                    placeholder="150"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Recommended Lab Tests */}
            <Row className="mb-3">
              <Col>
                <h6>Recommended Lab Tests</h6>
                <div className="border rounded p-3">
                  <Row>
                    {availableLabTests.map(test => (
                      <Col md={4} key={test.id} className="mb-2">
                        <Form.Check
                          type="checkbox"
                          id={test.id}
                          label={`${test.name} ($${test.price})`}
                          checked={assessmentForm.recommendedLabTests.includes(test.id)}
                          onChange={() => handleLabTestToggle(test.id)}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>
            </Row>

            {/* Notes */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Assessment Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={assessmentForm.notes}
                    onChange={(e) => setAssessmentForm({...assessmentForm, notes: e.target.value})}
                    placeholder="Additional observations and recommendations..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssessmentModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAssessmentSubmit}>
            Complete Assessment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CheckerDoctorDashboard;