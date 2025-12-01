import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorTema } from './context/ContextoTema';

import LoginPage from './paginas/LoginPage';
import RegisterPage from './paginas/RegisterPage';
import ModulosPage from './paginas/ModulosPage';
import DocumentosPage from './paginas/DocumentosPage';
import DiseñoPrincipal from './componentes/DiseñoPrincipal';
import CarguePagina from './paginas/CarguePagina';
import VisualizacionDocumentoPage from './paginas/VisualizacionDocumentoPage';
import ConfiguracionPage from './paginas/ConfiguracionPage';

const RutaProtegida = ({ children }) => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ProveedorTema>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
            <Route path="configuracion" element={<ConfiguracionPage />} />
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
    </ProveedorTema>
  );
}

export default App;