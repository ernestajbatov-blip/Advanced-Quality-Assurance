// @ts-nocheck
import React, { useState } from 'react';
import { login } from '../../axios/wellService';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(credentials);
      const userData = response.data;
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      
      onLogin(userData);
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setError('Неверный логин или пароль');
      } else {
        setError('Ошибка подключения к серверу');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1f',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#2d2d32',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#ffffff',
          marginBottom: '30px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Вход в систему
        </h2>
        
        <div onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#ffffff',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Логин
            </label>
            <input
              type="text"
              name="login"
              value={credentials.login}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#1a1a1f',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Введите логин"
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              color: '#ffffff',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              Пароль
            </label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '4px',
                border: '1px solid #555',
                backgroundColor: '#1a1a1f',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Введите пароль"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e);
                }
              }}
            />
          </div>
          
          {error && (
            <div style={{
              backgroundColor: '#ff4444',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#666' : '#007bff',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;