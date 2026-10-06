import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, 'Password123!');
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="jira-modal-backdrop" onClick={onClose}>
      <div className="jira-modal-content sm auth-modal-box" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="jira-logo-brand auth-logo">
            <svg className="jira-logo-icon" viewBox="0 0 24 24" fill="#0052CC">
              <path d="M11.53 2c0 2.4 1.97 4.35 4.4 4.35h1.72V8.1c0 2.4 1.97 4.35 4.4 4.35v-1.74c0-2.4-1.97-4.35-4.4-4.35h-1.72V4.6c0-2.4-1.97-4.35-4.4-4.35v1.75zm-5.76 5.8c0 2.4 1.97 4.35 4.4 4.35h1.72v1.75c0 2.4 1.97 4.35 4.4 4.35v-1.75c0-2.4-1.97-4.35-4.4-4.35H10.17V9.56c0-2.4-1.97-4.35-4.4-4.35v2.59zM0 13.6c0 2.4 1.97 4.35 4.4 4.35h1.72v1.75C6.12 22.1 8.09 24 10.52 24v-1.75c0-2.4-1.97-4.35-4.4-4.35H4.4V16.14C4.4 13.74 2.43 11.8 0 11.8v1.8z" />
            </svg>
            <span className="jira-brand-text">Project Management</span>
          </div>
          <h2>{isRegister ? 'Sign up for Project Management' : 'Log in to your account'}</h2>
          <p className="auth-subtitle">Manage projects, collaborate on issues, and track sprints.</p>
        </div>

        {/* 1-Click Demo Logins */}
        <div className="demo-accounts-section">
          <div className="demo-accounts-title">QUICK DEMO TEST DRIVE (1-CLICK)</div>
          <div className="demo-buttons-grid">
            <button type="button" className="demo-btn" onClick={() => handleDemoLogin('alex.admin@pm.dev')}>
              <strong>Alex Rivera</strong> <span>Admin / Lead</span>
            </button>
            <button type="button" className="demo-btn" onClick={() => handleDemoLogin('sarah.lead@pm.dev')}>
              <strong>Sarah Chen</strong> <span>Product Lead</span>
            </button>
            <button type="button" className="demo-btn" onClick={() => handleDemoLogin('david.dev@pm.dev')}>
              <strong>David Miller</strong> <span>Senior Dev</span>
            </button>
            <button type="button" className="demo-btn" onClick={() => handleDemoLogin('elena.qa@pm.dev')}>
              <strong>Elena Rostova</strong> <span>QA Engineer</span>
            </button>
          </div>
        </div>

        <div className="auth-divider-line">
          <span>OR CONTINUE WITH EMAIL</span>
        </div>

        {error && <div className="auth-error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label>Work Email</label>
            <input 
              type="email" 
              required 
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Log In')}
          </button>
        </form>

        <div className="auth-toggle-footer">
          {isRegister ? (
            <p>Already have an account? <span onClick={() => setIsRegister(false)}>Log In</span></p>
          ) : (
            <p>New to Project Management? <span onClick={() => setIsRegister(true)}>Sign Up</span></p>
          )}
        </div>
      </div>
    </div>
  );
}
