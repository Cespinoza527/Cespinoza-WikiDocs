import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../componentes/Modal';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:3001/api/users/register', {
        nombre,
        email,
        password,
      });

      localStorage.setItem('userInfo', JSON.stringify(data));
      setShowSuccessModal(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandDot} />
          <span className={styles.brand}>WikiDocs</span>
        </div>
        <h2 className={styles.title}>Crear cuenta</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={manejarSubmit} className={styles.form}>
          <label className={styles.label}>
            Nombre completo
            <input
              className={styles.input}
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              required
            />
          </label>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@gmail.com"
              required
            />
          </label>
          <label className={styles.label}>
            Contraseña
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </label>
          <label className={styles.label}>
            Confirmar contraseña
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
          </label>
          <button
            className={styles.button}
            type="submit"
            disabled={!nombre || !email || !password || !confirmPassword || loading}
          >
            {loading ? 'Registrando…' : 'Registrarse'}
          </button>
        </form>
        <p className={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.link}>
            Inicia sesión aquí
          </Link>
        </p>
      </div>

      <Modal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onConfirm={handleCloseModal}
        title="Registro Exitoso"
        message="El usuario se ha registrado correctamente."
        confirmText="Aceptar"
        showCancel={false}
      />
    </div >
  );
};

export default RegisterPage;
