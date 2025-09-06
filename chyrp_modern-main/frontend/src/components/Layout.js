// frontend/src/components/Layout.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeSwitcher from './ThemeSwitcher';

const Layout = ({ children, isAuthenticated = false, username = '' }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if there's an error, clear local storage and redirect
      localStorage.removeItem('user_id');
      localStorage.removeItem('username');
      navigate('/');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container nav-content">
          <Link to="/" className="logo">BlogHub</Link>
          <div className="nav-links">
            {isAuthenticated ? (
              <>
                <span style={{color: 'var(--accent-primary)', marginRight: '1rem'}}>
                  Hello, {username}
                </span>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/create-blog" className="nav-link">Create Blog</Link>
                <Link to="/feed" className="nav-link">Feed</Link>
                <ThemeSwitcher />
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="nav-link">Register</Link>
                <ThemeSwitcher />
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
    </div>
  );
};

export default Layout;