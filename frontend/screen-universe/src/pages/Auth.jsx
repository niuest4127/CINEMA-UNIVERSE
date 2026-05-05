import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTranslation } from 'react-i18next'; 
import './Auth.css'; 

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const location = useLocation();
  const { t } = useTranslation(); 


  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fromPath = location.state?.from || '/repertuar';


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {

        const basicAuthToken = 'Basic ' + btoa(formData.email + ':' + formData.password);

        const response = await fetch('http://localhost:8080/api/users/login', {
          method: 'POST',
          headers: {
            'Authorization': basicAuthToken
          }
        });

        if (!response.ok) throw new Error(t('auth.invalidCredentials', 'Invalid email or password'));
        
        const userData = await response.json();
        
        login({ ...userData, token: basicAuthToken });
        navigate(fromPath);

      } else {

        const response = await fetch('http://localhost:8080/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            password: formData.password
          })
        });

        if (!response.ok) throw new Error(t('auth.registrationFailed', 'Registration failed. Email might be in use.'));
        
        setIsLoginMode(true);
        setError(t('auth.registrationSuccess', 'Registration successful! Please log in.'));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel">
        <h2 className="auth-title">

          {isLoginMode ? t('auth.loginTitle') : t('auth.registerTitle')}
        </h2>
        
        {error && (
          <div className={`auth-message ${error.includes(t('auth.registrationSuccess', 'successful')) ? 'success' : 'error'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="input-group">
            <label>{t('auth.email')}</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              placeholder="name@example.com"
            />
          </div>

          {!isLoginMode && (
            <div className="input-group">
              <label>{t('auth.phoneNumber')}</label>
              <input 
                type="tel" 
                name="phoneNumber" 
                value={formData.phoneNumber} 
                onChange={handleChange} 
                required={!isLoginMode}
                placeholder="+48 123 456 789"
              />
            </div>
          )}

          <div className="input-group">
            <label>{t('auth.password')}</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="glassBtn auth-submit-btn" disabled={loading}>
            {loading ? t('auth.processing') : (isLoginMode ? t('auth.submitLogin') : t('auth.submitRegister'))}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLoginMode ? `${t('auth.noAccount')} ` : `${t('auth.hasAccount')} `}
            <span onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}>
              {isLoginMode ? t('auth.createOne') : t('auth.loginHere')}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;