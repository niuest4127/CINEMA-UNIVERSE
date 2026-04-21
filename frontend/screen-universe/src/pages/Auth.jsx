import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Auth.css'; // Podepniemy zaraz style!

const Auth = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
const location = useLocation();
  // Stan formularza
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
const fromPath = location.state?.from || '/repertuar';
  // Obsługa wpisywania tekstu w inputy
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Wysyłanie formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        // --- LOGIKA LOGOWANIA (Basic Auth) ---
        // Tworzymy token Basic Auth (wymaga tego Spring Security)
        const basicAuthToken = 'Basic ' + btoa(formData.email + ':' + formData.password);

        // Wysyłamy testowe zapytanie do backendu, żeby sprawdzić, czy hasło jest poprawne
        // (W następnym kroku zrobimy do tego specjalny endpoint w Javie!)
        const response = await fetch('http://localhost:8080/api/users/login', {
          method: 'POST',
          headers: {
            'Authorization': basicAuthToken
          }
        });

        if (!response.ok) throw new Error('Invalid email or password');
        
        const userData = await response.json();
        
        // Zapisujemy użytkownika i jego token w naszym AuthContext
        login({ ...userData, token: basicAuthToken });
        navigate(fromPath);

      } else {
        // --- LOGIKA REJESTRACJI ---
        const response = await fetch('http://localhost:8080/api/users/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            password: formData.password
          })
        });

        if (!response.ok) throw new Error('Registration failed. Email might be in use.');
        
        // Po udanej rejestracji, przełączamy na logowanie i czyścimy błędy
        setIsLoginMode(true);
        setError('Registration successful! Please log in.');
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
          {isLoginMode ? 'ACCESS YOUR ACCOUNT' : 'JOIN THE UNIVERSE'}
        </h2>
        
        {error && (
          <div className={`auth-message ${error.includes('successful') ? 'success' : 'error'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Pole Username pokazujemy tylko przy rejestracji */}


          <div className="input-group">
            <label>Email Address</label>
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
              <label>Phone Number</label>
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
            <label>Password</label>
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
            {loading ? 'PROCESSING...' : (isLoginMode ? 'LOGIN' : 'REGISTER')}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}>
              {isLoginMode ? 'Create one now' : 'Log in here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;