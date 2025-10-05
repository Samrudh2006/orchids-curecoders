import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Bookmark {
  id: string;
  title: string;
  query: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  lastAccessed?: Date;
  isFavorite: boolean;
  category: 'market' | 'patent' | 'clinical' | 'competitive' | 'general';
  agentResults?: any;
  thumbnail?: string;
}

interface BookmarksContextType {
  bookmarks: Bookmark[];
  favorites: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => string;
  removeBookmark: (id: string) => void;
  toggleFavorite: (id: string) => void;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  getBookmarksByCategory: (category: string) => Bookmark[];
  getBookmarksByTag: (tag: string) => Bookmark[];
  searchBookmarks: (query: string) => Bookmark[];
  clearAllBookmarks: () => void;
  exportBookmarks: () => void;
  importBookmarks: (bookmarks: Bookmark[]) => void;
}

const BookmarksContext = createContext<BookmarksContextType | undefined>(undefined);

const STORAGE_KEY = 'curecoders_bookmarks';

export const BookmarksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  // Load bookmarks from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const processedBookmarks = parsed.map((bookmark: any) => ({
          ...bookmark,
          createdAt: new Date(bookmark.createdAt),
          lastAccessed: bookmark.lastAccessed ? new Date(bookmark.lastAccessed) : undefined
        }));
        setBookmarks(processedBookmarks);
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, [bookmarks]);

  const addBookmark = useCallback((bookmarkData: Omit<Bookmark, 'id' | 'createdAt'>): string => {
    const id = `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newBookmark: Bookmark = {
      ...bookmarkData,
      id,
      createdAt: new Date()
    };

    setBookmarks(prev => [newBookmark, ...prev]);
    return id;
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.id === id
          ? { ...bookmark, isFavorite: !bookmark.isFavorite, lastAccessed: new Date() }
          : bookmark
      )
    );
  }, []);

  const updateBookmark = useCallback((id: string, updates: Partial<Bookmark>) => {
    setBookmarks(prev =>
      prev.map(bookmark =>
        bookmark.id === id
          ? { ...bookmark, ...updates, lastAccessed: new Date() }
          : bookmark
      )
    );
  }, []);

  const getBookmarksByCategory = useCallback((category: string) => {
    return bookmarks.filter(bookmark => bookmark.category === category);
  }, [bookmarks]);

  const getBookmarksByTag = useCallback((tag: string) => {
    return bookmarks.filter(bookmark => 
      bookmark.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  }, [bookmarks]);

  const searchBookmarks = useCallback((query: string) => {
    const searchTerm = query.toLowerCase();
    return bookmarks.filter(bookmark =>
      bookmark.title.toLowerCase().includes(searchTerm) ||
      bookmark.query.toLowerCase().includes(searchTerm) ||
      bookmark.description?.toLowerCase().includes(searchTerm) ||
      bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }, [bookmarks]);

  const clearAllBookmarks = useCallback(() => {
    if (window.confirm('Are you sure you want to delete all bookmarks? This action cannot be undone.')) {
      setBookmarks([]);
    }
  }, []);

  const exportBookmarks = useCallback(() => {
    try {
      const dataStr = JSON.stringify(bookmarks, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `curecoders-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting bookmarks:', error);
    }
  }, [bookmarks]);

  const importBookmarks = useCallback((importedBookmarks: Bookmark[]) => {
    try {
      // Process imported bookmarks to ensure proper format
      const processedBookmarks = importedBookmarks.map(bookmark => ({
        ...bookmark,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(bookmark.createdAt),
        lastAccessed: bookmark.lastAccessed ? new Date(bookmark.lastAccessed) : undefined
      }));

      setBookmarks(prev => [...processedBookmarks, ...prev]);
    } catch (error) {
      console.error('Error importing bookmarks:', error);
    }
  }, []);

  const favorites = bookmarks.filter(bookmark => bookmark.isFavorite);

  const value: BookmarksContextType = {
    bookmarks,
    favorites,
    addBookmark,
    removeBookmark,
    toggleFavorite,
    updateBookmark,
    getBookmarksByCategory,
    getBookmarksByTag,
    searchBookmarks,
    clearAllBookmarks,
    exportBookmarks,
    importBookmarks
  };

  return (
    <BookmarksContext.Provider value={value}>
      {children}
    </BookmarksContext.Provider>
  );
};

export const useBookmarks = (): BookmarksContextType => {
  const context = useContext(BookmarksContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarksProvider');
  }
  return context;
};