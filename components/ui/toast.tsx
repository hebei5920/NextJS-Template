'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function Toast({
  isOpen,
  onClose,
  title,
  description,
  type = 'success',
  duration = 3000
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
          titleColor: 'text-green-900 dark:text-green-100',
          descColor: 'text-green-700 dark:text-green-300',
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
          icon: <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
          titleColor: 'text-red-900 dark:text-red-100',
          descColor: 'text-red-700 dark:text-red-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
          titleColor: 'text-yellow-900 dark:text-yellow-100',
          descColor: 'text-yellow-700 dark:text-yellow-300',
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
          icon: <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          titleColor: 'text-blue-900 dark:text-blue-100',
          descColor: 'text-blue-700 dark:text-blue-300',
        };
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
          icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
          titleColor: 'text-green-900 dark:text-green-100',
          descColor: 'text-green-700 dark:text-green-300',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${styles.bg} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {styles.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-medium ${styles.titleColor}`}>
              {title}
            </h4>
            {description && (
              <p className={`text-sm mt-1 ${styles.descColor}`}>
                {description}
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
export function useToast() {
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>({
    isOpen: false,
    title: '',
  });

  const showToast = (options: {
    title: string;
    description?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }) => {
    setToast({
      isOpen: true,
      ...options,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  const ToastComponent = () => (
    <Toast
      isOpen={toast.isOpen}
      onClose={hideToast}
      title={toast.title}
      description={toast.description}
      type={toast.type}
      duration={toast.duration}
    />
  );

  return {
    showToast,
    hideToast,
    Toast: ToastComponent,
  };
} 