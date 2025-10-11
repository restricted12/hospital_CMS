import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPlus, FaEye, FaEdit, FaDollarSign, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { paymentService } from '../services/paymentService';
import { visitService } from '../services/visitService';

const Payments = () => {
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    visit: '',
    amount: '',
    paymentType: '',
    paymentMethod: 'cash',
    transactionId: '',
    notes: ''
  });

  useEffect(() => {
    loadPayments();
    loadVisits();
  }, [currentPage, searchTerm, statusFilter]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm
      };
      
      if (statusFilter !== 'all') {
        params.isPaid = statusFilter === 'paid';
      }

      const result = await paymentService.getPayments(params);
      
      if (result.success) {
        setPayments(result.data.payments);
        setTotalPages(result.data.totalPages);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const loadVisits = async () => {
    try {
      const result = await visitService.getVisits({ limit: 100 });
      if (result.success) {
        setVisits(result.data.visits);
      }
    } catch (error) {
      console.error('Failed to load visits:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let result;
      if (selectedPayment) {
        result = await paymentService.updatePayment(selectedPayment._id, formData);
      } else {
        result = await paymentService.createPayment(formData);
      }

      if (result.success) {
        toast.success(selectedPayment ? 'Payment updated successfully!' : 'Payment created successfully!');
        setShowModal(false);
        setSelectedPayment(null);
        resetForm();
        loadPayments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to save payment');
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      visit: payment.visit._id,
      amount: payment.amount,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      notes: payment.notes
    });
    setShowModal(true);
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      const result = await paymentService.confirmPayment(paymentId);
      if (result.success) {
        toast.success('Payment confirmed successfully!');
        loadPayments();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to confirm payment');
    }
  };

  const resetForm = () => {
    setFormData({
      visit: '',
      amount: '',
      paymentType: '',
      paymentMethod: 'cash',
      transactionId: '',
      notes: ''
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPayment(null);
    resetForm();
  };

  const getStatusBadge = (isPaid) => {
    return isPaid ? <Badge bg="success">Paid</Badge> : <Badge bg="warning">Pending</Badge>;
  };

  const getPaymentTypeBadge = (type) => {
    const variants = {
      consultation: 'primary',
      lab: 'info',
      medicine: 'success',
      other: 'secondary'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  if (loading && payments.length === 0) {
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
          <h2 className="fw-bold text-dark">Payment Management</h2>
          <p className="text-muted">Manage payments and transactions</p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <FaDollarSign className="me-2" />
            New Payment
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
              placeholder="Search payments..."
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
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Payments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Table responsive className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Payment ID</th>
                <th>Patient</th>
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
              {payments.map(payment => (
                <tr key={payment._id}>
                  <td>
                    <Badge bg="primary">#{payment._id.slice(-6)}</Badge>
                  </td>
                  <td>
                    <div>
                      <div className="fw-medium">{payment.visit?.patient?.firstName} {payment.visit?.patient?.lastName}</div>
                      <small className="text-muted">Age: {payment.visit?.patient?.age}</small>
                    </div>
                  </td>
                  <td>
                    <Badge bg="info">#{payment.visit?.visitNumber || payment.visit?._id.slice(-6)}</Badge>
                  </td>
                  <td>
                    <strong>${payment.amount}</strong>
                  </td>
                  <td>{getPaymentTypeBadge(payment.paymentType)}</td>
                  <td>
                    <Badge bg="secondary">{payment.paymentMethod}</Badge>
                  </td>
                  <td>{getStatusBadge(payment.isPaid)}</td>
                  <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm" className="me-1">
                      <FaEye />
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => handleEdit(payment)}
                    >
                      <FaEdit />
                    </Button>
                    {!payment.isPaid && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => handleConfirmPayment(payment._id)}
                      >
                        <FaCheck />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {payments.length === 0 && !loading && (
            <div className="text-center py-4 text-muted">
              No payments found
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

      {/* Payment Modal */}
      <Modal show={showModal} onHide={handleModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedPayment ? 'Edit Payment' : 'Create New Payment'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Select Visit *</Form.Label>
              <Form.Select
                value={formData.visit}
                onChange={(e) => setFormData({...formData, visit: e.target.value})}
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
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Amount *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Type *</Form.Label>
                  <Form.Select
                    value={formData.paymentType}
                    onChange={(e) => setFormData({...formData, paymentType: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="consultation">Consultation</option>
                    <option value="lab">Lab Test</option>
                    <option value="medicine">Medicine</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Payment Method *</Form.Label>
                  <Form.Select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="insurance">Insurance</option>
                    <option value="online">Online</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Transaction ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.transactionId}
                    onChange={(e) => setFormData({...formData, transactionId: e.target.value})}
                    placeholder="Optional transaction ID"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional notes..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedPayment ? 'Update Payment' : 'Create Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Payments;