import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import estilos from './VisualizacionDocumentoPage.module.css';
import Modal from '../componentes/Modal';
import API_URL from '../api/config';

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

  const [versiones, setVersiones] = useState([]);
  const [editando, setEditando] = useState(false);
  const [versionActual, setVersionActual] = useState(null);
  const [archivoNuevo, setArchivoNuevo] = useState(null);
  const [subiendoVersion, setSubiendoVersion] = useState(false);
  const [mostrarVersiones, setMostrarVersiones] = useState(false);
  const [comentarioVersion, setComentarioVersion] = useState('');

  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Aceptar',
    showCancel: false,
    onConfirm: () => { }
  });

  const userInfo = useMemo(() => {
    return JSON.parse(localStorage.getItem('userInfo'));
  }, []);

  const mostrarAlerta = (titulo, mensaje) => {
    setModalConfig({
      isOpen: true,
      title: titulo,
      message: mensaje,
      confirmText: 'Aceptar',
      showCancel: false,
      onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
    });
  };

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

      const { data: docInfo } = await axios.get(`${API_URL}/api/documentos/${documentoId}`, config);
      setDocumento(docInfo);

      const { data: historial } = await axios.get(`${API_URL}/api/versiones/history/${documentoId}`, config);
      setVersiones(historial);

      if (historial.length > 0) {
        setVersionActual(historial[0]); // La primera es la más reciente
        if (docInfo.tipoArchivo === 'text/plain') {
          setContenidoTexto(historial[0].contenido);
        }
      } else if (docInfo.tipoArchivo === 'text/plain') {
        const { data: versionInfo } = await axios.get(`${API_URL}/api/versiones/latest/${documentoId}`, config);
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

  const guardarNuevaVersionTexto = async () => {
    if (!comentarioVersion.trim()) {
      mostrarAlerta('Atención', 'Por favor ingrese un comentario para guardar la nueva versión.');
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.post(`${API_URL}/api/versiones`, {
        documentoId,
        contenido: contenidoTexto,
        comentario: comentarioVersion
      }, config);

      setEditando(false);
      setComentarioVersion('');
      obtenerDatosDelDocumento();
      mostrarAlerta('Éxito', 'Versión guardada exitosamente');
    } catch (error) {
      console.error(error);
      mostrarAlerta('Error', 'Error al guardar la versión');
    }
  };

  const subirNuevaVersionArchivo = async (e) => {
    e.preventDefault();
    if (!archivoNuevo) return;
    if (!comentarioVersion.trim()) {
      mostrarAlerta('Atención', 'Debes ingresar un comentario para subir la nueva versión.');
      return;
    }

    setSubiendoVersion(true);
    const formData = new FormData();
    formData.append('archivo', archivoNuevo);
    formData.append('documentoId', documentoId);
    formData.append('comentario', comentarioVersion);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'multipart/form-data'
        },
      };
      await axios.post(`${API_URL}/api/versiones`, formData, config);

      setArchivoNuevo(null);
      setComentarioVersion('');
      setSubiendoVersion(false);
      obtenerDatosDelDocumento();
      mostrarAlerta('Éxito', 'Nueva versión del archivo subida exitosamente');
    } catch (error) {
      console.error(error);
      setSubiendoVersion(false);
      mostrarAlerta('Error', 'Error al subir la nueva versión');
    }
  };

  const cargarVersion = (version) => {
    setVersionActual(version);
    if (documento.tipoArchivo === 'text/plain') {
      setContenidoTexto(version.contenido);
      setEditando(false);
    }
  };

  const renderizarVisor = () => {
    if (!documento) return <p>Cargando...</p>;

    let rutaMostrada = versionActual?.rutaArchivo || documento.rutaArchivo;

    if (rutaMostrada) {
      let urlArchivo = rutaMostrada;
      if (!urlArchivo.startsWith('http://') && !urlArchivo.startsWith('https://')) {
        urlArchivo = `${API_URL}/${rutaMostrada}`;
      }
      if (documento.tipoArchivo === 'application/pdf') {
        return (<iframe src={urlArchivo} title={documento.titulo} width="100%" height="100%" style={{ border: 'none' }} />);
      }
      if (documento.tipoArchivo.startsWith('image/')) {
        return (<img src={urlArchivo} alt={documento.titulo} style={{ maxWidth: '100%' }} />);
      }
    }
    if (documento.tipoArchivo === 'text/plain') {
      return (
        <textarea
          className={estilos.editorTxt}
          value={contenidoTexto}
          onChange={(e) => setContenidoTexto(e.target.value)}
          readOnly={!editando}
          style={{ backgroundColor: editando ? '#fff' : '#f0f0f0', color: '#000' }}
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
        `${API_URL}/api/documentos/${documentoId}/ask`,
        { pregunta: preguntaUsuario },
        config
      );

      setHistorialChat(historialPrevio => [
        ...historialPrevio,
        { remitente: 'ia', texto: data.respuesta }
      ]);

    } catch (err) {
      console.error(err);
      let mensajeError = 'No fue posible procesar la pregunta.';

      if (err.response && err.response.data && err.response.data.message) {
        mensajeError = err.response.data.message;
      }

      setHistorialChat(historialPrevio => [
        ...historialPrevio,
        { remitente: 'ia', texto: mensajeError }
      ]);
    } finally {
      setCargandoIA(false);
    }
  };

  return (
    <div className={estilos.contenedorPagina}>
      <div className={estilos.columnaIzquierda}>

        <nav className={estilos.menuLateral}>
          <div className={estilos.logo}>WikiDocs</div>
          <ul>
            <li><Link to="/modulos">Módulos</Link></li>
            <li><Link to="/cargue">Cargue de Documentación</Link></li>
            <li><Link to="/configuracion">Configuración/Historial</Link></li>
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
          <p><Link to={documento?.modulo ? `/modulos/${documento.modulo}` : '/modulos'}>Documentos</Link> / {documento?.titulo}</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{documento?.titulo}</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => setMostrarVersiones(true)} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
                Historial de versiones
              </button>
              {documento?.tipoArchivo === 'text/plain' && (
                <>
                  {!editando ? (
                    <button onClick={() => setEditando(true)} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Editar</button>
                  ) : (
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Comentario del cambio..."
                        value={comentarioVersion}
                        onChange={(e) => setComentarioVersion(e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <button onClick={guardarNuevaVersionTexto} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Guardar</button>
                      <button onClick={() => { setEditando(false); setContenidoTexto(versionActual?.contenido || ''); setComentarioVersion(''); }} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>Cancelar</button>
                    </div>
                  )}
                </>
              )}

              {documento?.tipoArchivo !== 'text/plain' && (
                <form onSubmit={subirNuevaVersionArchivo} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input
                    type="file"
                    onChange={(e) => setArchivoNuevo(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" style={{ cursor: 'pointer', padding: '8px 15px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f8f9fa', color: '#333' }}>
                    {archivoNuevo ? archivoNuevo.name : 'Reemplazar archivo'}
                  </label>
                  {archivoNuevo && (
                    <>
                      <input
                        type="text"
                        placeholder="Comentario..."
                        value={comentarioVersion}
                        onChange={(e) => setComentarioVersion(e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <button type="submit" disabled={subiendoVersion} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                        {subiendoVersion ? 'Subiendo...' : 'Subir'}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
        <div className={estilos.areaContenido}>
          {cargando ? <p>Cargando documento...</p> : renderizarVisor()}
        </div>
      </div>
      {mostrarVersiones && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '500px', maxHeight: '80vh', overflowY: 'auto',
            color: 'black'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Historial de Versiones</h3>
              <button onClick={() => setMostrarVersiones(false)} style={{ padding: '5px 10px', cursor: 'pointer' }}>Cerrar</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {versiones.map((v) => (
                <li key={v._id}
                  style={{
                    padding: '10px',
                    cursor: 'pointer',
                    backgroundColor: versionActual?._id === v._id ? '#e0e0e0' : 'transparent',
                    borderBottom: '1px solid #eee'
                  }}
                  onClick={() => { cargarVersion(v); setMostrarVersiones(false); }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{new Date(v.createdAt).toLocaleString()}</strong>
                    <small>{v.user?.nombre || 'Usuario'}</small>
                  </div>
                  {v.comentario && <p style={{ margin: '5px 0 0 0', fontStyle: 'italic', color: '#555' }}>"{v.comentario}"</p>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        showCancel={modalConfig.showCancel}
      />
    </div>
  );
};

export default VisualizacionDocumentoPage;