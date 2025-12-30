import React from 'react';
import estilos from './Modal.module.css';

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = true,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className={estilos.overlay}>
      <div className={estilos.modal}>
        <div className={estilos.header}>
          <h3>{title}</h3>
          <button onClick={onClose} className={estilos.closeButton}>&times;</button>
        </div>
        <div className={estilos.content}>
          {children ? children : <p>{message}</p>}
        </div>
        {!children && (
          <div className={estilos.actions}>
            {showCancel && (
              <button onClick={onClose} className={estilos.cancelButton}>{cancelText}</button>
            )}
            <button onClick={onConfirm} className={estilos.confirmButton}>{confirmText}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;