import React, { useEffect, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import ClipboardItem from './components/ClipboardItem';
import Footer from './components/Footer';
import { useClipboardStore } from './store/clipboardStore';
import { Pin, History } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

const App = () => {
  const { items, setItems, addItem, deleteItem, togglePin, searchQuery } = useClipboardStore();

  const loadData = async () => {
    try {
      const response = await fetch(`${API_BASE}/history`);
      const data = await response.json();
      setItems(data || []);
    } catch (err) {
      console.error('❌ [UI] Failed to fetch from Express:', err);
    }
  };

  useEffect(() => {
    // Initial Load from Express
    loadData();

    // Listen for real-time push from Electron (Fastest)
    if (window.clipboardAPI) {
      window.clipboardAPI.onUpdate((newItem) => {
        addItem(newItem);
      });

      window.clipboardAPI.onShown(() => {
        loadData();
      });
    } else {
      // Fallback: Poll every 1s if IPC is missing
      const poll = setInterval(loadData, 1000);
      return () => clearInterval(poll);
    }
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    const safeItems = Array.isArray(items) ? items : [];
    return safeItems.filter(item => {
      if (!item) return false;
      if (item.type === 'image') return query === '' || 'image'.includes(query);
      return item.content && item.content.toLowerCase().includes(query);
    });
  }, [items, searchQuery]);

  const pinnedItems = filteredItems.filter(item => item.pinned);
  const recentItems = filteredItems.filter(item => !item.pinned);

  const handleCopy = async (content) => {
    try {
      await fetch(`${API_BASE}/copy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
    } catch (err) {
      console.error('Copy Error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      deleteItem(id);
    } catch (err) {
      console.error('Delete Error:', err);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await fetch(`${API_BASE}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      togglePin(id);
    } catch (err) {
      console.error('Pin Error:', err);
    }
  };

  return (
    <div className="app-container">
      <SearchBar />
      
      <div className="content">
        {pinnedItems.length > 0 && (
          <div className="section">
            <div className="section-title">
              <Pin size={12} /> Pinned
            </div>
            {pinnedItems.map(item => (
              <ClipboardItem 
                key={item.id} 
                item={item} 
                onCopy={handleCopy}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))}
          </div>
        )}

        <div className="section">
          <div className="section-title">
            <History size={12} /> Recent
          </div>
          {recentItems.length > 0 ? (
            recentItems.map(item => (
              <ClipboardItem 
                key={item.id} 
                item={item} 
                onCopy={handleCopy}
                onDelete={handleDelete}
                onTogglePin={handleTogglePin}
              />
            ))
          ) : (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              {searchQuery ? 'No matches found' : 'Clipboard is empty'}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
