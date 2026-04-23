import { create } from 'zustand';

export const useClipboardStore = create((set) => ({
  items: [],
  searchQuery: '',
  setItems: (items) => set({ items }),
  addItem: (item) => set((state) => {
    // Deduplicate if needed (though main process handles it)
    const exists = state.items.find(i => i.id === item.id);
    if (exists) return state;
    return { items: [item, ...state.items] };
  }),
  deleteItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),
  togglePin: (id) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, pinned: !i.pinned } : i)
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearAll: () => set((state) => ({
    items: state.items.filter(i => i.pinned)
  })),
}));
