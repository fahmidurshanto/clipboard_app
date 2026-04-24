import fs from 'fs';
import path from 'path';
import { app } from 'electron';

// Use a safe, writable path on Linux
let DATA_PATH = '';
try {
  DATA_PATH = path.join(app.getPath('userData'), 'clipboard_history.json');
} catch (e) {
  DATA_PATH = path.join(process.cwd(), 'clipboard_history.json');
}

const MAX_ITEMS = 100;

class Storage {
  constructor() {
    this.history = [];
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DATA_PATH)) {
        const data = fs.readFileSync(DATA_PATH, 'utf-8');
        this.history = JSON.parse(data);
        console.log(`💾 [STORAGE] Loaded ${this.history.length} items from disk.`);
        return;
      }
    } catch (e) {
      console.error('❌ [STORAGE] Failed to load history:', e.message);
    }
    this.history = [];
    console.log('💾 [STORAGE] No history found, starting fresh.');
  }

  save() {
    try {
      fs.writeFileSync(DATA_PATH, JSON.stringify(this.history, null, 2));
      console.log(`💾 [STORAGE] Saved ${this.history.length} items to disk.`);
    } catch (e) {
      console.error('❌ [STORAGE] Failed to save history:', e.message);
    }
  }

  getHistory() {
    return this.history;
  }

  addItem(itemData) {
    const { type, content } = itemData;

    // Prevent duplicates at the top
    if (this.history.length > 0 && this.history[0].content === content) {
      return this.history[0];
    }

    const newItem = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      type: type || 'text',
      content,
      timestamp: Date.now(),
      pinned: false,
    };

    this.history.unshift(newItem);

    // Enforce limit
    if (this.history.length > MAX_ITEMS) {
      const pinned = this.history.filter(i => i.pinned);
      const unpinned = this.history.filter(i => !i.pinned);
      this.history = [...pinned, ...unpinned.slice(0, MAX_ITEMS - pinned.length)];
    }

    this.save();
    return newItem;
  }

  deleteItem(id) {
    this.history = this.history.filter(i => i.id !== id);
    this.save();
  }

  togglePin(id) {
    const item = this.history.find(i => i.id === id);
    if (item) {
      item.pinned = !item.pinned;
      this.save();
    }
  }

  clearAll() {
    this.history = this.history.filter(i => i.pinned);
    this.save();
  }
}

export const storage = new Storage();
