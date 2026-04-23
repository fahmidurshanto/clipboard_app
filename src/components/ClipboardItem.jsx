import React from 'react';
import { Clipboard, Pin, Trash2, Copy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ClipboardItem = ({ item, onCopy, onDelete, onTogglePin }) => {
  return (
    <div 
      className={`item-card ${item.pinned ? 'pinned' : ''}`}
      onClick={() => onCopy(item.content)}
    >
      <div className="item-icon">
        {item.type === 'image' ? <Copy size={18} /> : <Clipboard size={18} />}
      </div>
      <div className="item-main">
        {item.type === 'image' ? (
          <div className="image-preview-container">
            <img src={item.content} alt="clipboard-content" className="image-preview" />
          </div>
        ) : (
          <div className="item-text">{item.content}</div>
        )}
        <div className="item-meta">
          {formatDistanceToNow(item.timestamp, { addSuffix: true })}
        </div>
      </div>
      <div className="item-actions">
        <button 
          className={`action-btn pin ${item.pinned ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onTogglePin(item.id); }}
        >
          <Pin size={14} fill={item.pinned ? "currentColor" : "none"} />
        </button>
        <button 
          className="action-btn"
          onClick={(e) => { e.stopPropagation(); onCopy(item.content); }}
        >
          <Copy size={14} />
        </button>
        <button 
          className="action-btn delete"
          onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default ClipboardItem;
