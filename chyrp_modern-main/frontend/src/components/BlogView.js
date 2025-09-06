import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BlogView.css';

const BlogView = () => {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlog();
    fetchComments();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/blog/${id}`, {
        withCredentials: true
      });
      
      if (res.data) {
        setBlog(res.data);
      } else {
        setError('Blog not found');
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 404) {
        setError('Blog not found');
      } else {
        setError('Error loading blog. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/blog/${id}/comments`, {
        withCredentials: true
      });
      setComments(res.data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleLike = async () => {
    try {
      const res = await axios.post(`http://localhost:5000/blog/${id}/like`, {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Update the like count and status
      setBlog(prev => ({ 
        ...prev, 
        likes_count: res.data.likes_count,
        liked: res.data.liked
      }));
    } catch (err) {
      console.error('Error liking blog:', err);
      setError('Error liking blog. Please try again.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/blog/${id}/comment`, {
        content: newComment
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setComments([...comments, res.data.comment]);
      setNewComment('');
      setError('');
      
      // Update comment count
      setBlog(prev => ({ 
        ...prev, 
        comments_count: (prev.comments_count || 0) + 1 
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Error adding comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  const createMarkup = () => {
    if (!blog || !blog.content) return { __html: '' };
    return { __html: blog.content };
  };

  if (loading) {
    return (
      <div>
        <nav className="navbar">
          <div className="container nav-content">
            <Link to="/feed" className="logo">BlogHub</Link>
          </div>
        </nav>
        <div className="container" style={{padding: '2rem', textAlign: 'center'}}>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div>
        <nav className="navbar">
          <div className="container nav-content">
            <Link to="/feed" className="logo">BlogHub</Link>
          </div>
        </nav>
        <div className="container" style={{padding: '2rem', textAlign: 'center'}}>
          <div style={{color: '#cf6679', marginBottom: '1rem'}}>{error}</div>
          <button onClick={() => navigate('/feed')} className="btn btn-primary">
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container nav-content">
          <Link to="/feed" className="logo">BlogHub</Link>
          <div className="nav-links">
            <button onClick={() => navigate('/feed')} className="btn btn-secondary">
              Back to Feed
            </button>
          </div>
        </div>
      </nav>

      <div className="container blog-view">
        <article className="blog-article">
          <div className="blog-header">
            <h1 className="blog-title">{blog.title}</h1>
            <div className="blog-meta">
              <span>By {blog.author_username}</span>
              <span>Posted on: {new Date(blog.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="blog-stats">
            <button 
              onClick={handleLike} 
              className={`like-btn ${blog.liked ? 'liked' : ''}`}
            >
              {blog.liked ? '❤️' : '🤍'} {blog.likes_count || 0} Likes
            </button>
            <span>💬 {blog.comments_count || 0} Comments</span>
          </div>

          <div 
            className="blog-content word-style-content"
            dangerouslySetInnerHTML={createMarkup()}
          />
        </article>

        <section className="comments-section">
          <h3>Comments ({comments.length})</h3>
          
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
              className="comment-input"
              required
            />
            <button type="submit" disabled={commentLoading} className="btn btn-primary">
              {commentLoading ? 'Posting...' : 'Post Comment'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.author_username}</strong>
                    <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="comment-content">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogView;