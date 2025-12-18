import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          pointerEvents: 'none'
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { id, message, type } = toast;
  
  const styles = {
    success: { bg: '#F0FDF4', border: '#BBF7D0', text: '#166534', icon: CheckCircle },
    error: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', icon: AlertCircle },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', icon: Info },
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        minWidth: '300px',
        pointerEvents: 'auto',
        maxWidth: '400px'
      }}
    >
      <Icon size={20} />
      <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: 500 }}>{message}</div>
      <button 
        onClick={() => onClose(id)}
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: style.text, opacity: 0.7 }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
