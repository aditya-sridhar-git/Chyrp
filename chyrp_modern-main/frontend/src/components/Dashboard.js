import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Dashboard mounted - checking authentication');
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      const res = await axios.get('http://localhost:5000/check_auth', {
        withCredentials: true
      });
      
      if (res.data.authenticated) {
        fetchDashboard();
      } else {
        console.log('Not authenticated, redirecting to login');
        navigate('/login');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      navigate('/login');
    }
  };

  const extractTextFromHtml = (html) => {
    if (!html) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const extractFirstImage = (html) => {
    if (!html) return null;
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const img = tempDiv.querySelector('img');
    return img ? img.src : null;
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      
      const res = await axios.get('http://localhost:5000/dashboard', {
        withCredentials: true
      });
      
      console.log('Dashboard response received:', res.data);
      
      setUser(res.data.user);
      
      const formattedBlogs = res.data.blogs.map(blog => {
        const previewText = extractTextFromHtml(blog.content);
        const firstImage = extractFirstImage(blog.content);
        
        return {
          ...blog,
          previewText: previewText.length > 150 
            ? `${previewText.substring(0, 150)}...` 
            : previewText,
          hasImage: !!firstImage,
          firstImage: firstImage
        };
      });
      
      setBlogs(formattedBlogs);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      console.error('Error response data:', err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('user_id');
        localStorage.removeItem('username');
        navigate('/login');
      } else {
        setError('Error loading dashboard. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      return;
    }

    setDeleting(blogId);
    try {
      await axios.delete(`http://localhost:5000/blog/${blogId}`, {
        withCredentials: true
      });
      
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      setError('');
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError('Error deleting blog. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{padding: '2rem', textAlign: 'center'}}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="container" style={{padding: '2rem', textAlign: 'center'}}>
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h2 className="welcome-message">Welcome, {user?.username}!</h2>
        <div className="dashboard-actions">
          <Link to="/create-blog" className="btn btn-primary">
            Create New Blog
          </Link>
          <Link to="/feed" className="btn btn-secondary">
            View Feed
          </Link>
        </div>
      </div>

      <h3>Your Blog Posts</h3>
      {error && <div className="error-message">{error}</div>}
      {blogs.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any blog posts yet.</p>
          <Link to="/create-blog" className="btn btn-primary" style={{marginTop: '1rem'}}>
            Create Your First Blog
          </Link>
        </div>
      ) : (
        <div className="blog-list">
          {blogs.map(blog => (
            <div key={blog.id} className="blog-card">
              <h4 className="blog-title">{blog.title}</h4>
              {blog.firstImage && (
                <div className="blog-image-preview">
                  <img 
                    src={blog.firstImage} 
                    alt="Blog preview" 
                    className="blog-preview-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="blog-content">
                {blog.previewText || 'No content yet.'}
              </p>
              <div className="blog-actions">
                <Link to={`/blog/${blog.id}`} className="btn btn-primary">
                  View Blog
                </Link>
                <button 
                  onClick={() => handleDeleteBlog(blog.id)} 
                  className="btn btn-danger"
                  disabled={deleting === blog.id}
                >
                  {deleting === blog.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              <p className="blog-date">Posted on: {blog.created_at}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;