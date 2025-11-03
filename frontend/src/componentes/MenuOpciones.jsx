import React from 'react';
import estilos from './MenuOpciones.module.css';

const MenuOpciones = ({ onEditar, onEliminar }) => {
  return (
    <div className={estilos.menuContenedor}>
      <button onClick={onEditar} className={estilos.opcionMenu}>
        Editar
      </button>
      <button onClick={onEliminar} className={estilos.opcionMenu}>
        Eliminar
      </button>
    </div>
  );
};

export default MenuOpciones;