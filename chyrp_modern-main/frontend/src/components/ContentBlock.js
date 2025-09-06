import React, { useRef } from 'react';

const ContentBlock = ({ block, updateContent, updateFile, onRemove }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      updateFile(block.id, file, previewUrl);
    }
  };

  const renderBlock = () => {
    switch (block.type) {
      case 'text':
        return (
          <textarea
            className="form-input textarea"
            value={block.content}
            onChange={(e) => updateContent(block.id, e.target.value)}
            placeholder="Enter your text here..."
            style={{ height: '100%', width: '100%', resize: 'none' }}
          />
        );
      
      case 'image':
        return (
          <div className="image-block" style={{ height: '100%' }}>
            {block.previewUrl ? (
              <div className="image-preview" style={{ height: '100%' }}>
                <img 
                  src={block.previewUrl} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain' 
                  }} 
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="image-upload" style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  Upload Image
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <input
              type="text"
              className="form-input"
              value={block.content}
              onChange={(e) => updateContent(block.id, e.target.value)}
              placeholder="Image caption (optional)"
              style={{ marginTop: '10px' }}
            />
          </div>
        );
      
      case 'video':
        return (
          <div className="video-block" style={{ height: '100%' }}>
            {block.previewUrl ? (
              <div className="video-preview" style={{ height: '100%' }}>
                <video 
                  controls 
                  src={block.previewUrl} 
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary"
                  style={{ position: 'absolute', bottom: '10px', right: '10px' }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="video-upload" style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary"
                >
                  Upload Video
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              style={{ display: 'none' }}
            />
            <input
              type="text"
              className="form-input"
              value={block.content}
              onChange={(e) => updateContent(block.id, e.target.value)}
              placeholder="Video caption (optional)"
              style={{ marginTop: '10px' }}
            />
          </div>
        );
      
      case 'code':
        return (
          <div className="code-block" style={{ height: '100%' }}>
            <textarea
              className="form-input textarea code-textarea"
              value={block.content}
              onChange={(e) => updateContent(block.id, e.target.value)}
              placeholder="Enter your code here..."
              style={{ height: '100%', width: '100%', resize: 'none' }}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="content-block" data-type={block.type} style={{ height: '100%' }}>
      <div className="block-header">
	<div className="drag-handle" title="Drag to move">
        <span className="block-type">{block.type.toUpperCase()}</span>
        <button type="button" onClick={onRemove} className="btn-remove">
          &times;
        </button>
	</div>
      </div>
      <div style={{ height: 'calc(100% - 40px)' }}>
        {renderBlock()}
      </div>
    </div>
  );
};

export default ContentBlock;