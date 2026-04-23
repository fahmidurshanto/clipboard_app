import React from 'react';
import { Search } from 'lucide-react';
import { useClipboardStore } from '../store/clipboardStore';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useClipboardStore();

  return (
    <div className="header">
      <div className="search-container">
        <Search className="search-icon" size={16} />
        <input 
          type="text" 
          placeholder="Search history..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>
    </div>
  );
};

export default SearchBar;
