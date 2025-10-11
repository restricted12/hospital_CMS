import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEye, FaEdit, FaPills } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { prescriptionService } from '../services/prescriptionService';

const Prescriptions = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPrescriptions();
  }, [currentPage, searchTerm, statusFilter]);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const result = await prescriptionService.getPrescriptions(params);
      
      if (result.success) {
        setPrescriptions(result.data.prescriptions);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      dispensed: 'success',
      partial: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading && prescriptions.length === 0) {
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
          <h2 className="fw-bold text-dark">Prescription Management</h2>
          <p className="text-muted">View and manage prescriptions</p>
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
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="dispensed">Dispensed</option>
            <option value="partial">Partial</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Prescriptions Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Prescription ID</th>
                <th>Patient</th>
                <th>Doctor</th>
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
                    <Badge bg="primary">#{prescription._id.slice(-6)}</Badge>
                  </td>
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
                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                      {prescription.diagnosis}
                    </div>
                  </td>
                  <td>
                    <Badge bg="info">{prescription.medicines?.length || 0} medicines</Badge>
                  </td>
                  <td>{getStatusBadge(prescription.pharmacyStatus)}</td>
                  <td>{new Date(prescription.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleView(prescription)}
                    >
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
          {prescriptions.length === 0 && !loading && (
            <div className="text-center py-4 text-muted">
              No prescriptions found
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

      {/* Prescription Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Prescription Details - {selectedPrescription?.visit?.patient?.firstName} {selectedPrescription?.visit?.patient?.lastName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPrescription && (
            <div>
              {/* Patient Info */}
              <Row className="mb-4">
                <Col>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6>Patient Information</h6>
                      <Row>
                        <Col md={3}>
                          <strong>Name:</strong> {selectedPrescription.visit?.patient?.firstName} {selectedPrescription.visit?.patient?.lastName}
                        </Col>
                        <Col md={3}>
                          <strong>Age:</strong> {selectedPrescription.visit?.patient?.age}
                        </Col>
                        <Col md={3}>
                          <strong>Gender:</strong> {selectedPrescription.visit?.patient?.gender}
                        </Col>
                        <Col md={3}>
                          <strong>Phone:</strong> {selectedPrescription.visit?.patient?.contact?.phone}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Diagnosis */}
              <Row className="mb-3">
                <Col>
                  <h6>Diagnosis</h6>
                  <p>{selectedPrescription.diagnosis}</p>
                </Col>
              </Row>

              {/* Medicines */}
              <Row className="mb-3">
                <Col>
                  <h6>Prescribed Medicines</h6>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Medicine</th>
                        <th>Dosage</th>
                        <th>Duration</th>
                        <th>Instructions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPrescription.medicines?.map((medicine, index) => (
                        <tr key={index}>
                          <td>{medicine.name}</td>
                          <td>{medicine.dosage}</td>
                          <td>{medicine.duration}</td>
                          <td>{medicine.instruction}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              </Row>

              {/* Notes */}
              {selectedPrescription.notes && (
                <Row className="mb-3">
                  <Col>
                    <h6>Additional Notes</h6>
                    <p>{selectedPrescription.notes}</p>
                  </Col>
                </Row>
              )}

              {/* Follow-up */}
              {selectedPrescription.followUpRequired && (
                <Row className="mb-3">
                  <Col>
                    <h6>Follow-up Required</h6>
                    <p>Follow-up date: {selectedPrescription.followUpDate}</p>
                  </Col>
                </Row>
              )}

              {/* Prescription Info */}
              <Row className="mb-3">
                <Col>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6>Prescription Information</h6>
                      <Row>
                        <Col md={6}>
                          <strong>Prescribed By:</strong> {selectedPrescription.mainDoctor?.fullName}
                        </Col>
                        <Col md={6}>
                          <strong>Prescribed Date:</strong> {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                        </Col>
                      </Row>
                      <Row className="mt-2">
                        <Col md={6}>
                          <strong>Status:</strong> {getStatusBadge(selectedPrescription.pharmacyStatus)}
                        </Col>
                        <Col md={6}>
                          <strong>Total Medicines:</strong> {selectedPrescription.medicines?.length || 0}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Prescriptions;