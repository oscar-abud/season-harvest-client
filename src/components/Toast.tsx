import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const icon = type === 'success' ? '✓' : '✕';

  return createPortal(
    <div className={`toast toast--${type}`} role="alert" aria-live="polite">
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar">✕</button>
    </div>,
    document.body
  );
}
