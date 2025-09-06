// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import Layout from './components/Layout';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreateBlog from './components/CreateBlog';
import BlogView from './components/BlogView';
import Feed from './components/Feed';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/check_auth', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
        setUsername(data.username || '');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <Home />
            </Layout>
          } />
          <Route path="/login" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <Login onLogin={() => {
                setIsAuthenticated(true);
                setUsername(localStorage.getItem('username') || '');
              }} />
            </Layout>
          } />
          <Route path="/register" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <Register />
            </Layout>
          } />
          <Route path="/dashboard" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <Dashboard />
            </Layout>
          } />
          <Route path="/create-blog" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <CreateBlog />
            </Layout>
          } />
          <Route path="/blog/:id" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <BlogView />
            </Layout>
          } />
          <Route path="/feed" element={
            <Layout isAuthenticated={isAuthenticated} username={username}>
              <Feed />
            </Layout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;