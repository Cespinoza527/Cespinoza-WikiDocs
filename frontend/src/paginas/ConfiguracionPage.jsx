import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { usarTema } from '../context/ContextoTema';
import estilos from './ConfiguracionPage.module.css';
import API_URL from '../api/config';

const ConfiguracionPage = () => {
    const { modoOscuro, alternarTema } = usarTema();
    const [historial, setHistorial] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const obtenerHistorial = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };
                const { data } = await axios.get(`${API_URL}/api/auditoria`, config);
                setHistorial(data);
                setCargando(false);
            } catch (error) {
                console.error('Error al cargar historial:', error);
                setCargando(false);
            }
        };

        obtenerHistorial();
    }, []);

    const manejarLogout = () => {
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    return (
        <div className={estilos.contenedor}>
            <h2>Configuración</h2>
            <div className={estilos.opcion}>
                <div className={estilos.info}>
                    <h3>Modo Oscuro</h3>
                    <p>Activa o desactiva el tema oscuro.</p>
                </div>
                <button
                    className={`${estilos.toggle} ${modoOscuro ? estilos.activo : ''}`}
                    onClick={alternarTema}
                >
                    <div className={estilos.circulo}></div>
                </button>
            </div>

            <div className={estilos.seccionLogout} style={{ marginBottom: '20px', textAlign: 'left' }}>
                <button onClick={manejarLogout} className={estilos.botonLogout}>
                    Cerrar Sesión
                </button>
            </div>

            <div className={estilos.seccionHistorial}>
                <h3>Historial Global de Acciones</h3>
                {cargando ? (
                    <p>Cargando historial...</p>
                ) : (
                    <div className={estilos.tablaContenedor}>
                        <table className={estilos.tablaHistorial}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Usuario</th>
                                    <th>Acción</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historial.map((item) => (
                                    <tr key={item._id}>
                                        <td>{new Date(item.fecha).toLocaleString()}</td>
                                        <td>{item.usuario?.nombre || 'Desconocido'}</td>
                                        <td>{item.accion}</td>
                                        <td>{item.detalles}</td>
                                    </tr>
                                ))}
                                {historial.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center' }}>No hay registros de auditoría.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>


        </div>
    );
};

export default ConfiguracionPage;
