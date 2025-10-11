import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEye, FaEdit, FaCalendarPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { visitService } from '../services/visitService';
import { patientService } from '../services/patientService';

const Visits = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [visits, setVisits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    patient: '',
    complaint: '',
    visitDate: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    loadVisits();
    loadPatients();
  }, [currentPage, searchTerm, statusFilter]);

  const loadVisits = async () => {
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

      const result = await visitService.getVisits(params);
      
      if (result.success) {
        setVisits(result.data.visits);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to load visits');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await patientService.getPatients({ limit: 100 });
      if (result.success) {
        setPatients(result.data.patients);
      }
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (selectedVisit) {
        result = await visitService.updateVisit(selectedVisit._id, formData);
      } else {
        result = await visitService.createVisit(formData);
      }

      if (result.success) {
        toast.success(selectedVisit ? 'Visit updated successfully!' : 'Visit created successfully!');
        setShowModal(false);
        setSelectedVisit(null);
        resetForm();
        loadVisits();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to save visit');
    }
  };

  const handleEdit = (visit) => {
    setSelectedVisit(visit);
    setFormData({
      patient: visit.patient._id,
      complaint: visit.complaint,
      visitDate: new Date(visit.visitDate).toISOString().slice(0, 16)
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      patient: '',
      complaint: '',
      visitDate: new Date().toISOString().slice(0, 16)
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedVisit(null);
    resetForm();
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

  if (loading && visits.length === 0) {
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
          <h2 className="fw-bold text-dark">Visit Management</h2>
          <p className="text-muted">Manage patient visits and appointments</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaCalendarPlus className="me-2" />
            New Visit
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
              placeholder="Search visits..."
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
            <option value="registered">Registered</option>
            <option value="checked">Checked</option>
            <option value="lab_pending">Lab Pending</option>
            <option value="lab_done">Lab Done</option>
            <option value="diagnosed">Diagnosed</option>
            <option value="done">Done</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Visits Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Visit ID</th>
                <th>Patient</th>
                <th>Visit Date</th>
                <th>Complaint</th>
                <th>Status</th>
                <th>Doctor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visits.map(visit => (
                <tr key={visit._id}>
                  <td>
                    <Badge bg="primary">#{visit._id.slice(-6)}</Badge>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{visit.patient?.firstName} {visit.patient?.lastName}</div>
                      <small className="text-muted">Age: {visit.patient?.age}</small>
                    </div>
                  </td>
                  <td>{new Date(visit.visitDate).toLocaleDateString()}</td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                      {visit.complaint}
                    </div>
                  </td>
                  <td>{getStatusBadge(visit.status)}</td>
                  <td>
                    <div>
                      <div>{visit.checkerDoctor?.fullName || 'Not Assigned'}</div>
                      <small className="text-muted">{visit.checkerDoctor?.role}</small>
                    </div>
                  </td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      <FaEye />
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleEdit(visit)}
                    >
                      <FaEdit />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {visits.length === 0 && !loading && (
            <div className="text-center py-4 text-muted">
              No visits found
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

      {/* Visit Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedVisit ? 'Edit Visit' : 'Create New Visit'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Patient *</Form.Label>
              <Form.Select
                value={formData.patient}
                onChange={(e) => setFormData({...formData, patient: e.target.value})}
                required
              >
                <option value="">Choose Patient</option>
                {patients.map(patient => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} (Age: {patient.age})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Visit Date & Time *</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.visitDate}
                onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Complaint *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.complaint}
                onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                placeholder="Describe the patient's complaint..."
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedVisit ? 'Update Visit' : 'Create Visit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Visits;