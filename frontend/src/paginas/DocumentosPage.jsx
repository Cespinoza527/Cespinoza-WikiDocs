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

      // Hacemos dos peticiones al mismo tiempo
      const { data: dataDocs } = await axios.get(`http://localhost:3001/api/documentos/por-modulo/${moduloId}`, config);
      // (Necesitamos crear esta ruta para obtener la info de un solo módulo)
      // Por ahora, pondremos un texto temporal
      
      setDocumentos(dataDocs);
      setModuloInfo({ nombre: 'Módulo de Manuales', descripcion: 'Módulo de información de manuales.' }); // Info temporal
      setCargando(false);

    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos');
      setCargando(false);
    }
  }, [moduloId, userInfo]);

  useEffect(() => {
    obtenerDatos();
  }, [obtenerDatos]); // Usamos la nueva función

  if (cargando) return <p>Cargando documentos...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    // 4. Aplicamos las nuevas clases de CSS
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
                📄 {/* Icono de archivo temporal */}
              </div>
              <div className={estilos.infoDocumento}>
                <h4>{doc.titulo}</h4>
                <p>Tipo: {doc.tipoArchivo}</p>
                {/* Puedes añadir la fecha de creación si la tienes */}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
  };

export default DocumentosPage;