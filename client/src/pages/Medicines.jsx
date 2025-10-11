import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Modal, Form, Alert } from 'react-bootstrap';
import { FaPills, FaPlus, FaEdit, FaEye, FaExclamationTriangle } from 'react-icons/fa';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import axios from 'axios';

const Medicines = () => {
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    price: '',
    stock: '',
    unit: 'tablet',
    category: 'other',
    description: '',
    manufacturer: '',
    minStockLevel: 10
  });

  const queryClient = useQueryClient();

  // Fetch medicines
  const { data: medicinesData, isLoading } = useQuery({
    queryKey: ['medicines', searchTerm],
    queryFn: async () => {
      const response = await axios.get(`/medicines?search=${searchTerm}`);
      return response.data.data;
    }
  });

  // Fetch low stock medicines
  const { data: lowStockData } = useQuery({
    queryKey: ['medicines', 'low-stock'],
    queryFn: async () => {
      const response = await axios.get('/medicines/low-stock');
      return response.data.data;
    }
  });

  // Create/Update medicine mutation
  const saveMedicineMutation = useMutation({
    mutationFn: async (medicineData) => {
      const response = selectedMedicine ? 
        await axios.put(`/medicines/${selectedMedicine._id}`, medicineData) :
        await axios.post('/medicines', medicineData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['medicines']);
      toast.success(`Medicine ${selectedMedicine ? 'updated' : 'created'} successfully`);
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save medicine');
    }
  });

  const getStockBadge = (stock, minLevel) => {
    if (stock <= minLevel) {
      return <Badge bg="danger">Low Stock</Badge>;
    } else if (stock <= minLevel * 2) {
      return <Badge bg="warning">Medium Stock</Badge>;
    } else {
      return <Badge bg="success">In Stock</Badge>;
    }
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      antibiotic: { variant: 'primary', text: 'Antibiotic' },
      painkiller: { variant: 'warning', text: 'Painkiller' },
      vitamin: { variant: 'info', text: 'Vitamin' },
      antacid: { variant: 'secondary', text: 'Antacid' },
      cough_syrup: { variant: 'success', text: 'Cough Syrup' },
      other: { variant: 'dark', text: 'Other' }
    };
    const config = categoryConfig[category] || { variant: 'secondary', text: category };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const openModal = (medicine = null, type = 'view') => {
    setSelectedMedicine(medicine);
    setModalType(type);
    if (medicine) {
      setFormData({
        name: medicine.name,
        genericName: medicine.genericName || '',
        price: medicine.price,
        stock: medicine.stock,
        unit: medicine.unit,
        category: medicine.category,
        description: medicine.description || '',
        manufacturer: medicine.manufacturer || '',
        minStockLevel: medicine.minStockLevel
      });
    } else {
      setFormData({
        name: '',
        genericName: '',
        price: '',
        stock: '',
        unit: 'tablet',
        category: 'other',
        description: '',
        manufacturer: '',
        minStockLevel: 10
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      price: '',
      stock: '',
      unit: 'tablet',
      category: 'other',
      description: '',
      manufacturer: '',
      minStockLevel: 10
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMedicineMutation.mutate(formData);
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
          <h2 className="fw-bold text-primary">Medicines</h2>
          <p className="text-muted">Manage medicine inventory and stock</p>
        </div>
        <Button variant="primary" onClick={() => openModal(null, 'create')}>
          <FaPlus className="me-2" />
          Add Medicine
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockData?.medicines?.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <FaExclamationTriangle className="me-2" />
          <strong>Low Stock Alert:</strong> {lowStockData.medicines.length} medicines are running low on stock.
        </Alert>
      )}

      {/* Search */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Medicines</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by name or generic name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Medicines Table */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">Medicine Inventory</h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Generic Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicinesData?.medicines?.map((medicine) => (
                  <tr key={medicine._id}>
                    <td>
                      <div>
                        <strong>{medicine.name}</strong>
                        {medicine.manufacturer && (
                          <br />
                          <small className="text-muted">{medicine.manufacturer}</small>
                        )}
                      </div>
                    </td>
                    <td>{medicine.genericName || '-'}</td>
                    <td>{getCategoryBadge(medicine.category)}</td>
                    <td>${medicine.price}</td>
                    <td>{medicine.stock}</td>
                    <td>
                      <Badge bg="secondary">{medicine.unit}</Badge>
                    </td>
                    <td>{getStockBadge(medicine.stock, medicine.minStockLevel)}</td>
                    <td>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => openModal(medicine, 'view')}
                        className="me-2"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openModal(medicine, 'edit')}
                      >
                        <FaEdit />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Medicine Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaPills className="me-2" />
            {modalType === 'view' && 'Medicine Details'}
            {modalType === 'create' && 'Add New Medicine'}
            {modalType === 'edit' && 'Edit Medicine'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Medicine Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={modalType === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Generic Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    disabled={modalType === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Price *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    disabled={modalType === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    disabled={modalType === 'view'}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit</Form.Label>
                  <Form.Select
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={modalType === 'view'}
                  >
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                    <option value="injection">Injection</option>
                    <option value="cream">Cream</option>
                    <option value="drops">Drops</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={modalType === 'view'}
                  >
                    <option value="antibiotic">Antibiotic</option>
                    <option value="painkiller">Painkiller</option>
                    <option value="vitamin">Vitamin</option>
                    <option value="antacid">Antacid</option>
                    <option value="cough_syrup">Cough Syrup</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Manufacturer</Form.Label>
                  <Form.Control
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    disabled={modalType === 'view'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={modalType === 'view'}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
            {modalType !== 'view' && (
              <Button
                variant="primary"
                type="submit"
                disabled={saveMedicineMutation.isPending}
              >
                {saveMedicineMutation.isPending ? 'Saving...' : 'Save Medicine'}
              </Button>
            )}
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Medicines;

