import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { username, email, password, password2 } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password !== password2) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Basic validation
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      const body = JSON.stringify({ username, email, password });
      console.log('Sending registration request:', body);
      
      const response = await axios.post('http://localhost:5000/register', body, config);
      console.log('Registration response:', response.data);
      
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Error creating account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container nav-content">
          <Link to="/" className="logo">BlogHub</Link>
          <div className="nav-links">
            <Link to="/login" className="nav-link">Login</Link>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="form-container">
          <h2 className="form-title">Create Your Account</h2>
          {error && <div style={{color: '#cf6679', marginBottom: '1rem', padding: '10px', backgroundColor: '#2d2d2d', borderRadius: '5px'}}>{error}</div>}
          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label">Username *</label>
              <input
                type="text"
                className="form-input"
                name="username"
                value={username}
                onChange={onChange}
                required
                minLength="3"
                placeholder="At least 3 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                className="form-input"
                name="email"
                value={email}
                onChange={onChange}
                required
                placeholder="your@email.com"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                name="password"
                value={password}
                onChange={onChange}
                required
                minLength="6"
                placeholder="At least 6 characters"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                className="form-input"
                name="password2"
                value={password2}
                onChange={onChange}
                required
                minLength="6"
                placeholder="Confirm your password"
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{width: '100%'}}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
          <p className="text-center mt-2">
            Already have an account? <Link to="/login" style={{color: '#bb86fc'}}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;