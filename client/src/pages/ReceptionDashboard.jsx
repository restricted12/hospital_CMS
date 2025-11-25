import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaUserPlus, FaCalendarPlus, FaDollarSign, FaSearch, FaClipboardList, FaMoneyBillWave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { patientService } from '../services/patientService';
import { visitService } from '../services/visitService';
import { paymentService } from '../services/paymentService';

const ReceptionDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Data states
  const [patients, setPatients] = useState([]);
  const [visits, setVisits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayVisits: 0,
    todayRevenue: 0,
    pendingPayments: 0
  });

  // Form states
  const [patientForm, setPatientForm] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    contact: { phone: '', email: '' },
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }
  });

  const [visitForm, setVisitForm] = useState({
    patient: '',
    complaint: '',
    visitDate: new Date().toISOString().slice(0, 16)
  });

  const [paymentForm, setPaymentForm] = useState({
    visit: '',
    amount: '',
    paymentType: '',
    paymentMethod: 'cash',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load patients
      const patientsResult = await patientService.getPatients({ limit: 5 });
      if (patientsResult.success) {
        setPatients(patientsResult.data.patients);
      }

      // Load visits
      const visitsResult = await visitService.getVisits({ limit: 5 });
      if (visitsResult.success) {
        setVisits(visitsResult.data.visits);
      }

      // Load payments
      const paymentsResult = await paymentService.getPayments({ limit: 5 });
      if (paymentsResult.success) {
        setPayments(paymentsResult.data.payments);
      }

      // Load patient stats
      const statsResult = await patientService.getPatientStats();
      if (statsResult.success) {
        setStats({
          totalPatients: statsResult.data.totalPatients,
          todayVisits: visitsResult.data?.visits?.filter(v => 
            new Date(v.visitDate).toDateString() === new Date().toDateString()
          ).length || 0,
          todayRevenue: 0, // Calculate from payments
          pendingPayments: paymentsResult.data?.payments?.filter(p => !p.isPaid).length || 0
        });
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await patientService.createPatient(patientForm);
      if (result.success) {
        toast.success('Patient registered successfully!');
        setShowPatientModal(false);
        setPatientForm({
          firstName: '',
          lastName: '',
          gender: '',
          age: '',
          contact: { phone: '', email: '' },
          address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }
        });
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to register patient');
    }
  };

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await visitService.createVisit(visitForm);
      if (result.success) {
        toast.success('Visit created successfully!');
        setShowVisitModal(false);
        setVisitForm({
          patient: '',
          complaint: '',
          visitDate: new Date().toISOString().slice(0, 16)
        });
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create visit');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await paymentService.createPayment(paymentForm);
      if (result.success) {
        toast.success('Payment processed successfully!');
        setShowPaymentModal(false);
        setPaymentForm({
          visit: '',
          amount: '',
          paymentType: '',
          paymentMethod: 'cash',
          transactionId: '',
          notes: ''
        });
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to process payment');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      paid: 'success',
      completed: 'info',
      registered: 'primary',
      checked: 'info',
      lab_pending: 'warning',
      lab_done: 'info',
      diagnosed: 'success',
      done: 'success'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
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
          <h2 className="fw-bold text-dark">Reception Dashboard</h2>
          <p className="text-muted">Manage patients, visits, and payments</p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaUserPlus size={32} className="text-primary mb-2" />
              <h4 className="fw-bold">{stats.totalPatients}</h4>
              <small className="text-muted">Total Patients</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaCalendarPlus size={32} className="text-info mb-2" />
              <h4 className="fw-bold">{stats.todayVisits}</h4>
              <small className="text-muted">Today's Visits</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaDollarSign size={32} className="text-success mb-2" />
              <h4 className="fw-bold">${stats.todayRevenue}</h4>
              <small className="text-muted">Today's Revenue</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaEye size={32} className="text-warning mb-2" />
              <h4 className="fw-bold">{stats.pendingPayments}</h4>
              <small className="text-muted">Pending Payments</small>
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
                <Col md={4}>
                  <Button 
                    variant="primary" 
                    className="w-100 mb-2"
                    onClick={() => setShowPatientModal(true)}
                  >
                    <FaUserPlus className="me-2" />
                    Register New Patient
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    variant="info" 
                    className="w-100 mb-2"
                    onClick={() => setShowVisitModal(true)}
                  >
                    <FaCalendarPlus className="me-2" />
                    Create New Visit
                  </Button>
                </Col>
                <Col md={4}>
                  <Button 
                    variant="success" 
                    className="w-100 mb-2"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <FaDollarSign className="me-2" />
                    Process Payment
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Patients */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Recent Patients</h5>
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/patients')}>
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Age</th>
                    <th>Gender</th>
                    <th>Phone</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(patients) && patients.length > 0 ? patients.map(patient => (
                    <tr key={patient._id}>
                      <td>{patient.firstName} {patient.lastName}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.contact.phone}</td>
                      <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
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
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <FaUserPlus size={48} className="mb-3" />
                          <h6>No patients registered</h6>
                          <p className="small">Register your first patient to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Visits */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Recent Visits</h5>
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/visits')}>
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Complaint</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(visits) && visits.length > 0 ? visits.map(visit => (
                    <tr key={visit._id}>
                      <td>{visit.patient?.firstName} {visit.patient?.lastName}</td>
                      <td>{new Date(visit.visitDate).toLocaleDateString()}</td>
                      <td>{visit.complaint?.substring(0, 50)}...</td>
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
                          <FaClipboardList size={48} className="mb-3" />
                          <h6>No visits recorded</h6>
                          <p className="small">Create your first visit to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Processing */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">Recent Payments</h5>
              <Button variant="outline-primary" size="sm" onClick={() => navigate('/payments')}>
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Visit</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(payments) && payments.length > 0 ? payments.map(payment => (
                    <tr key={payment._id}>
                      <td>#{payment.visit?.visitNumber}</td>
                      <td>${payment.amount}</td>
                      <td>{payment.paymentType}</td>
                      <td>{payment.paymentMethod}</td>
                      <td>{payment.isPaid ? <Badge bg="success">Paid</Badge> : <Badge bg="warning">Pending</Badge>}</td>
                      <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <FaEye />
                        </Button>
                        {!payment.isPaid && (
                          <Button variant="outline-success" size="sm">
                            <FaDollarSign />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="6" className="text-center py-4">
                        <div className="text-muted">
                          <FaMoneyBillWave size={48} className="mb-3" />
                          <h6>No payments recorded</h6>
                          <p className="small">Process your first payment to get started</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Patient Registration Modal */}
      <Modal show={showPatientModal} onHide={() => setShowPatientModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Register New Patient</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePatientSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={patientForm.firstName}
                    onChange={(e) => setPatientForm({...patientForm, firstName: e.target.value})}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={patientForm.lastName}
                    onChange={(e) => setPatientForm({...patientForm, lastName: e.target.value})}
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Age *</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={patientForm.age}
                    onChange={(e) => setPatientForm({...patientForm, age: e.target.value})}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender *</Form.Label>
                  <Form.Select 
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({...patientForm, gender: e.target.value})}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control 
                    type="tel" 
                    value={patientForm.contact.phone}
                    onChange={(e) => setPatientForm({
                      ...patientForm, 
                      contact: {...patientForm.contact, phone: e.target.value}
                    })}
                    required 
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control 
                type="email" 
                value={patientForm.contact.email}
                onChange={(e) => setPatientForm({
                  ...patientForm, 
                  contact: {...patientForm.contact, email: e.target.value}
                })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                value={patientForm.address.street}
                onChange={(e) => setPatientForm({
                  ...patientForm, 
                  address: {...patientForm.address, street: e.target.value}
                })}
                placeholder="Street address"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPatientModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePatientSubmit}>
            Register Patient
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Visit Creation Modal */}
      <Modal show={showVisitModal} onHide={() => setShowVisitModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Visit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleVisitSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Patient *</Form.Label>
              <Form.Select 
                value={visitForm.patient}
                onChange={(e) => setVisitForm({...visitForm, patient: e.target.value})}
                required
              >
                <option value="">Choose Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Visit Date *</Form.Label>
              <Form.Control 
                type="datetime-local" 
                value={visitForm.visitDate}
                onChange={(e) => setVisitForm({...visitForm, visitDate: e.target.value})}
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Complaint *</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                value={visitForm.complaint}
                onChange={(e) => setVisitForm({...visitForm, complaint: e.target.value})}
                required 
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVisitModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleVisitSubmit}>
            Create Visit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Processing Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Process Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePaymentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Visit *</Form.Label>
              <Form.Select 
                value={paymentForm.visit}
                onChange={(e) => setPaymentForm({...paymentForm, visit: e.target.value})}
                required
              >
                <option value="">Choose Visit</option>
                {visits.map(visit => (
                  <option key={visit._id} value={visit._id}>
                    {visit.patient?.firstName} {visit.patient?.lastName} - {new Date(visit.visitDate).toLocaleDateString()}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Amount *</Form.Label>
              <Form.Control 
                type="number" 
                step="0.01" 
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                required 
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Type *</Form.Label>
              <Form.Select 
                value={paymentForm.paymentType}
                onChange={(e) => setPaymentForm({...paymentForm, paymentType: e.target.value})}
                required
              >
                <option value="">Select Type</option>
                <option value="consultation">Consultation</option>
                <option value="lab">Lab Test</option>
                <option value="medicine">Medicine</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payment Method *</Form.Label>
              <Form.Select 
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                required
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="insurance">Insurance</option>
                <option value="online">Online</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Transaction ID</Form.Label>
              <Form.Control 
                type="text" 
                value={paymentForm.transactionId}
                onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2}
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handlePaymentSubmit}>
            Process Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ReceptionDashboard;