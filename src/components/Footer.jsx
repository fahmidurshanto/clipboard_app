import React from 'react';
import { useClipboardStore } from '../store/clipboardStore';

const API_BASE = 'http://localhost:3001';

const Footer = () => {
  const { items, clearAll } = useClipboardStore();
  
  const handleClear = async () => {
    try {
      await fetch(`${API_BASE}/clear`, { method: 'POST' });
      clearAll();
    } catch (err) {
      console.error('Clear Error:', err);
    }
  };

  return (
    <div className="footer">
      <button className="clear-btn" onClick={handleClear}>Clear All</button>
      <span>{items.length} items</span>
    </div>
  );
};

export default Footer;
