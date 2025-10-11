import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FaPills, FaCheck, FaEye, FaEdit, FaBox, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { prescriptionService } from '../services/prescriptionService';
import { medicineService } from '../services/medicineService';

const PharmacyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Data states
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [dispensedPrescriptions, setDispensedPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({
    pendingPrescriptions: 0,
    dispensedToday: 0,
    totalMedicines: 0,
    lowStockMedicines: 0
  });

  // Form states
  const [dispenseForm, setDispenseForm] = useState({
    medicines: [],
    notes: '',
    dispensedBy: '',
    dispensedAt: new Date().toISOString().slice(0, 16)
  });

  const [inventoryForm, setInventoryForm] = useState({
    medicineId: '',
    operation: 'set',
    stock: '',
    notes: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load pending prescriptions
      const pendingResult = await prescriptionService.getPendingPrescriptions();
      if (pendingResult.success) {
        setPendingPrescriptions(pendingResult.data);
      }

      // Load all prescriptions
      const prescriptionsResult = await prescriptionService.getPrescriptions();
      if (prescriptionsResult.success) {
        setDispensedPrescriptions(prescriptionsResult.data.prescriptions.filter(p => p.pharmacyStatus === 'dispensed'));
      }

      // Load medicines
      const medicinesResult = await medicineService.getMedicines();
      if (medicinesResult.success) {
        setMedicines(medicinesResult.data.medicines);
      }

      // Load stats
      const statsResult = await prescriptionService.getPharmacyStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDispensePrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setDispenseForm({
      medicines: prescription.medicines.map(med => ({
        ...med,
        dispensed: true,
        quantity: 1,
        notes: ''
      })),
      notes: '',
      dispensedBy: '',
      dispensedAt: new Date().toISOString().slice(0, 16)
    });
    setShowDispenseModal(true);
  };

  const handleDispenseSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await prescriptionService.dispensePrescription(selectedPrescription._id, dispenseForm);
      if (result.success) {
        toast.success('Prescription dispensed successfully!');
        setShowDispenseModal(false);
        setSelectedPrescription(null);
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to dispense prescription');
    }
  };

  const handlePartialDispense = async (prescriptionId) => {
    try {
      const result = await prescriptionService.partialDispensePrescription(prescriptionId);
      if (result.success) {
        toast.success('Prescription marked as partially dispensed!');
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update prescription status');
    }
  };

  const handleInventoryUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await medicineService.updateMedicineStock(
        inventoryForm.medicineId, 
        inventoryForm.stock, 
        inventoryForm.operation
      );
      if (result.success) {
        toast.success('Medicine stock updated successfully!');
        setShowInventoryModal(false);
        setInventoryForm({
          medicineId: '',
          operation: 'set',
          stock: '',
          notes: ''
        });
        loadDashboardData();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update medicine stock');
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...dispenseForm.medicines];
    newMedicines[index][field] = value;
    setDispenseForm({...dispenseForm, medicines: newMedicines});
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      dispensed: 'success',
      partial: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getStockBadge = (stock) => {
    if (stock <= 5) return <Badge bg="danger">Low Stock</Badge>;
    if (stock <= 20) return <Badge bg="warning">Medium Stock</Badge>;
    return <Badge bg="success">In Stock</Badge>;
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
          <h2 className="fw-bold text-dark">Pharmacy Dashboard</h2>
          <p className="text-muted">Manage prescriptions and medicine inventory</p>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaPills size={32} className="text-warning mb-2" />
              <h4 className="fw-bold">{stats.pendingPrescriptions}</h4>
              <small className="text-muted">Pending Prescriptions</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaCheck size={32} className="text-success mb-2" />
              <h4 className="fw-bold">{stats.dispensedToday}</h4>
              <small className="text-muted">Dispensed Today</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaBox size={32} className="text-info mb-2" />
              <h4 className="fw-bold">{stats.totalMedicines}</h4>
              <small className="text-muted">Total Medicines</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FaExclamationTriangle size={32} className="text-danger mb-2" />
              <h4 className="fw-bold">{stats.lowStockMedicines}</h4>
              <small className="text-muted">Low Stock Items</small>
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
                <Col md={6}>
                  <Button 
                    variant="primary" 
                    className="w-100 mb-2"
                    onClick={() => setShowInventoryModal(true)}
                  >
                    <FaBox className="me-2" />
                    Update Medicine Stock
                  </Button>
                </Col>
                <Col md={6}>
                  <Button 
                    variant="info" 
                    className="w-100 mb-2"
                    onClick={() => navigate('/prescriptions')}
                  >
                    <FaSearch className="me-2" />
                    View All Prescriptions
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Prescriptions */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Pending Prescriptions</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Medicines</th>
                    <th>Prescribed Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPrescriptions.map(prescription => (
                    <tr key={prescription._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{prescription.visit?.patient?.firstName} {prescription.visit?.patient?.lastName}</div>
                          <small className="text-muted">Age: {prescription.visit?.patient?.age}</small>
                        </div>
                      </td>
                      <td>
                        <div>{prescription.mainDoctor?.fullName}</div>
                        <small className="text-muted">{prescription.mainDoctor?.role}</small>
                      </td>
                      <td>
                        <Badge bg="info">{prescription.medicines?.length || 0} medicines</Badge>
                        <div className="mt-1">
                          {prescription.medicines?.slice(0, 2).map((med, index) => (
                            <small key={index} className="d-block text-muted">
                              {med.name} - {med.dosage}
                            </small>
                          ))}
                          {prescription.medicines?.length > 2 && (
                            <small className="text-muted">+{prescription.medicines.length - 2} more</small>
                          )}
                        </div>
                      </td>
                      <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(prescription.pharmacyStatus)}</td>
                      <td>
                        <Button 
                          variant="success" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handleDispensePrescription(prescription)}
                        >
                          <FaCheck className="me-1" />
                          Dispense
                        </Button>
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-1"
                          onClick={() => handlePartialDispense(prescription._id)}
                        >
                          Partial
                        </Button>
                        <Button variant="outline-primary" size="sm">
                          <FaEye />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {pendingPrescriptions.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No pending prescriptions
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Medicine Inventory */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Medicine Inventory</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Medicine Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {medicines.slice(0, 10).map(medicine => (
                    <tr key={medicine._id}>
                      <td>
                        <div className="fw-medium">{medicine.name}</div>
                        <small className="text-muted">ID: {medicine._id.slice(-6)}</small>
                      </td>
                      <td>${medicine.price}</td>
                      <td>{medicine.stock}</td>
                      <td>{getStockBadge(medicine.stock)}</td>
                      <td>{medicine.description?.substring(0, 50)}...</td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-1">
                          <FaEdit />
                        </Button>
                        <Button variant="outline-secondary" size="sm">
                          <FaEye />
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

      {/* Recent Dispensed Prescriptions */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0 fw-semibold">Recent Dispensed Prescriptions</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Patient</th>
                    <th>Medicines</th>
                    <th>Dispensed Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dispensedPrescriptions.slice(0, 10).map(prescription => (
                    <tr key={prescription._id}>
                      <td>
                        <div>
                          <div className="fw-medium">{prescription.visit?.patient?.firstName} {prescription.visit?.patient?.lastName}</div>
                          <small className="text-muted">Age: {prescription.visit?.patient?.age}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="success">{prescription.medicines?.length || 0} medicines</Badge>
                      </td>
                      <td>{new Date(prescription.dispensedAt || prescription.createdAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(prescription.pharmacyStatus)}</td>
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
              {dispensedPrescriptions.length === 0 && (
                <div className="text-center py-4 text-muted">
                  No dispensed prescriptions yet
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Dispense Prescription Modal */}
      <Modal show={showDispenseModal} onHide={() => setShowDispenseModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Dispense Prescription - {selectedPrescription?.visit?.patient?.firstName} {selectedPrescription?.visit?.patient?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleDispenseSubmit}>
            {/* Patient Info */}
            <Row className="mb-4">
              <Col>
                <Card className="bg-light">
                  <Card.Body>
                    <h6>Patient Information</h6>
                    <Row>
                      <Col md={6}>
                        <strong>Name:</strong> {selectedPrescription?.visit?.patient?.firstName} {selectedPrescription?.visit?.patient?.lastName}
                      </Col>
                      <Col md={6}>
                        <strong>Age:</strong> {selectedPrescription?.visit?.patient?.age}
                      </Col>
                    </Row>
                    <Row className="mt-2">
                      <Col>
                        <strong>Diagnosis:</strong> {selectedPrescription?.diagnosis}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Medicines */}
            <Row className="mb-3">
              <Col>
                <h6>Medicines to Dispense</h6>
                {dispenseForm.medicines.map((medicine, index) => (
                  <Card key={index} className="mb-3">
                    <Card.Body>
                      <Row>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Medicine</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.name}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label>Dosage</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.dosage}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.duration}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={2}>
                          <Form.Group>
                            <Form.Label>Quantity</Form.Label>
                            <Form.Control
                              type="number"
                              value={medicine.quantity}
                              onChange={(e) => handleMedicineChange(index, 'quantity', e.target.value)}
                              min="1"
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={3}>
                          <Form.Group>
                            <Form.Label>Dispense Notes</Form.Label>
                            <Form.Control
                              type="text"
                              value={medicine.notes}
                              onChange={(e) => handleMedicineChange(index, 'notes', e.target.value)}
                              placeholder="Any special instructions..."
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Row className="mt-2">
                        <Col>
                          <Form.Check
                            type="checkbox"
                            label="Dispensed"
                            checked={medicine.dispensed}
                            onChange={(e) => handleMedicineChange(index, 'dispensed', e.target.checked)}
                          />
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </Col>
            </Row>

            {/* Dispense Info */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dispensed By *</Form.Label>
                  <Form.Control
                    type="text"
                    value={dispenseForm.dispensedBy}
                    onChange={(e) => setDispenseForm({...dispenseForm, dispensedBy: e.target.value})}
                    placeholder="Pharmacist name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Dispensed Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={dispenseForm.dispensedAt}
                    onChange={(e) => setDispenseForm({...dispenseForm, dispensedAt: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Notes */}
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Dispensing Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={dispenseForm.notes}
                    onChange={(e) => setDispenseForm({...dispenseForm, notes: e.target.value})}
                    placeholder="Any additional notes or instructions..."
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDispenseModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleDispenseSubmit}>
            Dispense Prescription
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Inventory Update Modal */}
      <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Medicine Stock</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleInventoryUpdate}>
            <Form.Group className="mb-3">
              <Form.Label>Select Medicine *</Form.Label>
              <Form.Select
                value={inventoryForm.medicineId}
                onChange={(e) => setInventoryForm({...inventoryForm, medicineId: e.target.value})}
                required
              >
                <option value="">Choose Medicine</option>
                {medicines.map(medicine => (
                  <option key={medicine._id} value={medicine._id}>
                    {medicine.name} (Current Stock: {medicine.stock})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Operation *</Form.Label>
              <Form.Select
                value={inventoryForm.operation}
                onChange={(e) => setInventoryForm({...inventoryForm, operation: e.target.value})}
                required
              >
                <option value="set">Set Stock To</option>
                <option value="add">Add To Stock</option>
                <option value="subtract">Subtract From Stock</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Stock Amount *</Form.Label>
              <Form.Control
                type="number"
                value={inventoryForm.stock}
                onChange={(e) => setInventoryForm({...inventoryForm, stock: e.target.value})}
                placeholder="Enter stock amount"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={inventoryForm.notes}
                onChange={(e) => setInventoryForm({...inventoryForm, notes: e.target.value})}
                placeholder="Reason for stock update..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInventoryModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInventoryUpdate}>
            Update Stock
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PharmacyDashboard;