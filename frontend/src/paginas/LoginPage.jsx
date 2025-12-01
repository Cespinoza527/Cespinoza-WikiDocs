import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:3001/api/users/login', { email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      navigate('/modulos');
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.brandDot} />
          <span className={styles.brand}>WikiDocs</span>
        </div>
        <h2 className={styles.title}>Iniciar sesión</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={manejarSubmit} className={styles.form}>
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
              placeholder="********"
              required
            />
          </label>
          <button className={styles.button} type="submit" disabled={!email || !password || loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
        <p className={styles.footer}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className={styles.link}>
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
