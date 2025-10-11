import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEye, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { patientService } from '../services/patientService';

const Patients = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    age: '',
    contact: { phone: '', email: '' },
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }
  });

  useEffect(() => {
    loadPatients();
  }, [currentPage, searchTerm]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const result = await patientService.getPatients({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (result.success) {
        setPatients(result.data.patients);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (selectedPatient) {
        result = await patientService.updatePatient(selectedPatient._id, formData);
      } else {
        result = await patientService.createPatient(formData);
      }

      if (result.success) {
        toast.success(selectedPatient ? 'Patient updated successfully!' : 'Patient created successfully!');
        setShowModal(false);
        setSelectedPatient(null);
        resetForm();
        loadPatients();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to save patient');
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.firstName,
      lastName: patient.lastName,
      gender: patient.gender,
      age: patient.age,
      contact: patient.contact,
      address: patient.address
    });
    setShowModal(true);
  };

  const handleDelete = async (patientId) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const result = await patientService.deletePatient(patientId);
        if (result.success) {
          toast.success('Patient deleted successfully!');
          loadPatients();
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error('Failed to delete patient');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      contact: { phone: '', email: '' },
      address: { street: '', city: '', state: '', zipCode: '', country: 'USA' }
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPatient(null);
    resetForm();
  };

  if (loading && patients.length === 0) {
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
          <h2 className="fw-bold text-dark">Patient Management</h2>
          <p className="text-muted">Manage patient records and information</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaUserPlus className="me-2" />
            Add Patient
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
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      {/* Patients Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient._id}>
                  <td>
                    <Badge bg="primary">#{patient._id.slice(-6)}</Badge>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{patient.firstName} {patient.lastName}</div>
                    </div>
                  </td>
                  <td>{patient.age}</td>
                  <td>
                    <Badge bg={patient.gender === 'male' ? 'info' : 'secondary'}>
                      {patient.gender}
                    </Badge>
                  </td>
                  <td>
                    <div>
                      <div>{patient.contact.phone}</div>
                      {patient.contact.email && (
                        <small className="text-muted">{patient.contact.email}</small>
                      )}
                    </div>
                  </td>
                  <td>{new Date(patient.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      <FaEye />
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleEdit(patient)}
                    >
                      <FaEdit />
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(patient._id)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {patients.length === 0 && !loading && (
            <div className="text-center py-4 text-muted">
              No patients found
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

      {/* Patient Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedPatient ? 'Edit Patient' : 'Add New Patient'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
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
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender *</Form.Label>
                  <Form.Select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
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
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: {...formData.contact, phone: e.target.value}
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
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: {...formData.contact, email: e.target.value}
                })}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: {...formData.address, street: e.target.value}
                })}
                placeholder="Street address"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedPatient ? 'Update Patient' : 'Add Patient'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Patients;