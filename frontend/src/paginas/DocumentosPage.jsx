import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import estilos from './DocumentosPage.module.css';

const DocumentosPage = () => {
  const { moduloId } = useParams();

  const [documentos, setDocumentos] = useState([]);
  const [moduloInfo, setModuloInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
      const { data: dataDocs } = await axios.get(`http://localhost:3001/api/documentos/por-modulo/${moduloId}`, config);
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

  const handleEliminar = async (e, id) => {
    e.preventDefault(); // Evitar navegación del Link
    if (window.confirm('¿Estás seguro de que quieres eliminar este documento? Esta acción no se puede deshacer.')) {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        await axios.delete(`http://localhost:3001/api/documentos/${id}`, config);
        // Actualizar la lista
        setDocumentos(documentos.filter(doc => doc._id !== id));
        alert('Documento eliminado correctamente');
      } catch (error) {
        console.error(error);
        alert('Error al eliminar el documento');
      }
    }
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
                <p>Tipo: {doc.tipoArchivo}</p>
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
    </div>
  );
};

export default DocumentosPage;