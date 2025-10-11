import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaFlask, FaEdit, FaCheck, FaFileAlt } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

const Labs = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    result: '',
    normalRange: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Fetch lab tests
  const { data: labData, isLoading } = useQuery({
    queryKey: ['labs'],
    queryFn: async () => {
      const response = await axios.get('/labs');
      return response.data.data;
    }
  });

  // Update lab test result mutation
  const updateResultMutation = useMutation({
    mutationFn: async ({ testId, data }) => {
      const response = await axios.put(`/labs/${testId}/result`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['labs']);
      toast.success('Lab test result updated successfully');
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update lab test');
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Pending' },
      in_progress: { variant: 'info', text: 'In Progress' },
      completed: { variant: 'success', text: 'Completed' }
    };
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const openModal = (test) => {
    setSelectedTest(test);
    setFormData({
      result: test.result || '',
      normalRange: test.normalRange || '',
      notes: test.notes || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTest(null);
    setFormData({ result: '', normalRange: '', notes: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateResultMutation.mutate({
      testId: selectedTest._id,
      data: formData
    });
  };

  if (isLoading) {
    return (
      <Container>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-primary">Lab Tests</h2>
          <p className="text-muted">Manage laboratory tests and results</p>
        </div>
      </div>

      {/* Lab Tests Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Laboratory Tests</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Test Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labData?.labTests?.map((test) => (
                  <tr key={test._id}>
                    <td>
                      <div>
                        <strong>{test.visit?.patient?.firstName} {test.visit?.patient?.lastName}</strong>
                        <br />
                        <small className="text-muted">{test.visit?.patient?.contact}</small>
                      </div>
                    </td>
                    <td>{test.testName}</td>
                    <td>
                      <Badge bg="secondary">{test.testType}</Badge>
                    </td>
                    <td>{getStatusBadge(test.status)}</td>
                    <td>${test.cost}</td>
                    <td>{new Date(test.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => openModal(test)}
                        className="me-2"
                      >
                        <FaEdit />
                      </Button>
                      {test.result && (
                        <Button variant="outline-success" size="sm">
                          <FaFileAlt />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Lab Test Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaFlask className="me-2" />
            Lab Test Result
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {selectedTest && (
              <div>
                <Row>
                  <Col md={6}>
                    <h6>Patient Information</h6>
                    <p><strong>Name:</strong> {selectedTest.visit?.patient?.firstName} {selectedTest.visit?.patient?.lastName}</p>
                    <p><strong>Age:</strong> {selectedTest.visit?.patient?.age}</p>
                    <p><strong>Contact:</strong> {selectedTest.visit?.patient?.contact}</p>
                  </Col>
                  <Col md={6}>
                    <h6>Test Information</h6>
                    <p><strong>Test:</strong> {selectedTest.testName}</p>
                    <p><strong>Type:</strong> {selectedTest.testType}</p>
                    <p><strong>Cost:</strong> ${selectedTest.cost}</p>
                  </Col>
                </Row>

                <hr />

                <Form.Group className="mb-3">
                  <Form.Label>Test Result *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="result"
                    value={formData.result}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    placeholder="Enter test results..."
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Normal Range</Form.Label>
                  <Form.Control
                    type="text"
                    name="normalRange"
                    value={formData.normalRange}
                    onChange={(e) => setFormData({ ...formData, normalRange: e.target.value })}
                    placeholder="Enter normal range values..."
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="success"
              type="submit"
              disabled={updateResultMutation.isPending}
            >
              <FaCheck className="me-2" />
              {updateResultMutation.isPending ? 'Saving...' : 'Save Result'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Labs;

