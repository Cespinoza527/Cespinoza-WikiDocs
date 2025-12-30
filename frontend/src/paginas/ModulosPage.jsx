import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import estilos from './ModulosPage.module.css';
import Modal from '../componentes/Modal';
import MenuOpciones from '../componentes/MenuOpciones';

const ModulosPage = () => {
  const [modulos, setModulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreModulo, setNombreModulo] = useState('');
  const [descripcionModulo, setDescripcionModulo] = useState('');
  const [errorModal, setErrorModal] = useState('');

  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [moduloAEditar, setModuloAEditar] = useState(null);
  const [nombreEditar, setNombreEditar] = useState('');
  const [descripcionEditar, setDescripcionEditar] = useState('');
  const [errorEditarModal, setErrorEditarModal] = useState('');

  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false);
  const [moduloAEliminar, setModuloAEliminar] = useState(null);
  const [errorEliminar, setErrorEliminar] = useState('');
  const [cargandoEliminar, setCargandoEliminar] = useState(false);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const obtenerModulos = useCallback(async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      const { data } = await axios.get('http://localhost:3001/api/modulos', config);
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

  const manejarCrearModulo = async (e) => {
    e.preventDefault();
    if (!nombreModulo || !descripcionModulo) {
      setErrorModal('Por favor, rellene todos los campos');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.post('http://localhost:3001/api/modulos', {
        nombre: nombreModulo,
        descripcion: descripcionModulo,
      }, config);

      setModalAbierto(false);
      setNombreModulo('');
      setDescripcionModulo('');
      setErrorModal('');
      obtenerModulos();

    } catch (err) {
      console.error(err);
      setErrorModal('Error al crear el módulo');
    }
  };


  const abrirModalEditar = (modulo) => {
    setModuloAEditar(modulo);
    setNombreEditar(modulo.nombre);
    setDescripcionEditar(modulo.descripcion);
    setModalEditarAbierto(true);
    setMenuAbiertoId(null);
  };


  const manejarGuardarEdicion = async (e) => {
    e.preventDefault();
    setErrorEditarModal('');

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`http://localhost:3001/api/modulos/${moduloAEditar._id}`, {
        nombre: nombreEditar,
        descripcion: descripcionEditar,
      }, config);

      setModalEditarAbierto(false);
      obtenerModulos();

    } catch (err) {
      console.error(err);
      setErrorEditarModal('Error al actualizar el módulo');
    }
  };

  const manejarEliminar = (modulo) => {
    setModuloAEliminar(modulo);
    setModalEliminarAbierto(true);
    setMenuAbiertoId(null);
    setErrorEliminar('');
  };

  const confirmarEliminar = async () => {
    setCargandoEliminar(true);
    setErrorEliminar('');

    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };

      await axios.delete(`http://localhost:3001/api/modulos/${moduloAEliminar._id}`, config);

      setModalEliminarAbierto(false);
      setModuloAEliminar(null);
      setCargandoEliminar(false);
      obtenerModulos();

    } catch (err) {
      console.error(err);

      setErrorEliminar(err.response.data.message || 'Error al eliminar el módulo');
      setCargandoEliminar(false);
    }
  };

  const toggleMenu = (moduloId) => {
    setMenuAbiertoId(menuAbiertoId === moduloId ? null : moduloId);
  };

  const modulosFiltrados = modulos.filter((modulo) =>
    modulo.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    modulo.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase())
  );

  if (cargando) return <p>Cargando módulos</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className={estilos.contenedorPrincipal}>
      <header className={estilos.header}>
        <h1>Módulos de Documentación</h1>
        <div>

          <button onClick={() => setModalAbierto(true)} className={estilos.botonCrear}>
            + Añadir Módulo
          </button>

        </div>
      </header>

      <div className={estilos.contenedorBusqueda}>
        <input
          type="text"
          placeholder="Buscar módulos por nombre o descripción..."
          className={estilos.barraBusqueda}
          value={terminoBusqueda}
          onChange={(e) => setTerminoBusqueda(e.target.value)}
        />
      </div>

      <div className={estilos.cuadriculaModulos}>
        {modulosFiltrados.length === 0 ? (
          <p>
            {terminoBusqueda ? 'No se encontraron módulos que coincidan.' : 'No hay módulos creados todavía.'}
          </p>
        ) : (
          modulosFiltrados.map((modulo) => (
            <div key={modulo._id} className={estilos.tarjetaModuloContenedor}>

              <button onClick={() => toggleMenu(modulo._id)} className={estilos.botonMenu}>
                ⋮
              </button>

              {menuAbiertoId === modulo._id && (
                <MenuOpciones
                  onEditar={() => abrirModalEditar(modulo)}
                  onEliminar={() => manejarEliminar(modulo)}
                />
              )}

              <Link to={`/modulos/${modulo._id}`} className={estilos.enlaceTarjeta}>
                <h3>{modulo.nombre}</h3>
                <p>{modulo.descripcion}</p>
              </Link>
            </div>
          ))
        )}
      </div>




      <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title="Crear Nuevo Módulo">
        <form onSubmit={manejarCrearModulo}>
          {errorModal && <p style={{ color: 'red' }}>{errorModal}</p>}
          <div className={estilos.formGroup}>
            <label>Nombre del Módulo</label>
            <input
              type="text"
              value={nombreModulo}
              onChange={(e) => setNombreModulo(e.target.value)}
            />
          </div>
          <div className={estilos.formGroup}>
            <label>Descripción</label>
            <textarea
              rows="4"
              value={descripcionModulo}
              onChange={(e) => setDescripcionModulo(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className={estilos.botonGuardar}>Guardar Módulo</button>
        </form>
      </Modal>

      <Modal isOpen={modalEditarAbierto} onClose={() => setModalEditarAbierto(false)} title="Editar Módulo">
        <form onSubmit={manejarGuardarEdicion}>
          {errorEditarModal && <p style={{ color: 'red' }}>{errorEditarModal}</p>}
          <div className={estilos.formGroup}>
            <label>Nombre del Módulo</label>
            <input
              type="text"
              value={nombreEditar}
              onChange={(e) => setNombreEditar(e.target.value)}
            />
          </div>
          <div className={estilos.formGroup}>
            <label>Descripción</label>
            <textarea
              rows="4"
              value={descripcionEditar}
              onChange={(e) => setDescripcionEditar(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className={estilos.botonGuardar}>Guardar Cambios</button>
        </form>
      </Modal>

      <Modal isOpen={modalEliminarAbierto} onClose={() => setModalEliminarAbierto(false)} title="Confirmar Eliminación">
        <div className={estilos.contenedorEliminar}>
          <p>
            ¿Estás seguro de que deseas eliminar el módulo <strong>"{moduloAEliminar?.nombre}"</strong>?
          </p>

          {errorEliminar && <p style={{ color: 'red' }}>{errorEliminar}</p>}

          <div className={estilos.botonesEliminar}>
            <button
              onClick={() => setModalEliminarAbierto(false)}
              className={estilos.botonCancelar}
              disabled={cargandoEliminar}
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminar}
              className={estilos.botonConfirmarEliminar}
              disabled={cargandoEliminar}
            >
              {cargandoEliminar ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ModulosPage;