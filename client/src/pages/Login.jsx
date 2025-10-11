import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { FaHospital, FaUserMd, FaFlask, FaPills, FaUserShield, FaHospitalUser, FaStethoscope } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const result = await login(formData.email, formData.password)
      if (result.success) {
        toast.success(`Welcome, ${result.user.fullName}!`)
        navigate('/dashboard')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (role) => {
    const credentials = {
      admin: { email: 'admin@hospital.com', password: 'admin123' },
      reception: { email: 'reception@hospital.com', password: 'reception123' },
      checkerDoctor: { email: 'checker@hospital.com', password: 'checker123' },
      mainDoctor: { email: 'main@hospital.com', password: 'main123' },
      labTech: { email: 'lab@hospital.com', password: 'lab123' },
      pharmacy: { email: 'pharmacy@hospital.com', password: 'pharmacy123' }
    }
    
    const creds = credentials[role]
    if (creds) {
      setFormData(creds)
      toast.info(`Demo credentials loaded for ${role}`)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #f8f9fa 100%)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <FaHospital size={48} className="text-teal mb-3" />
                  <h2 className="fw-bold text-dark">Hospital CMS</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-medium">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      size="lg"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-medium">Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      size="lg"
                    />
                  </Form.Group>
                  
                  <Button
                    type="submit"
                    className="btn-teal w-100 py-2 fw-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>
                
                <div className="mt-4">
                  <p className="text-center text-muted mb-3">Quick Login (Demo)</p>
                  <Row>
                    {[
                      { value: 'reception', label: 'Reception', icon: FaHospitalUser, color: 'primary' },
                      { value: 'checkerDoctor', label: 'Checker Doctor', icon: FaStethoscope, color: 'info' },
                      { value: 'labTech', label: 'Lab Technician', icon: FaFlask, color: 'warning' },
                      { value: 'mainDoctor', label: 'Main Doctor', icon: FaUserMd, color: 'success' },
                      { value: 'pharmacy', label: 'Pharmacist', icon: FaPills, color: 'danger' },
                      { value: 'admin', label: 'Administrator', icon: FaUserShield, color: 'dark' }
                    ].map((role) => (
                      <Col xs={6} sm={4} key={role.value} className="mb-2">
                        <Button
                          variant={`outline-${role.color}`}
                          size="sm"
                          className="w-100"
                          onClick={() => quickLogin(role.value)}
                        >
                          <role.icon className="me-1" size={12} />
                          {role.label}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default Login