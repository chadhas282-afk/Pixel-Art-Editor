import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 2500) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    