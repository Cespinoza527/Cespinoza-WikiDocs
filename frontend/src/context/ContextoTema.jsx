import React, { createContext, useState, useEffect, useContext } from 'react';

const ContextoTema = createContext();

export const usarTema = () => useContext(ContextoTema);

export const ProveedorTema = ({ children }) => {
    const [modoOscuro, setModoOscuro] = useState(() => {
        const guardado = localStorage.getItem('modoOscuro');
        return guardado === 'true';
    });

    useEffect(() => {
        localStorage.setItem('modoOscuro', modoOscuro);
        if (modoOscuro) {
            document.body.classList.add('modoOscuro');
        } else {
            document.body.classList.remove('modoOscuro');
        }
    }, [modoOscuro]);

    const alternarTema = () => {
        setModoOscuro(prev => !prev);
    };

    return (
        <ContextoTema.Provider value={{ modoOscuro, alternarTema }}>
            {children}
        </ContextoTema.Provider>
    );
};
