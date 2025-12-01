import React from 'react';
import { usarTema } from '../context/ContextoTema';
import estilos from './ConfiguracionPage.module.css';

const ConfiguracionPage = () => {
    const { modoOscuro, alternarTema } = usarTema();

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

            <div className={estilos.seccionLogout}>
                <button onClick={manejarLogout} className={estilos.botonLogout}>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default ConfiguracionPage;
