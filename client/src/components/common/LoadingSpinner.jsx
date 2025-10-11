import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  };

  return (
    <div className="loading-spinner">
      <div className={`spinner-border spinner-border-custom ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">{text}</span>
      </div>
      {text && (
        <div className="mt-3">
          <p className="text-muted">{text}</p>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;

