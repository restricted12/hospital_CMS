import { Spinner } from 'react-bootstrap'

const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
  const getSizeClass = (size) => {
    switch (size) {
      case 'sm': return 'spinner-border-sm'
      case 'lg': return 'spinner-border-lg'
      default: return ''
    }
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <Spinner 
        animation="border" 
        variant="primary" 
        className={getSizeClass(size)}
        role="status"
      >
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && (
        <div className="mt-3 text-muted">
          <small>{message}</small>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
