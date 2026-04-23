import React from 'react';
import { useClipboardStore } from '../store/clipboardStore';

const Footer = () => {
  const { items, clearAll } = useClipboardStore();
  
  const handleClear = () => {
    window.clipboardAPI.clearAll();
    clearAll();
  };

  return (
    <div className="footer">
      <button className="clear-btn" onClick={handleClear}>Clear All</button>
      <span>{items.length} items</span>
    </div>
  );
};

export default Footer;
