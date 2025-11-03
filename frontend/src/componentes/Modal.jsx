import React from 'react';
import estilos from './Modal.module.css';

const Modal = ({ mostrar, onClose, titulo, children }) => {
  if (!mostrar) {
    return null; 
  }

  return (
    <div className={estilos.modalOverlay}>
      <div className={estilos.modalContenido}>
        <div className={estilos.modalHeader}>
          <h3 className={estilos.modalTitulo}>{titulo}</h3>
          <button onClick={onClose} className={estilos.botonCerrar}>&times;</button>
        </div>
        <div className={estilos.modalBody}>
          {children} {}
        </div>
      </div>
    </div>
  );
};

export default Modal;