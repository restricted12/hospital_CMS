import { Container, Row, Col, Card } from 'react-bootstrap'
import { 
  FaUsers, 
  FaUserMd, 
  FaFlask, 
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt
} from 'react-icons/fa'

const Dashboard = () => {
  const stats = [
    {
      title: 'Total Patients',
      value: '1,234',
      icon: FaUsers,
      color: 'primary',
      change: '+12%'
    },
    {
      title: 'Active Doctors',
      value: '45',
      icon: FaUserMd,
      color: 'success',
      change: '+5%'
    },
    {
      title: 'Lab Tests Today',
      value: '89',
      icon: FaFlask,
      color: 'info',
      change: '+8%'
    },
    {
      title: 'Revenue This Month',
      value: '$45,678',
      icon: FaMoneyBillWave,
      color: 'warning',
      change: '+15%'
    }
  ]

  const recentActivities = [
    { id: 1, action: 'New patient registered', time: '2 hours ago', type: 'success' },
    { id: 2, action: 'Lab test completed', time: '3 hours ago', type: 'info' },
    { id: 3, action: 'Payment received', time: '4 hours ago', type: 'warning' },
    { id: 4, action: 'Prescription issued', time: '5 hours ago', type: 'primary' },
  ]

  return (
    <Container fluid>
      <div className="hospital-header rounded mb-4">
        <Container>
          <h1 className="mb-0">Dashboard</h1>
          <p className="mb-0">Welcome to Hospital Management System</p>
        </Container>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        {stats.map((stat, index) => (
          <Col md={3} key={index} className="mb-3">
            <Card className="stats-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="stats-label mb-1">{stat.title}</p>
                    <h3 className="stats-number mb-0">{stat.value}</h3>
                    <small className="text-success">{stat.change} from last month</small>
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 p-3 rounded`}>
                    <stat.icon size={24} className={`text-${stat.color}`} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        {/* Recent Activities */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaCalendarAlt className="me-2" />
              <h5 className="mb-0">Recent Activities</h5>
            </Card.Header>
            <Card.Body>
              {recentActivities.map((activity) => (
                <div key={activity.id} className="d-flex align-items-center py-2 border-bottom">
                  <div className={`bg-${activity.type} bg-opacity-10 rounded-circle p-2 me-3`}>
                    <div className={`bg-${activity.type} rounded-circle`} style={{ width: '8px', height: '8px' }}></div>
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-medium">{activity.action}</p>
                    <small className="text-muted">{activity.time}</small>
                  </div>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col md={6} className="mb-4">
          <Card>
            <Card.Header className="d-flex align-items-center">
              <FaChartLine className="me-2" />
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} className="mb-3">
                  <button className="btn btn-outline-primary w-100 py-3">
                    <FaUsers className="mb-2" />
                    <br />
                    Add Patient
                  </button>
                </Col>
                <Col md={6} className="mb-3">
                  <button className="btn btn-outline-success w-100 py-3">
                    <FaUserMd className="mb-2" />
                    <br />
                    Add Doctor
                  </button>
                </Col>
                <Col md={6} className="mb-3">
                  <button className="btn btn-outline-info w-100 py-3">
                    <FaFlask className="mb-2" />
                    <br />
                    Lab Test
                  </button>
                </Col>
                <Col md={6} className="mb-3">
                  <button className="btn btn-outline-warning w-100 py-3">
                    <FaMoneyBillWave className="mb-2" />
                    <br />
                    Payment
                  </button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Dashboard