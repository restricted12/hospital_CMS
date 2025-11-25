import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaUserMd, FaPills, FaEye, FaEdit, FaCheck, FaPlus, FaFileAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { visitService } from '../services/visitService';
import { prescriptionService } from '../services/prescriptionService';

const MainDoctorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  
  // Data states
  const [visitsWithLabResults, setVisitsWithLabResults] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    pendingDiagnoses: 0,
    prescriptionsWritten: 0,
    todayVisits: 0,
    completedDiagnoses: 0
  });

  // Form states
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', duration: '', instruction: '' }],
    notes: '',
    followUpRequired: false,
    followUpDate: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load visits with lab results
      const visitsResult = await visitService.getVisitsWithLabResults();
      if (visitsResult.success) {
        const visits = Array.isArray(visitsResult.data) ? visitsResult.data : [];
        setVisitsWithLabResults(visits);
      }

      // Load prescriptions (fetch all to ensure visibility)
      const prescriptionsResult = await prescriptionService.getPrescriptions({ all: true });
      if (prescriptionsResult.success) {
        const prescriptions = Array.isArray(prescriptionsResult.data.prescriptions) ? prescriptionsResult.data.prescriptions : [];
        setPrescriptions(prescriptions);
      }

      // Load stats
      const statsResult = await prescriptionService.getPrescriptionStats();
      if (statsResult.success) {
        const statsData = statsResult.data;
        setStats({
          pendingDiagnoses: visitsResult.success ? (Array.isArray(visitsResult.data) ? visitsResult.data.length : 0) : 0,
          prescriptionsWritten: statsData.totalPrescriptions || 0,
          todayVisits: statsData.todayPrescriptions || 0,
          completedDiagnoses: statsData.statusStats?.find(s => s._id === 'dispensed')?.count || 0
        });
      } else {
        setStats({
          pendingDiagnoses: visitsResult.success ? (Array.isArray(visitsResult.data) ? visitsResult.data.length : 0) : 0,
          prescriptionsWritten: 0,
          todayVisits: 0,
          completedDiagnoses: 0
        });
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrescription = (visit) => {
    setSelectedVisit(visit);
    setPrescriptionForm({
      diagnosis: '',
      medicines: [{ name: '', dosage: '', duration: '', instruction: '' }],
      notes: '',
      followUpRequired: false,
      followUpDate: ''
    });
    setShowPrescriptionModal(true);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await prescriptionService.createPrescription({
        visit: selectedVisit._id,
        ...prescriptionForm
      });
      
      if (result.success) {
        toast.success('Prescription created successfully!');
        setShowPrescriptionModal(false);
        setSelectedVisit(null);
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create prescription');
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...prescriptionForm.medicines];
    newMedicines[index][field] = value;
    setPrescriptionForm({...prescriptionForm, medicines: newMedicines});
  };

  const addMedicine = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medicines: [...prescriptionForm.medicines, { name: '', dosage: '', duration: '', instruction: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = prescriptionForm.medicines.filter((_, i) => i !== index);
    setPrescriptionForm({...prescriptionForm, medicines: newMedicines});
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      prescribed: 'info',
      dispensed: 'success',
      completed: 'success'
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
          <h2 className="fw-bold text-dark">Main Doctor Dashboard</h2>
          <p className="text-muted">Diagnose patients and write prescriptions</p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaUserMd size={32} className="text-primary mb-2" />
              <h4 className="fw-bold">{stats.pendingDiagnoses}</h4>
              <small className="text-muted">Pending Diagnoses</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaPills size={32} className="text-success mb-2" />
              <h4 className="fw-bold">{stats.prescriptionsWritten}</h4>
              <small className="text-muted">Prescriptions Written</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaEye size={32} className="text-info mb-2" />
              <h4 className="fw-bold">{stats.todayVisits}</h4>
              <small className="text-muted">Today's Visits</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaCheck size={32} className="text-warning mb-2" />
              <h4 className="fw-bold">{stats.completedDiagnoses}</h4>
              <small className="text-muted">Completed Today</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Visits with Lab Results */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Patients Ready for Diagnosis</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Visit Date</th>
                    <th>Symptoms</th>
                    <th>Lab Tests</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visitsWithLabResults.map(visit => (
                    <tr key={visit._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{visit.patient?.firstName} {visit.patient?.lastName}</div>
                          <small className="text-muted">Age: {visit.patient?.age}, {visit.patient?.gender}</small>
                        </div>
                      </td>
                      <td>{new Date(visit.visitDate).toLocaleDateString()}</td>
                      <td>{visit.symptoms?.substring(0, 50)}...</td>
                      <td>
                        <Badge bg="info">{visit.labTests?.length || 0} tests</Badge>
                        {visit.labTests?.some(test => test.isCompleted) && (
                          <Badge bg="success" className="ms-1">Results Ready</Badge>
                        )}
                      </td>
                      <td>{getPriorityBadge(visit.priority || 'normal')}</td>
                      <td>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleCreatePrescription(visit)}
                        >
                          <FaPills className="me-1" />
                          Write Prescription
                        </Button>
                        <Button variant="outline-primary" size="sm">
                          <FaEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {visitsWithLabResults.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No patients ready for diagnosis
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Prescriptions */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Recent Prescriptions</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Diagnosis</th>
                    <th>Medicines</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {prescriptions.map(prescription => (
                    <tr key={prescription._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{prescription.visit?.patient?.firstName} {prescription.visit?.patient?.lastName}</div>
                          <small className="text-muted">Age: {prescription.visit?.patient?.age}</small>
                        </div>
                      </td>
                      <td>{prescription.diagnosis?.substring(0, 50)}...</td>
                      <td>
                        <Badge bg="info">{prescription.medicines?.length || 0} medicines</Badge>
                      </td>
                      <td>{getStatusBadge(prescription.pharmacyStatus)}</td>
                      <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <FaEye />
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <FaEdit />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {prescriptions.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No prescriptions written yet
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Prescription Modal */}
      <Modal show={showPrescriptionModal} onHide={() => setShowPrescriptionModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Write Prescription - {selectedVisit?.patient?.firstName} {selectedVisit?.patient?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePrescriptionSubmit}>
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
                        <strong>Symptoms:</strong> {selectedVisit?.symptoms}
                      </Col>
                    </Row>
                    {selectedVisit?.labTests?.length > 0 && (
                      <Row className="mt-2">
                        <Col>
                          <strong>Lab Results:</strong>
                          <ul className="mb-0">
                            {selectedVisit.labTests.map((test, index) => (
                              <li key={index}>
                                {test.testName}: {test.result || 'Pending'}
                              </li>
                            ))}
                          </ul>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Diagnosis */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Diagnosis *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                    placeholder="Enter your diagnosis..."
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Medicines */}
            <Row className="mb-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Medicines</h6>
                  <Button variant="outline-primary" size="sm" onClick={addMedicine}>
                    <FaPlus className="me-1" />
                    Add Medicine
                  </Button>
                </div>
                
                {prescriptionForm.medicines.map((medicine, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Medicine Name *</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.name}
                              onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                              placeholder="e.g., Paracetamol"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label>Dosage *</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.dosage}
                              onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                              placeholder="e.g., 500mg"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label>Duration *</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.duration}
                              onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                              placeholder="e.g., 7 days"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group>
                            <Form.Label>Instructions *</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.instruction}
                              onChange={(e) => handleMedicineChange(index, 'instruction', e.target.value)}
                              placeholder="e.g., Take twice daily after meals"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={1}>
                          <Form.Group>
                            <Form.Label>&nbsp;</Form.Label>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="w-100"
                              onClick={() => removeMedicine(index)}
                              disabled={prescriptionForm.medicines.length === 1}
                            >
                              
                            </Button>
                          </Form.Group>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
            </Row>

            {/* Follow-up */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label="Follow-up Required"
                    checked={prescriptionForm.followUpRequired}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, followUpRequired: e.target.checked})}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                {prescriptionForm.followUpRequired && (
                  <Form.Group>
                    <Form.Label>Follow-up Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={prescriptionForm.followUpDate}
                      onChange={(e) => setPrescriptionForm({...prescriptionForm, followUpDate: e.target.value})}
                    />
                  </Form.Group>
                )}
              </Col>
            </Row>

            {/* Notes */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({...prescriptionForm, notes: e.target.value})}
                    placeholder="Any additional instructions or notes for the patient..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrescriptionModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handlePrescriptionSubmit}>
            Create Prescription
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MainDoctorDashboard;