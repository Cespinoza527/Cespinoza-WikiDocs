import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import estilos from './DiseñoPrincipal.module.css';

const DiseñoPrincipal = () => {
  return (
    <div className={estilos.layoutContenedor}>
      <nav className={estilos.menuLateral}>
        <div className={estilos.logo}>
          WikiDocs
        </div>
        <ul>
          <li>
            <Link to="/modulos">Módulos</Link>
          </li>
          <li>
            <Link to="/cargue">Cargue de Documentación</Link>
          </li>
          <li>
            <Link to="/configuracion">Configuración/Historial</Link>
          </li>
        </ul>
      </nav>

      <main className={estilos.contenidoPrincipal}>
        <Outlet /> { }
      </main>
    </div>
  );
};

export default DiseñoPrincipal;