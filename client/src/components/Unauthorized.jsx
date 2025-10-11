import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { FaExclamationTriangle } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center border-0 shadow">
            <Card.Body className="p-5">
              <FaExclamationTriangle size={64} className="text-warning mb-4" />
              <h2 className="mb-3">Access Denied</h2>
              <p className="text-muted mb-4">
                You don't have permission to access this page. Please contact your administrator.
              </p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/dashboard')}
                className="me-2"
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/login')}
              >
                Login Again
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Unauthorized
