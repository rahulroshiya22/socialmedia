import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Shield } from 'lucide-react';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin');
      }
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="clay-card login-card" style={{ animation: 'pop-in 0.5s cubic-bezier(0.68,-0.55,0.27,1.55) both' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--orange-400), var(--orange-600))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--clay-shadow)',
            color: 'white'
          }}>
            <Shield size={24} />
          </div>
          <h2 className="login-title">Admin Panel</h2>
          <p className="login-subtitle">Sign in to manage downloads & settings</p>
        </div>
        
        {error && (
          <div className="clay-alert clay-alert-error animate-shake">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-icon-wrapper">
              <div className="input-icon">
                <User size={18} />
              </div>
              <input
                id="admin-username"
                type="text"
                className="clay-input clay-input-with-icon"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input
                id="admin-password"
                type="password"
                className="clay-input clay-input-with-icon"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            id="admin-login-btn"
            type="submit" 
            className="clay-btn clay-btn-primary clay-btn-full clay-btn-lg"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? <div className="clay-loader"></div> : '🔐 Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
