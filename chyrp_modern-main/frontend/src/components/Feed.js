// Feed.js - Updated to handle video elements in preview text
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Feed = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, []);

  const extractTextFromHtml = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove video elements to prevent their text content from appearing
    const videoElements = tempDiv.querySelectorAll('video');
    videoElements.forEach(video => video.remove());
    
    // Also remove any elements with "video" in their class names
    const videoContainers = tempDiv.querySelectorAll('[class*="video"]');
    videoContainers.forEach(container => container.remove());
    
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await axios.get('http://localhost:5000/feed', {
        withCredentials: true
      });
      
      if (res.data && res.data.blogs) {
        const formattedBlogs = res.data.blogs.map(blog => {
          const previewText = extractTextFromHtml(blog.content);
          
          return {
            ...blog,
            previewText: previewText.length > 150 
              ? `${previewText.substring(0, 150)}...` 
              : previewText
          };
        });
        
        setBlogs(formattedBlogs);
      } else {
        setError('No blogs found');
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Error loading feed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (blogId) => {
    try {
      const res = await axios.post(`http://localhost:5000/blog/${blogId}/like`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update the like count and liked status locally
      setBlogs(blogs.map(blog => 
        blog.id === blogId 
          ? { 
              ...blog, 
              likes_count: res.data.likes_count,
              liked: res.data.liked
            }
          : blog
      ));
    } catch (err) {
      console.error('Error liking blog:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Error liking blog. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <div className="container nav-content">
            <Link to="/dashboard" className="logo">BlogHub</Link>
            <div className="nav-links">
              <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
                Back to Dashboard
              </button>
            </div>
          </div>
        </nav>
        <div className="container" style={{padding: '2rem', textAlign: 'center'}}>
          <p>Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container nav-content">
          <Link to="/dashboard" className="logo">BlogHub</Link>
          <div className="nav-links">
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container feed">
        <div className="feed-header">
          <h2>Blog Feed</h2>
          <p>Discover blogs from all users</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchFeed} className="btn btn-primary" style={{marginLeft: '1rem'}}>
              Try Again
            </button>
          </div>
        )}

        <div className="blog-feed">
          {blogs.length === 0 && !error ? (
            <div className="empty-feed">
              <p>No blogs found. Be the first to create one!</p>
              <button onClick={() => navigate('/create-blog')} className="btn btn-primary">
                Create Blog
              </button>
            </div>
          ) : (
            blogs.map(blog => (
              <div key={blog.id} className="feed-blog-card">
                <div className="blog-author">
                  <span>By {blog.author_username}</span>
                  <span className="blog-date">{new Date(blog.created_at).toLocaleDateString()}</span>
                </div>
                
                <h3 className="blog-title">{blog.title}</h3>
                
                <p className="blog-content-preview">
                  {blog.previewText || 'No content preview available.'}
                </p>
                
                <div className="blog-stats">
                  <div className="stat">
                    <button 
                      onClick={() => handleLike(blog.id)} 
                      className={`like-btn ${blog.liked ? 'liked' : ''}`}
                      title={blog.liked ? "Unlike this blog" : "Like this blog"}
                    >
                      {blog.liked ? '❤️' : '🤍'} {blog.likes_count || 0}
                    </button>
                  </div>
                  <div className="stat">
                    💬 {blog.comments_count || 0} comments
                  </div>
                </div>
                
                <div className="blog-actions">
                  <Link to={`/blog/${blog.id}`} className="btn btn-primary">
                    Read More
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Feed;