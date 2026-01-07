import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import estilos from './DocumentosPage.module.css';
import Modal from '../componentes/Modal';
import API_URL from '../api/config';

const DocumentosPage = () => {
  const { moduloId } = useParams();

  const [documentos, setDocumentos] = useState([]);
  const [moduloInfo, setModuloInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Estado para el modal de eliminación
  const [mostrarModal, setMostrarModal] = useState(false);
  const [documentoAEliminar, setDocumentoAEliminar] = useState(null);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const obtenerDatos = useCallback(async () => {
    if (!userInfo) {
      setError('Debes iniciar sesión');
      setCargando(false);
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data: dataDocs } = await axios.get(`${API_URL}/api/documentos/por-modulo/${moduloId}`, config);
      setDocumentos(dataDocs);
      setModuloInfo({ nombre: 'Módulo de Manuales', descripcion: 'Módulo de información de manuales.' });
      setCargando(false);

    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos');
      setCargando(false);
    }
  }, [moduloId, userInfo]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]);

  const handleEliminar = (e, id) => {
    e.preventDefault();
    setDocumentoAEliminar(id);
    setMostrarModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!documentoAEliminar) return;

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.delete(`${API_URL}/api/documentos/${documentoAEliminar}`, config);

      // Actualizar la lista
      setDocumentos(documentos.filter(doc => doc._id !== documentoAEliminar));

      setMostrarModal(false);
      setDocumentoAEliminar(null);
      // Opcional: Mostrar un toast o notificación de éxito menos intrusiva
    } catch (error) {
      console.error(error);
      alert('Error al eliminar el documento');
      setMostrarModal(false);
    }
  };

  const cancelarEliminacion = () => {
    setMostrarModal(false);
    setDocumentoAEliminar(null);
  };

  const formatearTipoArchivo = (tipo) => {
    if (tipo === 'application/pdf') return 'PDF';
    if (tipo === 'text/plain') return 'TXT';
    if (tipo.startsWith('image/')) return 'Imagen';
    return 'Archivo';
  };

  if (cargando) return <p>Cargando documentos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={estilos.contenedorPrincipal}>
      <div className={estilos.headerModulo}>
        <p><Link to="/modulos">Módulos</Link> / {moduloInfo?.nombre}</p>
        <h2>{moduloInfo?.nombre}</h2>
        <p>{moduloInfo?.descripcion}</p>
      </div>

      <h3>Archivos de Documentación</h3>

      <div className={estilos.listaDocumentos}>
        {documentos.length === 0 ? (
          <p>Este módulo no tiene documentos todavía.</p>
        ) : (
          documentos.map((doc) => (
            <Link to={`/documentos/${doc._id}`} key={doc._id} className={estilos.itemDocumento}>
              <div className={estilos.iconoArchivo}>
                📄
              </div>
              <div className={estilos.infoDocumento}>
                <h4>{doc.titulo}</h4>
                <p>Tipo: {formatearTipoArchivo(doc.tipoArchivo)}</p>
              </div>
              <button
                onClick={(e) => handleEliminar(e, doc._id)}
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem'
                }}
                title="Eliminar documento"
              >
                🗑️
              </button>
            </Link>
          ))
        )}
      </div>

      <Modal
        isOpen={mostrarModal}
        onClose={cancelarEliminacion}
        onConfirm={confirmarEliminacion}
        title="Eliminar Documento"
        message="¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer."
        confirmText="Eliminar"
      />
    </div>
  );
};

export default DocumentosPage;