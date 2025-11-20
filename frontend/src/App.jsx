import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './paginas/LoginPage';
import ModulosPage from './paginas/ModulosPage';
import DocumentosPage from './paginas/DocumentosPage';
import DiseñoPrincipal from './componentes/DiseñoPrincipal';
import CarguePagina from './paginas/CarguePagina';
import VisualizacionDocumentoPage from './paginas/VisualizacionDocumentoPage';

const RutaProtegida = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RutaProtegida>
              <DiseñoPrincipal />
            </RutaProtegida>
          }
        >
          <Route index element={<Navigate to="modulos" />} /> 
          <Route path="modulos" element={<ModulosPage />} />
          <Route path="modulos/:moduloId" element={<DocumentosPage />} />
          <Route path="cargue" element={<CarguePagina />} />
          <Route path="configuracion" element={<div>Página de Configuración</div>} />
        </Route>

        <Route
          path="/documentos/:documentoId"
          element={
            <RutaProtegida>
              <VisualizacionDocumentoPage />
            </RutaProtegida>
          }
        />       
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;