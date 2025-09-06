import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateBlog.css';

const CreateBlog = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const contentRef = useRef(null);
  const navigate = useNavigate();

  // Cloudinary configuration
  const CLOUD_NAME = 'dkg8ij6e8';
  const UPLOAD_PRESET = 'chyrp_modern'; // Make sure this matches your Cloudinary preset name

  const handleFormat = (command, value = '') => {
    document.execCommand(command, false, value);
    contentRef.current.focus();
  };

  const uploadToCloudinary = async (file, resourceType = 'image') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('cloud_name', CLOUD_NAME);
    
    // For better organization in Cloudinary
    formData.append('folder', 'bloghub_uploads');
    
    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (resourceType === 'video') {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`Upload progress: ${percentCompleted}%`);
            }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      if (error.response) {
        console.error('Cloudinary error response:', error.response.data);
        
        // More specific error messages
        if (error.response.data.error && error.response.data.error.message.includes('upload preset')) {
          throw new Error('Upload preset not found. Please check Cloudinary configuration.');
        }
      }
      throw new Error('Failed to upload file. Please try again.');
    }
  };

  const handleInsertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(true);
        setError('');
        try {
          // Check file size (max 10MB for images)
          if (file.size > 10 * 1024 * 1024) {
            setError('Image file size must be less than 10MB');
            setUploading(false);
            return;
          }
          
          const result = await uploadToCloudinary(file, 'image');
          setCurrentImage(result.secure_url);
          
          // Show image options modal
          document.getElementById('imageOptionsModal').style.display = 'block';
        } catch (error) {
          setError(error.message || 'Failed to upload image. Please try again.');
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };

const applyImageStyle = (style) => {
  if (!currentImage) return;
  
  let imageHtml = '';
  
  switch(style) {
    case 'inline':
      imageHtml = `<div class="image-container"><img src="${currentImage}" style="max-width: 200px; height: auto; margin: 0 10px 5px 0; display: inline-block; vertical-align: middle;" alt="Blog image"></div>`;
      break;
    case 'left':
      imageHtml = `<div class="image-container" style="float: left; margin: 0 15px 15px 0; max-width: 300px;"><img src="${currentImage}" style="max-width: 100%; height: auto;" alt="Blog image"></div>`;
      break;
    case 'right':
      imageHtml = `<div class="image-container" style="float: right; margin: 0 0 15px 15px; max-width: 300px;"><img src="${currentImage}" style="max-width: 100%; height: auto;" alt="Blog image"></div>`;
      break;
    case 'center':
      imageHtml = `<div class="image-container" style="text-align: center; margin: 15px 0;"><img src="${currentImage}" style="max-width: 100%; height: auto; max-height: 400px;" alt="Blog image"></div>`;
      break;
    case 'break':
      imageHtml = `<div class="image-container" style="text-align: center; margin: 30px 0; width: 100%;"><img src="${currentImage}" style="max-width: 100%; height: auto; max-height: 500px;" alt="Blog image"></div>`;
      break;
    default:
      imageHtml = `<div class="image-container"><img src="${currentImage}" style="max-width: 100%; height: auto;" alt="Blog image"></div>`;
  }
  
  document.execCommand('insertHTML', false, imageHtml);
  closeImageOptions();
};

  const closeImageOptions = () => {
    document.getElementById('imageOptionsModal').style.display = 'none';
    setCurrentImage(null);
  };

  const handleInsertVideo = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploading(true);
        setError('');
        
        // Check file size (max 100MB for videos)
        if (file.size > 100 * 1024 * 1024) {
          setError('Video file size must be less than 100MB');
          setUploading(false);
          return;
        }
        
        // Show uploading message
        setError('Uploading video... This may take a while for larger files.');
        
        try {
          const result = await uploadToCloudinary(file, 'video');
          const videoHtml = `
            <div style="text-align: center; margin: 20px 0;">
              <video controls style="max-width: 100%; max-height: 400px; border-radius: 8px;">
                <source src="${result.secure_url}" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          `;
          document.execCommand('insertHTML', false, videoHtml);
          setError(''); // Clear error message on success
        } catch (error) {
          setError(error.message || 'Failed to upload video. Please try again with a smaller file.');
        } finally {
          setUploading(false);
        }
      }
    };
    input.click();
  };

  // Fallback method using direct form submission (more reliable)
  const uploadWithDirectForm = (file, resourceType, callback) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && resourceType === 'video') {
        const percentCompleted = Math.round((e.loaded * 100) / e.total);
        console.log(`Upload progress: ${percentCompleted}%`);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = JSON.parse(xhr.responseText);
        callback(null, response);
      } else {
        callback(new Error('Upload failed'));
      }
    });
    
    xhr.addEventListener('error', () => {
      callback(new Error('Upload failed'));
    });
    
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`);
    xhr.send(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', contentRef.current.innerHTML);
      
      const response = await axios.post('http://localhost:5000/create_blog', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating blog:', err);
      setError('Error creating blog. Please try again.');
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="container nav-content">
          <span className="logo">BlogHub</span>
          <div className="nav-links">
            <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="create-blog-page">
          <h2 className="form-title">Create New Blog Post</h2>
          
          {error && (
            <div className="error-message">
              {error}
              {error.includes('Upload preset not found') && (
                <div style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
                  Please check that the upload preset 'bloghub_uploads' exists in your Cloudinary account.
                </div>
              )}
            </div>
          )}
          {uploading && <div className="uploading-message">Uploading file... {uploading === 'video' ? 'This may take a while.' : ''}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter blog title..."
              />
            </div>

            <div className="word-style-editor">
              <div className="editor-toolbar">
                <div className="toolbar-group">
                  <button type="button" onClick={() => handleFormat('bold')} className="toolbar-btn" title="Bold">
                    <strong>B</strong>
                  </button>
                  <button type="button" onClick={() => handleFormat('italic')} className="toolbar-btn" title="Italic">
                    <em>I</em>
                  </button>
                  <button type="button" onClick={() => handleFormat('underline')} className="toolbar-btn" title="Underline">
                    <u>U</u>
                  </button>
                </div>

                <div className="toolbar-group">
                  <button type="button" onClick={() => handleFormat('justifyLeft')} className="toolbar-btn" title="Align Left">
                    ≡
                  </button>
                  <button type="button" onClick={() => handleFormat('justifyCenter')} className="toolbar-btn" title="Center">
                    ≡
                  </button>
                  <button type="button" onClick={() => handleFormat('justifyRight')} className="toolbar-btn" title="Align Right">
                    ≡
                  </button>
                </div>

                <div className="toolbar-group">
                  <button type="button" onClick={() => handleFormat('insertUnorderedList')} className="toolbar-btn" title="Bullet List">
                    • List
                  </button>
                  <button type="button" onClick={() => handleFormat('insertOrderedList')} className="toolbar-btn" title="Numbered List">
                    1. List
                  </button>
                </div>

                <div className="toolbar-group">
                  <select 
                    onChange={(e) => handleFormat('formatBlock', e.target.value)}
                    className="toolbar-select"
                    title="Heading Style"
                  >
                    <option value="p">Paragraph</option>
                    <option value="h1">Heading 1</option>
                    <option value="h2">Heading 2</option>
                    <option value="h3">Heading 3</option>
                  </select>
                </div>

                <div className="toolbar-group">
                  <button type="button" onClick={handleInsertImage} className="toolbar-btn" title="Insert Image" disabled={uploading}>
                    🖼️ Image
                  </button>
                  <button type="button" onClick={handleInsertVideo} className="toolbar-btn" title="Insert Video" disabled={uploading}>
                    🎥 Video
                  </button>
                </div>

                <div className="toolbar-group">
                  <button type="button" onClick={() => handleFormat('createLink', prompt('Enter URL:'))} className="toolbar-btn" title="Insert Link">
                    🔗 Link
                  </button>
                </div>
              </div>

              <div
                ref={contentRef}
                className="editor-content"
                contentEditable
                placeholder="Start writing your blog content here..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '2rem'}} disabled={uploading}>
              {uploading ? 'Publishing...' : 'Publish Blog'}
            </button>
          </form>

          {/* Image Options Modal */}
          <div id="imageOptionsModal" className="modal">
            <div className="modal-content">
              <h3>Image Placement Options</h3>
              <div className="image-options">
                <button onClick={() => applyImageStyle('inline')} className="image-option-btn">
                  <div className="option-preview">
                    <span style={{verticalAlign: 'middle'}}>Text</span>
                    <img src={currentImage} alt="Preview" style={{width: '30px', height: '30px', verticalAlign: 'middle', margin: '0 5px'}} />
                    <span style={{verticalAlign: 'middle'}}>Text</span>
                  </div>
                  <span>Inline with Text</span>
                </button>
                
                <button onClick={() => applyImageStyle('left')} className="image-option-btn">
                  <div className="option-preview">
                    <img src={currentImage} alt="Preview" style={{float: 'left', width: '30px', height: '30px', margin: '0 5px 5px 0'}} />
                    <span>Text wrapping around the image on the right side.</span>
                  </div>
                  <span>Left Wrap</span>
                </button>
                
                <button onClick={() => applyImageStyle('right')} className="image-option-btn">
                  <div className="option-preview">
                    <img src={currentImage} alt="Preview" style={{float: 'right', width: '30px', height: '30px', margin: '0 0 5px 5px'}} />
                    <span>Text wrapping around the image on the left side.</span>
                  </div>
                  <span>Right Wrap</span>
                </button>
                
                <button onClick={() => applyImageStyle('center')} className="image-option-btn">
                  <div className="option-preview">
                    <div style={{textAlign: 'center'}}>
                      <img src={currentImage} alt="Preview" style={{width: '40px', height: '30px', display: 'inline-block'}} />
                    </div>
                    <span>Centered with text above and below</span>
                  </div>
                  <span>Centered</span>
                </button>
                
                <button onClick={() => applyImageStyle('break')} className="image-option-btn">
                  <div className="option-preview">
                    <div style={{width: '100%', textAlign: 'center'}}>
                      <img src={currentImage} alt="Preview" style={{width: '40px', height: '30px'}} />
                    </div>
                    <span>Full width break</span>
                  </div>
                  <span>Break</span>
                </button>
              </div>
              <button onClick={closeImageOptions} className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlog;