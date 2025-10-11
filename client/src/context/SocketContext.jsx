import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinRole = (role) => {
    if (socket) {
      socket.emit('join-role', role);
    }
  };

  const emitVisitStatusUpdate = (data) => {
    if (socket) {
      socket.emit('visit-status-update', data);
    }
  };

  const emitLabTestCompleted = (data) => {
    if (socket) {
      socket.emit('lab-test-completed', data);
    }
  };

  const emitPrescriptionCreated = (data) => {
    if (socket) {
      socket.emit('prescription-created', data);
    }
  };

  const emitPaymentConfirmed = (data) => {
    if (socket) {
      socket.emit('payment-confirmed', data);
    }
  };

  const value = {
    socket,
    connected,
    joinRole,
    emitVisitStatusUpdate,
    emitLabTestCompleted,
    emitPrescriptionCreated,
    emitPaymentConfirmed
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

