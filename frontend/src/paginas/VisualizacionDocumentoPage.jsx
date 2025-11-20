// frontend/src/paginas/VisualizacionDocumentoPage.jsx
// --- VERSIÓN COMPLETA Y CORREGIDA (CON useMemo y useCallback) ---

// 1. Importamos las herramientas 'useCallback' y 'useMemo'
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import estilos from './VisualizacionDocumentoPage.module.css';

const VisualizacionDocumentoPage = () => {
  const { documentoId } = useParams();
  const [documento, setDocumento] = useState(null); 
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  
  const [contenidoTexto, setContenidoTexto] = useState('');
  const [pregunta, setPregunta] = useState('');

  const [cargandoIA, setCargandoIA] = useState(false);
  const [historialChat, setHistorialChat] = useState([
    { remitente: 'ia', texto: 'Hola, ¿qué te gustaría saber sobre este documento?' }
  ]);


  const userInfo = useMemo(() => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }, []); 


  const obtenerDatosDelDocumento = useCallback(async () => {
    if (!userInfo) {
      setError('Debes iniciar sesión');
      setCargando(false);
      return; 
    }
    try {
      setCargando(true); 
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      const { data: docInfo } = await axios.get(`http://localhost:3001/api/documentos/${documentoId}`, config);
      setDocumento(docInfo);

      if (docInfo.tipoArchivo === 'text/plain') {
        const { data: versionInfo } = await axios.get(`http://localhost:3001/api/versiones/latest/${documentoId}`, config);
        console.log('Última versión cargada:', versionInfo);
        setContenidoTexto(versionInfo.contenido);
      }
      
      setCargando(false);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el documento');
      setCargando(false);
    }
  }, [documentoId, userInfo]); 

  useEffect(() => {
    obtenerDatosDelDocumento();
  }, [obtenerDatosDelDocumento]); 

  const renderizarVisor = () => {
    if (!documento) return <p>Cargando...</p>;
    if (documento.rutaArchivo) {
      const urlArchivo = `http://localhost:3001/${documento.rutaArchivo}`;
      if (documento.tipoArchivo === 'application/pdf') {
        return ( <iframe src={urlArchivo} title={documento.titulo} width="100%" height="100%" style={{ border: 'none' }} /> );
      }
      if (documento.tipoArchivo.startsWith('image/')) {
        return ( <img src={urlArchivo} alt={documento.titulo} style={{ maxWidth: '100%' }} /> );
      }
    }
    if (documento.tipoArchivo === 'text/plain') {
      return (
        <textarea
          className={estilos.editorTxt}
          value={contenidoTexto}
          onChange={(e) => setContenidoTexto(e.target.value)}
        />
      );
    }
    return <p>Tipo de archivo no soportado.</p>;
  };
  
const manejarEnvioPregunta = async (e) => {
    e.preventDefault();
    if (!pregunta.trim() || cargandoIA) return; 

    const preguntaUsuario = pregunta;
    
    setHistorialChat(historialPrevio => [
      ...historialPrevio,
      { remitente: 'usuario', texto: preguntaUsuario }
    ]);
    setPregunta(''); 
    setCargandoIA(true); 

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.post(
        `http://localhost:3001/api/documentos/${documentoId}/ask`,
        { pregunta: preguntaUsuario }, // Enviamos la pregunta
        config
      );

      setHistorialChat(historialPrevio => [
        ...historialPrevio,
        { remitente: 'ia', texto: data.respuesta }
      ]);
      
    } catch (err) {
      console.error(err);
      setHistorialChat(historialPrevio => [
        ...historialPrevio,
        { remitente: 'ia', texto: 'Lo siento, ocurrió un error al procesar tu pregunta.' }
      ]);
    } finally {
      setCargandoIA(false); // Dejamos de cargar
    }
  };

  // El JSX del return se queda exactamente igual
  return (
    <div className={estilos.contenedorPagina}>
      
      {/* --- Columna Izquierda (Menú + Chat) --- */}
      <div className={estilos.columnaIzquierda}>
        
        <nav className={estilos.menuLateral}>
          <div className={estilos.logo}>WikiDocs</div>
          <ul>
            <li><Link to="/modulos">Módulos</Link></li>
            <li><Link to="/cargue">Cargue de Documentación</Link></li>
            <li><Link to="/configuracion">Configuración</Link></li>
          </ul>
        </nav>

<div className={estilos.columnaChat}>
          <div className={estilos.areaChat}>
            
            {historialChat.map((mensaje, index) => (
              <div key={index} className={
                mensaje.remitente === 'ia' 
                  ? estilos.mensajeChat 
                  : estilos.mensajeUsuario 
              }>
                <p><strong>{mensaje.remitente === 'ia' ? 'IA' : 'Tú'}:</strong> {mensaje.texto}</p>
              </div>
            ))}
            
            {cargandoIA && (
              <div className={estilos.mensajeChat}>
                <p><strong>IA:</strong> Pensando...</p>
              </div>
            )}
          </div>
          
          <form className={estilos.areaInput} onSubmit={manejarEnvioPregunta}>
            <p>Pregunta sobre el documento</p>
            <textarea 
              placeholder="Escribe tu pregunta aquí..." 
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              disabled={cargandoIA} 
            />
            <button type="submit" disabled={cargandoIA}>
              {cargandoIA ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>

      <div className={estilos.columnaVisor}>
        <div className={estilos.headerVisor}>
          <p><Link to="/modulos">Documentos</Link> / {documento?.titulo}</p>
          <h2>{documento?.titulo}</h2>
        </div>
        <div className={estilos.areaContenido}>
          {cargando ? <p>Cargando documento...</p> : renderizarVisor()}
        </div>
      </div>
    </div>
  );
};

export default VisualizacionDocumentoPage;