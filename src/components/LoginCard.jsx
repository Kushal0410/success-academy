import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldAlert, Key } from 'lucide-react';
import { db } from '../services/db';

export default function LoginCard({ onLoginSuccess }) {
  const [isAdminTab, setIsAdminTab] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isAdminTab) {
        // Admin authentication
        if (username.trim().toLowerCase() === 'kushal.lk04@gmail.com' && password === 'kushal@admin') {
          onLoginSuccess({
            id: 'admin',
            name: 'Director Admin',
            isAdmin: true
          });
        } else {
          throw new Error('Invalid Admin Username or Password.');
        }
      } else {
        // Student/Parent Authentication
        const student = await db.loginStudent(username.trim().toUpperCase(), password);
        onLoginSuccess({
          ...student,
          isAdmin: false
        });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials or reach out to the admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-section">
      <div className="login-card">
        <div className="login-header">
          <h2>ERP Portal Access</h2>
          <p>Login to review weekend grades and tuition records</p>
        </div>

        {/* Tab switcher */}
        <div className="login-tabs">
          <button 
            className={`login-tab-btn ${!isAdminTab ? 'active' : ''}`}
            onClick={() => { setIsAdminTab(false); setError(''); setUsername(''); setPassword(''); }}
            type="button"
          >
            Student & Parent
          </button>
          <button 
            className={`login-tab-btn ${isAdminTab ? 'active' : ''}`}
            onClick={() => { setIsAdminTab(true); setError(''); setUsername(''); setPassword(''); }}
            type="button"
          >
            Tuition Admin
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Username / Student ID Input */}
          <div className="form-group">
            <label htmlFor="login-username">
              {isAdminTab ? 'Admin Username' : 'Student ID'}
            </label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input 
                id="login-username"
                className="input-field"
                placeholder={isAdminTab ? "e.g. admin" : "e.g. SA-001"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                type="text"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                id="login-password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button 
            className="btn-submit" 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        
       </div>
    </section>
  );
}
