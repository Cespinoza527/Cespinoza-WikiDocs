import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import estilos from './CarguePagina.module.css';
import API_URL from '../api/config';

const CarguePagina = () => {
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const obtenerModulos = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get(`${API_URL}/api/modulos`, config);
      setModulos(data);
      setCargando(false);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los módulos');
      setCargando(false);
    }
  }, [userInfo]);

  useEffect(() => {
    if (userInfo) {
      obtenerModulos();
    }
  }, [userInfo, obtenerModulos]);

  const [titulo, setTitulo] = useState('');
  const [moduloId, setModuloId] = useState('');
  const [archivo, setArchivo] = useState(null);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorCargue, setErrorCargue] = useState('');

  const manejarSubida = async (e) => {
    e.preventDefault();
    setErrorCargue('');
    setMensajeExito('');

    if (!titulo || !moduloId || !archivo) {
      setErrorCargue('Por favor, completa todos los campos y selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('moduloId', moduloId);
    formData.append('documento', archivo);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.post(`${API_URL}/api/documentos/subir`, formData, config);

      setMensajeExito('¡Archivo subido exitosamente!');
      setTitulo('');
      setModuloId('');
      setArchivo(null);

    } catch (err) {
      console.error(err);
      const mensajeError = err.response?.data?.message || err.response?.data?.error || 'Error al subir el archivo. Intenta de nuevo.';
      setErrorCargue(mensajeError);
    }
  };

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={estilos.contenedorCargue}>
      <h1>Cargar Documentación</h1>

      <form onSubmit={manejarSubida} className={estilos.formulario}>

        {mensajeExito && <p className={estilos.mensajeExito}>{mensajeExito}</p>}
        {errorCargue && <p className={estilos.mensajeError}>{errorCargue}</p>}

        <div className={estilos.formGroup}>
          <label>Título del Documento</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>

        <div className={estilos.formGroup}>
          <label>Módulo al que pertenece</label>
          <select value={moduloId} onChange={(e) => setModuloId(e.target.value)}>
            <option value="">-- Selecciona un módulo --</option>
            {modulos.map((modulo) => (
              <option key={modulo._id} value={modulo._id}>
                {modulo.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className={estilos.formGroup}>
          <label>Archivo</label>
          <input
            type="file"
            onChange={(e) => setArchivo(e.target.files[0])}
          />
        </div>

        <button type="submit" className={estilos.botonCargar}>Cargar Documento</button>
      </form>
    </div>
  );
};

export default CarguePagina;